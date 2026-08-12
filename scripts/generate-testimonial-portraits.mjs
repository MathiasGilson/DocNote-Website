#!/usr/bin/env node
/**
 * Regenerate DocNote testimonial portraits via OpenRouter Nano Banana 2.
 * Model: google/gemini-3.1-flash-image
 *
 * Usage:
 *   OPEN_ROUTER_API_KEY=… node scripts/generate-testimonial-portraits.mjs --all
 *   OPEN_ROUTER_API_KEY=… node scripts/generate-testimonial-portraits.mjs --only=patel
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'public/images');
const OUT_DIR = path.join(IMG_DIR, 'testimonials');

const API_KEY = process.env.OPEN_ROUTER_API_KEY;
if (!API_KEY) {
  console.error('ERROR: OPEN_ROUTER_API_KEY is not set.');
  process.exit(1);
}

const MODEL = process.env.IMAGE_MODEL || 'google/gemini-3.1-flash-image';
const API_URL = 'https://openrouter.ai/api/v1/images';

const PEOPLE = [
  {
    id: 'perrot',
    file: 'perrot.jpg',
    ref: 'perrot.png',
    name: 'Dre Perrot',
    attire:
      'white medical lab coat over a soft blue top, professional hospital look, no stethoscope required',
  },
  {
    id: 'patel',
    file: 'patel.jpg',
    ref: 'patel.jpg',
    name: 'Dr Patel',
    attire:
      'white medical lab coat over a light blue dress shirt, short dark beard, glasses if present in the reference',
  },
  {
    id: 'ris',
    file: 'ris.jpg',
    ref: 'ris.png',
    name: 'Pr Ris',
    attire:
      'white medical lab coat or professional clinical attire matching the reference, senior surgeon look',
  },
];

const args = process.argv.slice(2);
const all = args.includes('--all');
const onlyArg = args.find((a) => a.startsWith('--only='));
const onlyIds = onlyArg ? onlyArg.slice(7).split(',').filter(Boolean) : null;
const dryRun = args.includes('--dry-run');

function selectPeople() {
  if (onlyIds) {
    const selected = PEOPLE.filter((p) => onlyIds.includes(p.id));
    if (selected.length === 0) {
      console.error('No matching --only ids. Valid:', PEOPLE.map((p) => p.id).join(', '));
      process.exit(1);
    }
    return selected;
  }
  if (all) return PEOPLE;
  console.error('Specify --all or --only=id1,id2');
  process.exit(1);
}

function toDataUrl(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function buildPrompt(person) {
  return `Professional medical headshot portrait of the same person shown in the reference photo. Preserve exact facial likeness, age, hair, skin tone, glasses if any, and expression character from the reference.

IMPORTANT: The reference may be soft or low-detail. Do NOT copy softness, grain, JPEG blocks, or upscaling artifacts. Reconstruct a crisp native high-resolution studio portrait: sharp eyes with clear catchlights, defined individual hair strands, natural skin micro-texture, clean fabric weave on clothing, and a clean backdrop. Output must look like a fresh 85mm f/2 studio photo, not an enlarged web thumbnail.

Subject: ${person.name}.
Attire: ${person.attire}.

Composition: square 1:1 head-and-shoulders framing, subject centered, looking at camera, friendly professional expression. Leave comfortable headroom for circular crop.
Background: soft muted dusty blue-grey studio backdrop with subtle texture (DocNote medical brand look).
Lighting: soft even studio lighting, natural catchlights, no harsh shadows.
Style: high-end medical startup photography, photorealistic, ultra-sharp facial detail, clean color grading.

CRITICAL anatomy: perfectly symmetric eyes, clear pupils and iris detail, natural mouth with individually defined teeth if smiling, anatomically correct nose and lips, natural skin micro-texture (not plastic). No melted features, no warped smile, no extra fingers.
Strict: no text, no watermark, no logo, no name overlay.`;
}

async function generateOne(person) {
  const refPath = path.join(IMG_DIR, person.ref);
  if (!fs.existsSync(refPath)) {
    throw new Error(`Missing reference: ${refPath}`);
  }

  const body = {
    model: MODEL,
    prompt: buildPrompt(person),
    aspect_ratio: '1:1',
    resolution: '2K',
    n: 1,
    input_references: [
      {
        type: 'image_url',
        image_url: { url: toDataUrl(refPath) },
      },
    ],
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://docnote.ch',
      'X-Title': 'DocNote Testimonial Portraits',
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

  const outPath = path.join(OUT_DIR, person.file);
  fs.writeFileSync(outPath, Buffer.from(item.b64_json, 'base64'));
  return { outPath, cost: data.usage?.cost ?? null };
}

async function main() {
  const selected = selectPeople();
  if (selected.length > PEOPLE.length) {
    console.error('Refusing unbounded generation');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Model: ${MODEL}`);
  console.log(`People: ${selected.length}/${PEOPLE.length}`);
  console.log(`Out: ${OUT_DIR}`);

  if (dryRun) {
    selected.forEach((p) => console.log(`  would generate ${p.id} → ${p.file}`));
    return;
  }

  let totalCost = 0;
  for (const person of selected) {
    process.stdout.write(`Generating ${person.id}… `);
    try {
      const result = await generateOne(person);
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
