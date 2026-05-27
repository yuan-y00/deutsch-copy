/**
 * inject-batch-02.mjs — 将 batch-02-data.json 注入 data.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const cards = JSON.parse(readFileSync(join(ROOT, 'data', 'batch-02-data.json'), 'utf8'));

function fmtCard(c) {
  const esc = (s) => String(s).replace(/'/g, "\\'");
  return `    {
      id: '${esc(c.id)}', level: '${esc(c.level)}', batch: '${esc(c.batch)}', category: '${esc(c.category)}', globalOrder: ${c.globalOrder},
      word: '${esc(c.word)}', wordDisplay: '${esc(c.wordDisplay)}', copyText: '${esc(c.copyText)}',
      partOfSpeech: '${esc(c.partOfSpeech)}', article: '${esc(c.article)}', plural: '${esc(c.plural)}',
      shortMeaningZh: '${esc(c.shortMeaningZh)}',
      exampleDe: '${esc(c.exampleDe)}',
      exampleZh: '${esc(c.exampleZh)}',
      wordAudioUrl: '${esc(c.wordAudioUrl)}', meaningAudioUrl: '${esc(c.meaningAudioUrl)}', exampleAudioUrl: '${esc(c.exampleAudioUrl)}',
      wordAudioText: '${esc(c.wordAudioText)}', exampleAudioText: '${esc(c.exampleAudioText)}',
      pronunciationStatus: '${esc(c.pronunciationStatus)}', pronunciationNote: '${esc(c.pronunciationNote)}',
    }`;
}

const block = [
  '',
  '    // ====================================================================',
  '    // 批次 02 — A1 非名词补充词包 (325 张) — DE-0326 to DE-0650',
  '    // ====================================================================',
  '',
  ...cards.map(c => fmtCard(c)),
  '',
].join('\n');

const dataJsPath = join(ROOT, 'js', 'data.js');
let dataJs = readFileSync(dataJsPath, 'utf8');

// Find DE-0325 card and insert after its closing },
const de0325Idx = dataJs.indexOf("id: 'DE-0325'");
if (de0325Idx === -1) {
  console.error('Could not find DE-0325 in data.js');
  process.exit(1);
}

// From DE-0325, find the "    }," that closes this card
const afterDe0325 = dataJs.indexOf('\n    },', de0325Idx);
if (afterDe0325 === -1) {
  console.error('Could not find closing of DE-0325');
  process.exit(1);
}

// Insert after the closing "    },"
const insertPoint = afterDe0325 + '\n    },'.length;

const final = dataJs.substring(0, insertPoint) + block + dataJs.substring(insertPoint);
writeFileSync(dataJsPath, final, 'utf8');

// Verify
const verify = readFileSync(dataJsPath, 'utf8');
const allCards = (verify.match(/id: 'DE-\d{4}'/g) || []);
console.log(`Total cards in data.js: ${allCards.length}`);
console.log(`DE-0326 present: ${verify.includes("id: 'DE-0326'")}`);
console.log(`DE-0650 present: ${verify.includes("id: 'DE-0650'")}`);
console.log(`DE-0325 present: ${verify.includes("id: 'DE-0325'")}`);
console.log('Done!');
