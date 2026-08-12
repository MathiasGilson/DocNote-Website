#!/usr/bin/env node
/**
 * Generate unified DocNote team portraits via OpenRouter Nano Banana 2.
 * Model: google/gemini-3.1-flash-image
 *
 * Usage:
 *   OPEN_ROUTER_API_KEY=… node scripts/generate-team-portraits.mjs --pilot
 *   OPEN_ROUTER_API_KEY=… node scripts/generate-team-portraits.mjs --all
 *   OPEN_ROUTER_API_KEY=… node scripts/generate-team-portraits.mjs --only=vincentTan,aliceGilson
 *
 * Cap: roster size only (9). Never unbounded.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/images/team');
const IMG_DIR = path.join(ROOT, 'public/images');

const API_KEY = process.env.OPEN_ROUTER_API_KEY;
if (!API_KEY) {
  console.error('ERROR: OPEN_ROUTER_API_KEY is not set.');
  process.exit(1);
}

const MODEL = process.env.IMAGE_MODEL || 'google/gemini-3.1-flash-image';
const API_URL = 'https://openrouter.ai/api/v1/images';

const MEMBERS = [
  {
    id: 'vincentTan',
    file: 'vincent-tan.jpg',
    ref: 'dr_vincent_tan.jpg',
    name: 'Dr. Vincent Tan',
    attire:
      'white medical lab coat over a light blue button-down shirt, stethoscope around neck (match the reference closely)',
  },
  {
    id: 'aliceGilson',
    file: 'alice-gilson.jpg',
    ref: 'dre_alice_gilson.jpg',
    name: 'Dr. Alice Gilson',
    attire:
      'white medical lab coat or white V-neck medical top matching the reference, blue stethoscope around neck as in the reference',
    likenessLock:
      'CRITICAL LIKENESS LOCK: keep the EXACT same face as the reference — same age (young adult / late 20s), same bone structure, same eye shape and spacing, same thick dark brows, same nose, same wide genuine smile and tooth shape, same warm skin tone, same long dark brown wavy hair with the same parting and fall over the shoulders. Do NOT age her up. Do NOT beautify into a different person. Do NOT change ethnicity or facial identity.',
    resolution: '2K',
  },
  {
    id: 'mathiasGilson',
    file: 'mathias-gilson.jpg',
    ref: 'mathias_gilson.png',
    name: 'Mathias Gilson',
    attire: 'dark navy suit jacket over a crisp white open-collar dress shirt, no tie',
  },
  {
    id: 'jeremyYvinec',
    file: 'jeremy-yvinec.jpg',
    ref: 'jeremy_yvinec.jpg',
    name: 'Jeremy Yvinec',
    attire: 'charcoal suit jacket over a light blue dress shirt, no tie',
  },
  {
    id: 'hugoRoussel',
    file: 'hugo-roussel.jpg',
    ref: 'hugo_roussel.jpg',
    name: 'Hugo Roussel',
    attire: 'navy blazer over a white dress shirt, no tie',
  },
  {
    id: 'ericWei',
    file: 'eric-wei.jpg',
    ref: 'eric_wei.jpg',
    name: 'Eric Wei',
    attire: 'dark grey suit jacket over a soft blue dress shirt, no tie',
  },
  {
    id: 'nedimAmer',
    file: 'nedim-amer.jpg',
    ref: 'nedim_amer.jpg',
    name: 'Nedim Amer',
    attire: 'navy suit with a white dress shirt, subtle professional look',
  },
  {
    id: 'valeryDemunck',
    file: 'valery-demunck.jpg',
    ref: 'valery_demunck.jpg',
    name: 'Valery Demunck',
    attire: 'charcoal suit jacket over a light grey dress shirt, no tie',
  },
  {
    id: 'julietteKristanek',
    file: 'juliette-kristanek.jpg',
    ref: 'juliette_kristanek.jpg',
    name: 'Juliette Kristanek',
    attire: 'tailored navy blazer over a cream blouse, professional and polished',
  },
];

const MAX_ROSTER = MEMBERS.length;

const args = process.argv.slice(2);
const pilot = args.includes('--pilot');
const all = args.includes('--all');
const onlyArg = args.find((a) => a.startsWith('--only='));
const onlyIds = onlyArg ? onlyArg.slice(7).split(',').filter(Boolean) : null;
const dryRun = args.includes('--dry-run');

function selectMembers() {
  if (pilot) return MEMBERS.slice(0, 1);
  if (onlyIds) {
    const selected = MEMBERS.filter((m) => onlyIds.includes(m.id));
    if (selected.length === 0) {
      console.error('No matching --only ids. Valid:', MEMBERS.map((m) => m.id).join(', '));
      process.exit(1);
    }
    return selected;
  }
  if (all) return MEMBERS;
  console.error('Specify --pilot, --all, or --only=id1,id2');
  process.exit(1);
}

function toDataUrl(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function buildPrompt(member) {
  const subject = member.promptOnly
    ? `Professional corporate headshot portrait of ${member.name}: ${member.likeness}.`
    : `Professional corporate headshot portrait of the same person shown in the reference photo. Preserve exact facial likeness, age, hair, skin tone, and expression character from the reference.

IMPORTANT: The reference may be soft or low-detail. Do NOT copy softness, grain, JPEG blocks, or upscaling artifacts. Reconstruct a crisp native high-resolution studio portrait: sharp eyes with clear catchlights, defined individual hair strands, natural skin micro-texture, clean fabric weave on clothing, and a clean backdrop. Output must look like a fresh 85mm f/2 studio photo, not an enlarged web thumbnail.`;

  const likenessExtra = member.likenessLock ? `\n\n${member.likenessLock}` : '';

  return `${subject}${likenessExtra}

Attire: ${member.attire}.

Composition: vertical 3:4 head-and-shoulders framing, subject centered, looking at camera, friendly professional expression.
Background: soft muted dusty blue-grey studio backdrop with subtle texture (match DocNote medical brand look).
Lighting: soft even studio lighting, natural catchlights, no harsh shadows.
Style: real handheld DSLR / mirrorless corporate photo — NOT an AI beauty filter, NOT a stock-avatar look. Visible natural skin pores and slight uneven tone, subtle under-eye texture, realistic hair flyaways, fabric wrinkles, mild asymmetric smile. Prefer documentary realism over glamour retouching.

CRITICAL: avoid waxy/plastic skin, over-symmetric faces, porcelain smoothing, CGI catchlights, or uncanny “LinkedIn AI headshot” look. Keep likeness locked to the reference person.
Strict: no text, no watermark, no logo, no name overlay, no props besides attire accessories already described.`;
}

async function generateOne(member) {
  const body = {
    model: MODEL,
    prompt: buildPrompt(member),
    aspect_ratio: '3:4',
    resolution: member.resolution || '2K',
    n: 1,
  };

  if (!member.promptOnly) {
    const refPath = path.join(IMG_DIR, member.ref);
    if (!fs.existsSync(refPath)) {
      throw new Error(`Missing reference: ${refPath}`);
    }
    body.input_references = [
      {
        type: 'image_url',
        image_url: { url: toDataUrl(refPath) },
      },
    ];
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://docnote.ch',
      'X-Title': 'DocNote Team Portraits',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${text.slice(0, 800)}`);
  }

  const data = JSON.parse(text);
  const item = data.data?.[0];
  if (!item?.b64_json) {
    throw new Error(`No image in response: ${text.slice(0, 500)}`);
  }

  const outPath = path.join(OUT_DIR, member.file);
  fs.writeFileSync(outPath, Buffer.from(item.b64_json, 'base64'));
  const cost = data.usage?.cost ?? null;
  return { outPath, cost, usage: data.usage };
}

async function main() {
  const selected = selectMembers();
  if (selected.length > MAX_ROSTER) {
    console.error(`Refusing: ${selected.length} > roster cap ${MAX_ROSTER}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Model: ${MODEL}`);
  console.log(`Members: ${selected.length}/${MAX_ROSTER} (cap=${MAX_ROSTER})`);
  console.log(`Out: ${OUT_DIR}`);

  if (dryRun) {
    selected.forEach((m) => console.log(`  would generate ${m.id} → ${m.file}`));
    return;
  }

  let totalCost = 0;
  for (const member of selected) {
    process.stdout.write(`Generating ${member.id}… `);
    try {
      const result = await generateOne(member);
      if (typeof result.cost === 'number') totalCost += result.cost;
      console.log(`OK → ${path.relative(ROOT, result.outPath)} cost=${result.cost ?? '?'}`);
    } catch (err) {
      console.log('FAIL');
      console.error(`  ${err.message}`);
      process.exitCode = 1;
      break;
    }
  }
  console.log(`Done. Estimated cost sum: $${totalCost.toFixed(4)}`);
}

main();
