/**
 * import-batch-04.mjs — 将 batch-04-cards-part1.json 和 part2.json 合并注入 data.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load both parts
const part1 = JSON.parse(readFileSync(join(ROOT, 'data', 'batch-04-cards-part1.json'), 'utf8'));
const part2 = JSON.parse(readFileSync(join(ROOT, 'data', 'batch-04-cards-part2.json'), 'utf8'));
const cards = [...part1, ...part2];

console.log(`Part 1: ${part1.length} cards`);
console.log(`Part 2: ${part2.length} cards`);
console.log(`Total: ${cards.length} cards`);

// Validate before injecting
const ids = cards.map(c => c.id);
const globalOrders = cards.map(c => c.globalOrder);

// Check count
if (cards.length !== 325) {
  console.error(`ERROR: Expected 325 cards, got ${cards.length}`);
  process.exit(1);
}

// Check ID range
const expectedIds = [];
for (let i = 976; i <= 1300; i++) {
  expectedIds.push(`DE-${String(i).padStart(4, '0')}`);
}
const missingIds = expectedIds.filter(id => !ids.includes(id));
const extraIds = ids.filter(id => !expectedIds.includes(id));
if (missingIds.length > 0) {
  console.error(`ERROR: Missing IDs: ${missingIds.join(', ')}`);
  process.exit(1);
}
if (extraIds.length > 0) {
  console.error(`ERROR: Extra IDs: ${extraIds.join(', ')}`);
  process.exit(1);
}

// Check globalOrder range
for (let i = 976; i <= 1300; i++) {
  if (!globalOrders.includes(i)) {
    console.error(`ERROR: Missing globalOrder: ${i}`);
    process.exit(1);
  }
}

// Check required fields
const requiredFields = [
  'id', 'level', 'batch', 'category', 'globalOrder',
  'word', 'wordDisplay', 'copyText', 'partOfSpeech', 'article', 'plural',
  'shortMeaningZh', 'exampleDe', 'exampleZh',
  'wordAudioUrl', 'meaningAudioUrl', 'exampleAudioUrl',
  'wordAudioText', 'exampleAudioText',
  'pronunciationStatus', 'pronunciationNote',
];

for (const card of cards) {
  for (const field of requiredFields) {
    if (!(field in card)) {
      console.error(`ERROR: Card ${card.id} missing field: ${field}`);
      process.exit(1);
    }
  }
  // Check no completed field
  if ('completed' in card) {
    console.error(`ERROR: Card ${card.id} has forbidden 'completed' field`);
    process.exit(1);
  }
  // Check level and batch
  if (card.level !== 'A2') {
    console.error(`ERROR: Card ${card.id} has wrong level: ${card.level}`);
    process.exit(1);
  }
  if (card.batch !== '04') {
    console.error(`ERROR: Card ${card.id} has wrong batch: ${card.batch}`);
    process.exit(1);
  }
  // Check copyText = wordDisplay
  if (card.copyText !== card.wordDisplay) {
    console.error(`ERROR: Card ${card.id} copyText !== wordDisplay`);
    process.exit(1);
  }
  // Check meaningAudioUrl is empty
  if (card.meaningAudioUrl !== '') {
    console.error(`ERROR: Card ${card.id} meaningAudioUrl is not empty`);
    process.exit(1);
  }
  // Check shortMeaningZh no punctuation
  if (/[，。！？、；：""''（）【】《》…—·,\.!\?;:"'\(\)\[\]{}]/.test(card.shortMeaningZh)) {
    console.error(`ERROR: Card ${card.id} shortMeaningZh has punctuation: "${card.shortMeaningZh}"`);
    process.exit(1);
  }
  // Check wordAudioUrl format
  const expectedWordUrl = `/audio/de/words/${card.id}.mp3`;
  if (card.wordAudioUrl !== expectedWordUrl) {
    console.error(`ERROR: Card ${card.id} wordAudioUrl mismatch: ${card.wordAudioUrl} vs ${expectedWordUrl}`);
    process.exit(1);
  }
  // Check exampleAudioUrl format
  const expectedExampleUrl = `/audio/de/examples/${card.id}.mp3`;
  if (card.exampleAudioUrl !== expectedExampleUrl) {
    console.error(`ERROR: Card ${card.id} exampleAudioUrl mismatch: ${card.exampleAudioUrl} vs ${expectedExampleUrl}`);
    process.exit(1);
  }
  // Check pronunciationStatus
  if (card.pronunciationStatus !== 'unchecked') {
    console.error(`ERROR: Card ${card.id} pronunciationStatus not unchecked`);
    process.exit(1);
  }
  // Check pronunciationNote
  if (card.pronunciationNote !== '') {
    console.error(`ERROR: Card ${card.id} pronunciationNote not empty`);
    process.exit(1);
  }
  // Check required fields non-empty
  if (!card.word || !card.wordDisplay || !card.copyText || !card.exampleDe || !card.exampleZh || !card.shortMeaningZh) {
    console.error(`ERROR: Card ${card.id} has empty required text field`);
    process.exit(1);
  }
}

console.log('All validations passed!');

// Format card for injection
function fmtCard(c) {
  const esc = (s) => String(s).replace(/'/g, "\\'").replace(/\n/g, '\\n');
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
    },`;
}

const block = [
  '',
  '    // ====================================================================',
  '    // 批次 04 — A2 词包 (325 张) — DE-0976 to DE-1300',
  '    // ====================================================================',
  '',
  ...cards.map(c => fmtCard(c)),
  '',
].join('\n');

const dataJsPath = join(ROOT, 'js', 'data.js');
let dataJs = readFileSync(dataJsPath, 'utf8');

// Find DE-0975 card and insert after its closing },
const de0975Idx = dataJs.indexOf("id: 'DE-0975'");
if (de0975Idx === -1) {
  console.error('Could not find DE-0975 in data.js');
  process.exit(1);
}

// From DE-0975, find the "    }," that closes this card
const afterDe0975 = dataJs.indexOf('\n    },', de0975Idx);
if (afterDe0975 === -1) {
  console.error('Could not find closing of DE-0975');
  process.exit(1);
}

// Insert after the closing "    },"
const insertPoint = afterDe0975 + '\n    },'.length;

const final = dataJs.substring(0, insertPoint) + block + dataJs.substring(insertPoint);
writeFileSync(dataJsPath, final, 'utf8');

// Verify
const verify = readFileSync(dataJsPath, 'utf8');
const allCardIds = (verify.match(/id: 'DE-\d{4}'/g) || []);
console.log(`\nTotal cards in data.js: ${allCardIds.length}`);

// Check key cards exist
const checks = ['DE-0325', 'DE-0650', 'DE-0975', 'DE-0976', 'DE-1300'];
for (const id of checks) {
  console.log(`${id} present: ${verify.includes(`id: '${id}'`)}`);
}

// Count A1 and A2
const a1Count = (verify.match(/level: 'A1'/g) || []).length;
const a2Count = (verify.match(/level: 'A2'/g) || []).length;
console.log(`A1 cards: ${a1Count}`);
console.log(`A2 cards: ${a2Count}`);

// Count by category for batch 04
const batch04Cards = cards;
const catCounts = {};
batch04Cards.forEach(c => {
  catCounts[c.category] = (catCounts[c.category] || 0) + 1;
});
console.log('\nBatch 04 category distribution:');
for (const [cat, count] of Object.entries(catCounts).sort()) {
  console.log(`  ${cat}: ${count}`);
}

// Count by part of speech
const posCounts = {};
batch04Cards.forEach(c => {
  posCounts[c.partOfSpeech] = (posCounts[c.partOfSpeech] || 0) + 1;
});
console.log('\nBatch 04 part of speech distribution:');
for (const [pos, count] of Object.entries(posCounts).sort()) {
  console.log(`  ${pos}: ${count}`);
}

console.log('\nDone! Batch 04 cards imported successfully.');
