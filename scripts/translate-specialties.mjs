#!/usr/bin/env node
/** Translate survey specialty labels into Record Meeting locales via DeepSeek. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '..', 'src/data/survey-specialties.json');
const API_KEY = process.env.OPEN_ROUTER_API_KEY;
const MODEL = process.env.TRANSLATE_MODEL || 'deepseek/deepseek-chat-v3-0324';
const LOCALES = ['ar', 'es', 'hi', 'it', 'ja', 'ko', 'nl', 'no', 'pt', 'ru', 'sv', 'th', 'zh'];
const NAMES = {
  ar: 'Arabic', es: 'Spanish', hi: 'Hindi', it: 'Italian', ja: 'Japanese',
  ko: 'Korean', nl: 'Dutch', no: 'Norwegian', pt: 'Portuguese', ru: 'Russian',
  sv: 'Swedish', th: 'Thai', zh: 'Chinese (Simplified)',
};

if (!API_KEY) {
  console.error('OPEN_ROUTER_API_KEY required');
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const enMap = Object.fromEntries(rows.map((r) => [r.value, r.en]));

async function translateLocale(locale) {
  const missing = rows.filter((r) => !r[locale]).map((r) => r.value);
  if (!missing.length) {
    console.log(`[${locale}] up to date`);
    return 0;
  }
  const payload = Object.fromEntries(missing.map((v) => [v, enMap[v]]));
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `Translate medical specialty names from English to ${NAMES[locale]}. Output ONLY a JSON object mapping the same keys to translated labels. Keep common Latin medical terms when used in ${NAMES[locale]}.`,
        },
        { role: 'user', content: JSON.stringify(payload, null, 2) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`${locale}: ${res.status} ${await res.text()}`);
  let content = (await res.json()).choices[0].message.content.trim();
  if (content.startsWith('```')) content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const translated = JSON.parse(content);
  for (const row of rows) {
    if (translated[row.value]) row[locale] = translated[row.value];
  }
  console.log(`[${locale}] ${missing.length} labels`);
  return 1;
}

const only = process.argv.includes('--dry-run');
if (only) {
  console.log('Would translate', LOCALES.join(', '), '×', rows.length, 'specialties');
  process.exit(0);
}

let calls = 0;
for (const locale of LOCALES) {
  calls += await translateLocale(locale);
}
fs.writeFileSync(FILE, JSON.stringify(rows, null, 2) + '\n');
console.log(`Done. API calls: ${calls}`);
