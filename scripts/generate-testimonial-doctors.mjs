#!/usr/bin/env node
/**
 * Generate DocNote testimonial doctor portraits (Nano Banana 2).
 * Cap: 12 portraits max per run. Prompts intentionally diverge so faces don't look alike.
 *
 * Usage:
 *   OPEN_ROUTER_API_KEY=… node scripts/generate-testimonial-doctors.mjs --all
 *   OPEN_ROUTER_API_KEY=… node scripts/generate-testimonial-doctors.mjs --only=moreau,keller
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/images/testimonials');

const API_KEY = process.env.OPEN_ROUTER_API_KEY;
if (!API_KEY) {
  console.error('ERROR: OPEN_ROUTER_API_KEY is not set.');
  process.exit(1);
}

const MODEL = process.env.IMAGE_MODEL || 'google/gemini-3.1-flash-image';
const API_URL = 'https://openrouter.ai/api/v1/images';
const MAX = 12;

const PEOPLE = [
  {
    id: 'moreau',
    file: 'moreau.jpg',
    prompt:
      'Photorealistic portrait of a unique French woman ~34, oval face, high cheekbones, warm olive-fair skin, auburn hair in a loose low bun with flyaways, hazel eyes, soft closed-lip smile, slight 3/4 turn to camera left',
    attire: 'open white lab coat over a terracotta blouse, no stethoscope',
    background: 'warm cream plaster wall with soft window light from the left',
    lighting: 'natural side window light, gentle shadows, editorial medical magazine look',
  },
  {
    id: 'keller',
    file: 'keller.jpg',
    prompt:
      'Photorealistic portrait of a unique Swiss man ~42, square jaw, cool fair skin, short sandy-blond hair with a widow peak, steel-blue eyes, light stubble, serious calm expression (not smiling), facing camera straight-on',
    attire: 'navy V-neck scrub top under an open white coat, blue stethoscope around neck',
    background: 'cool slate-blue hospital corridor bokeh, out of focus',
    lighting: 'bright clinical overhead light mixed with cool fill, crisp and sharp',
  },
  {
    id: 'rossi',
    file: 'rossi.jpg',
    prompt:
      'Photorealistic portrait of a unique Italian man ~49, broader face, deep tan Mediterranean skin, thick dark hair with silver temples, full salt-and-pepper beard, brown eyes, confident half-smile, chin slightly raised',
    attire: 'charcoal surgical scrub top only (no lab coat), hospital ID badge clip visible on pocket',
    background: 'muted sage-green OR wall, shallow depth of field',
    lighting: 'warm overhead OR lamps, slightly dramatic but still professional',
  },
  {
    id: 'nguyen',
    file: 'nguyen.jpg',
    prompt:
      'Photorealistic portrait of a unique Vietnamese woman ~29, round youthful face, light golden skin, straight black bob with bangs, dark brown eyes, bright wide smile showing teeth, playful energy',
    attire: 'pastel pink scrub top, colorful pediatric stethoscope with animal charm around neck, no lab coat',
    background: 'soft peach and white pediatric clinic wall with faint murals blurred',
    lighting: 'bright cheerful softbox lighting, airy and high-key',
  },
  {
    id: 'berg',
    file: 'berg.jpg',
    prompt:
      'Photorealistic portrait of a unique Swedish woman ~38, long narrow face, pale porcelain skin with freckles across nose, platinum blonde hair slicked into a tight ponytail, icy blue eyes, minimal makeup, composed almost stern expression',
    attire: 'dark teal scrub cap pushed back on head, matching teal scrub top, no lab coat, no stethoscope',
    background: 'sterile white OR / anesthesia bay, slightly overexposed whites',
    lighting: 'harsh clean surgical lighting, cool color temperature',
  },
  {
    id: 'dubois',
    file: 'dubois.jpg',
    prompt:
      'Photorealistic portrait of a unique French man ~45, thin face, pale skin, tightly curled short black hair, thick black rectangular glasses, pencil mustache, thoughtful closed-mouth smile, looking slightly past camera',
    attire: 'black turtleneck under a white lab coat, reading glasses style frames',
    background: 'dim radiology reading room with faint blue monitor glow in the blur',
    lighting: 'low-key with cool blue rim light from screens, face softly lit from front',
  },
  {
    id: 'hoffmann',
    file: 'hoffmann.jpg',
    prompt:
      'Photorealistic portrait of a unique German woman ~54, soft rounded face, fair rosy skin, short silver-ash pixie cut, green-grey eyes, kind crow feet smile, approachable grandmotherly warmth without looking elderly caricature',
    attire: 'lavender cardigan over a white blouse, thin gold necklace, no lab coat',
    background: 'soft beige library / consultation room bookshelves blurred',
    lighting: 'warm afternoon tungsten light, gentle and flattering',
  },
  {
    id: 'silva',
    file: 'silva.jpg',
    prompt:
      'Photorealistic portrait of a unique Brazilian-Portuguese man ~33, diamond face shape, rich brown skin, tight black curls cropped short, full beard neatly shaped, warm brown eyes, big friendly grin, energetic vibe',
    attire: 'sky-blue scrub top, bright yellow stethoscope, no lab coat',
    background: 'sunny outdoor hospital courtyard green foliage bokeh',
    lighting: 'golden hour sunlight, natural outdoor portrait',
  },
  {
    id: 'andersson',
    file: 'andersson.jpg',
    prompt:
      'Photorealistic portrait of a unique Swedish woman ~27, heart-shaped face, fair skin with many freckles, long strawberry-blonde wavy hair over one shoulder, blue-green eyes, bright toothy smile, youthful',
    attire: 'white ENT clinic coat over a patterned floral blouse, small hoop earrings',
    background: 'bright white clinic with soft cyan accent wall',
    lighting: 'clean high-key studio light, fresh and airy',
  },
  {
    id: 'lefevre',
    file: 'lefevre.jpg',
    prompt:
      'Photorealistic portrait of a unique French man ~52, long rectangular face, olive skin, receding salt-and-pepper hairline, trimmed grey goatee, deep-set brown eyes, quiet attentive expression, slight head tilt',
    attire: 'brown corduroy blazer over a cream turtleneck, no medical coat (psychiatrist office look)',
    background: 'dark walnut wood paneling and soft lamp glow, intimate office',
    lighting: 'warm low lamp light from one side, cinematic soft shadows',
  },
  {
    id: 'kowalski',
    file: 'kowalski.jpg',
    prompt:
      'Photorealistic portrait of a unique Polish woman ~44, strong angular face, fair skin, dark brown hair in a messy high bun with grey streaks, intense hazel eyes, tired but determined expression, no smile',
    attire: 'navy ICU scrubs, red stethoscope around neck, slight under-eye fatigue kept natural',
    background: 'busy ICU bay blurred monitors and cables, cool greenish fluorescent cast',
    lighting: 'harsh fluorescent hospital night lighting, documentary realism',
  },
  {
    id: 'yamamoto',
    file: 'yamamoto.jpg',
    prompt:
      'Photorealistic portrait of a unique Japanese man ~48, oval face, light warm skin, neat side-parted black hair with grey temples, thin wire-rim glasses, gentle closed smile, reserved calm presence',
    attire: 'pale grey suit jacket over white shirt (no lab coat), subtle patterned tie',
    background: 'modern glass hospital atrium with soft grey-blue city light',
    lighting: 'soft overcast daylight through glass, even and refined',
  },
];

const args = process.argv.slice(2);
const all = args.includes('--all');
const onlyArg = args.find((a) => a.startsWith('--only='));
const onlyIds = onlyArg ? onlyArg.slice(7).split(',').filter(Boolean) : null;
const dryRun = args.includes('--dry-run');

function selectPeople() {
  let selected = PEOPLE;
  if (onlyIds) {
    selected = PEOPLE.filter((p) => onlyIds.includes(p.id));
    if (selected.length === 0) {
      console.error('No matching ids. Valid:', PEOPLE.map((p) => p.id).join(', '));
      process.exit(1);
    }
  } else if (!all) {
    console.error('Specify --all or --only=id1,id2');
    process.exit(1);
  }
  if (selected.length > MAX) {
    console.error(`Refusing: ${selected.length} > cap ${MAX}`);
    process.exit(1);
  }
  return selected;
}

function buildPrompt(person) {
  return `${person.prompt}.

Attire: ${person.attire}.
Background: ${person.background}.
Lighting: ${person.lighting}.

Composition: square 1:1 head-and-shoulders, leave headroom for circular crop.
IMPORTANT UNIQUENESS: This person must look completely different from a generic stock doctor. Distinct face shape, hair, age cues, and wardrobe. Do NOT use the same dusty blue-grey studio backdrop as other portraits. Do NOT make them look like siblings or clones of each other.
Style: photorealistic editorial portrait, ultra-sharp facial detail, natural skin texture (pores, not plastic).

CRITICAL anatomy: symmetric eyes, clear pupils, natural teeth if smiling, correct hands if visible. No melted features, no text, no watermark, no logo.`;
}

async function generateOne(person) {
  const body = {
    model: MODEL,
    prompt: buildPrompt(person),
    aspect_ratio: '1:1',
    resolution: '2K',
    n: 1,
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://docnote.ch',
      'X-Title': 'DocNote Testimonial Doctors',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`API ${res.status}: ${text.slice(0, 800)}`);

  const data = JSON.parse(text);
  const item = data.data?.[0];
  if (!item?.b64_json) throw new Error(`No image in response: ${text.slice(0, 500)}`);

  const rawPath = path.join(OUT_DIR, `${person.id}.raw.png`);
  const outPath = path.join(OUT_DIR, person.file);
  fs.writeFileSync(rawPath, Buffer.from(item.b64_json, 'base64'));

  try {
    execFileSync(
      'sips',
      ['-Z', '640', '-s', 'format', 'jpeg', '-s', 'formatOptions', '85', rawPath, '--out', outPath],
      { stdio: 'ignore' }
    );
  } finally {
    if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
  }

  return { outPath, cost: data.usage?.cost ?? null };
}

async function main() {
  const selected = selectPeople();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Model: ${MODEL}`);
  console.log(`People: ${selected.length}/${MAX} (cap=${MAX})`);
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
