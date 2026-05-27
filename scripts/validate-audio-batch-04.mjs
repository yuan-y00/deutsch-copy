/* ============================================================================
 * validate-audio-batch-04.mjs — 第 04 批德语音频文件校验脚本
 *
 * 用法：
 *   node scripts/validate-audio-batch-04.mjs
 *   node scripts/validate-audio-batch-04.mjs --limit=10
 *   node scripts/validate-audio-batch-04.mjs --json
 * ============================================================================ */

import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BATCH = '04';

function parseArgs(argv) {
  const args = { limit: null, from: null, to: null, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') args.json = true;
    else if (a.startsWith('--limit=')) args.limit = parseInt(a.split('=')[1], 10);
    else if (a.startsWith('--from=')) args.from = a.split('=')[1];
    else if (a.startsWith('--to=')) args.to = a.split('=')[1];
  }
  return args;
}

function parseCards(code) {
  const allCards = [];
  const cardPattern = /\{\s*id:\s*'(DE-\d+)',\s*level:\s*'(\w+)',\s*batch:\s*'(\d+)'[\s\S]*?\},?/g;
  let match;
  while ((match = cardPattern.exec(code)) !== null) {
    const cardStr = match[0];
    const id = match[1];
    const level = match[2];
    const batch = match[3];
    const getStr = (key) => {
      const re = new RegExp(`${key}:\\s*'([^']*)'`);
      const m = cardStr.match(re);
      return m ? m[1] : '';
    };
    const getNum = (key) => {
      const re = new RegExp(`${key}:\\s*(\\d+)`);
      const m = cardStr.match(re);
      return m ? parseInt(m[1], 10) : 0;
    };
    allCards.push({
      id, level, batch,
      category: getStr('category'),
      globalOrder: getNum('globalOrder'),
      wordAudioText: getStr('wordAudioText'),
      exampleAudioText: getStr('exampleAudioText'),
      wordAudioUrl: getStr('wordAudioUrl'),
      exampleAudioUrl: getStr('exampleAudioUrl'),
    });
  }
  return allCards.sort((a, b) => a.globalOrder - b.globalOrder);
}

function textHash(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex').substring(0, 16);
}

function loadManifest() {
  const manifestPath = join(ROOT, 'data', `audio-manifest-batch-${BATCH}.json`);
  if (!existsSync(manifestPath)) return null;
  try { return JSON.parse(readFileSync(manifestPath, 'utf8')); }
  catch { return null; }
}

function checkChineseAudioFiles(results, checkedIds) {
  const zhDirs = [
    join(ROOT, 'audio', 'zh', 'words'),
    join(ROOT, 'audio', 'zh', 'meanings'),
  ];
  for (const dir of zhDirs) {
    if (existsSync(dir)) {
      try {
        const files = readdirSync(dir);
        for (const f of files) {
          if (!f.endsWith('.mp3')) continue;
          const match = f.match(/DE-\d{4}/);
          if (match) {
            const cardId = match[0];
            if (checkedIds.has(cardId)) {
              results.unexpectedChineseFiles.push({
                cardId,
                path: dir.replace(ROOT, '').replace(/\\/g, '/') + '/' + f,
              });
            }
          }
        }
      } catch {}
    }
  }
}

function validateAudio(allCards, manifest, cliArgs) {
  let cards = allCards.filter(c => c.batch === BATCH);
  const totalCardsInBatch = cards.length;
  let checkedRange = null;
  let partial = false;
  let expectedWordCount = totalCardsInBatch;
  let expectedExampleCount = totalCardsInBatch;

  if (cliArgs.from || cliArgs.to) {
    const fromIdx = cliArgs.from ? cards.findIndex(c => c.id === cliArgs.from) : 0;
    const toIdx = cliArgs.to ? cards.findIndex(c => c.id === cliArgs.to) : cards.length - 1;
    if (fromIdx === -1) { console.error(`[ERROR] 未找到起始卡片 ${cliArgs.from}`); process.exit(1); }
    if (toIdx === -1) { console.error(`[ERROR] 未找到结束卡片 ${cliArgs.to}`); process.exit(1); }
    cards = cards.slice(fromIdx, toIdx + 1);
    checkedRange = `${cards[0].id}–${cards[cards.length - 1].id}`;
    partial = cards.length < totalCardsInBatch;
    expectedWordCount = cards.length;
    expectedExampleCount = cards.length;
  } else if (cliArgs.limit) {
    cards = cards.slice(0, cliArgs.limit);
    checkedRange = `${cards[0].id}–${cards[cards.length - 1].id}`;
    partial = cards.length < totalCardsInBatch;
    expectedWordCount = cards.length;
    expectedExampleCount = cards.length;
  }

  const checkedIds = new Set(cards.map(c => c.id));
  const results = {
    checkedBatch: BATCH,
    checkedLevel: cards[0]?.level || 'A2',
    checkedAt: new Date().toISOString(),
    partial,
    checkedRange,
    expectedWordFiles: expectedWordCount,
    expectedExampleFiles: expectedExampleCount,
    expectedTotalGermanFiles: expectedWordCount + expectedExampleCount,
    existingWordFiles: 0,
    existingExampleFiles: 0,
    existingTotalGermanFiles: 0,
    missingFiles: [],
    zeroByteFiles: [],
    outdatedFiles: [],
    unexpectedChineseFiles: [],
    pass: false,
  };

  const manifestMap = new Map();
  if (manifest) {
    manifest.forEach(m => { const key = `${m.cardId}-${m.type}`; manifestMap.set(key, m); });
  }

  for (const card of cards) {
    // Word Audio
    {
      const relativePath = card.wordAudioUrl.replace(/^\//, '');
      const filePath = join(ROOT, relativePath);
      if (!existsSync(filePath)) {
        results.missingFiles.push({ cardId: card.id, type: 'word', path: relativePath });
      } else {
        const ext = relativePath.split('.').pop().toLowerCase();
        if (ext !== 'mp3') {
          results.missingFiles.push({ cardId: card.id, type: 'word', path: relativePath, reason: '扩展名错误' });
        }
        try {
          const st = statSync(filePath);
          if (st.size === 0) {
            results.zeroByteFiles.push({ cardId: card.id, type: 'word', path: relativePath });
          } else {
            results.existingWordFiles++;
          }
        } catch {
          results.missingFiles.push({ cardId: card.id, type: 'word', path: relativePath });
        }
      }
      const manifestEntry = manifestMap.get(`${card.id}-word`);
      if (manifestEntry && manifestEntry.textHash) {
        const currentHash = textHash(card.wordAudioText);
        if (currentHash !== manifestEntry.textHash) {
          results.outdatedFiles.push({
            cardId: card.id, type: 'word',
            reason: 'wordAudioText 已变更，音频可能过期',
            oldHash: manifestEntry.textHash, newHash: currentHash,
          });
        }
      }
    }

    // Example Audio
    {
      const relativePath = card.exampleAudioUrl.replace(/^\//, '');
      const filePath = join(ROOT, relativePath);
      if (!existsSync(filePath)) {
        results.missingFiles.push({ cardId: card.id, type: 'example', path: relativePath });
      } else {
        const ext = relativePath.split('.').pop().toLowerCase();
        if (ext !== 'mp3') {
          results.missingFiles.push({ cardId: card.id, type: 'example', path: relativePath, reason: '扩展名错误' });
        }
        try {
          const st = statSync(filePath);
          if (st.size === 0) {
            results.zeroByteFiles.push({ cardId: card.id, type: 'example', path: relativePath });
          } else {
            results.existingExampleFiles++;
          }
        } catch {
          results.missingFiles.push({ cardId: card.id, type: 'example', path: relativePath });
        }
      }
      const manifestEntry = manifestMap.get(`${card.id}-example`);
      if (manifestEntry && manifestEntry.textHash) {
        const currentHash = textHash(card.exampleAudioText);
        if (currentHash !== manifestEntry.textHash) {
          results.outdatedFiles.push({
            cardId: card.id, type: 'example',
            reason: 'exampleAudioText 已变更，音频可能过期',
            oldHash: manifestEntry.textHash, newHash: currentHash,
          });
        }
      }
    }
  }

  results.existingTotalGermanFiles = results.existingWordFiles + results.existingExampleFiles;
  checkChineseAudioFiles(results, checkedIds);

  results.pass = results.existingWordFiles === expectedWordCount
    && results.existingExampleFiles === expectedExampleCount
    && results.zeroByteFiles.length === 0;

  return results;
}

function printReport(results) {
  const totalExpected = results.expectedTotalGermanFiles;
  const totalExisting = results.existingTotalGermanFiles;
  const label = results.partial ? `(部分: ${results.checkedRange})` : '(完整批次)';

  console.log('═══════════════════════════════════════');
  console.log(`  第 ${BATCH} 批 A2 德语音频校验报告 ${label}`);
  console.log('═══════════════════════════════════════');
  console.log(`  校验时间: ${results.checkedAt}`);
  console.log(`  批次:     ${results.checkedBatch}`);
  console.log(`  等级:     ${results.checkedLevel}`);
  if (results.partial) console.log(`  范围:     ${results.checkedRange}`);
  console.log('');
  console.log(`  预期 Word 文件:      ${results.expectedWordFiles}`);
  console.log(`  预期 Example 文件:   ${results.expectedExampleFiles}`);
  console.log(`  预期总德语文件:      ${totalExpected}`);
  console.log('');
  console.log(`  现有 Word 文件:      ${results.existingWordFiles}`);
  console.log(`  现有 Example 文件:   ${results.existingExampleFiles}`);
  console.log(`  现有总德语文件:      ${totalExisting}`);
  console.log('');
  console.log(`  缺失文件:            ${results.missingFiles.length}`);
  console.log(`  0 字节文件:          ${results.zeroByteFiles.length}`);
  console.log(`  过期文件:            ${results.outdatedFiles.length}`);
  console.log(`  意外中文文件:        ${results.unexpectedChineseFiles.length}`);
  console.log('');
  console.log(`  验收通过:            ${results.pass ? 'OK 是' : 'X 否'}`);
  console.log('');

  if (results.missingFiles.length > 0) {
    console.log('  缺失文件清单 (前 20):');
    results.missingFiles.slice(0, 20).forEach(f =>
      console.log(`    ${f.cardId} [${f.type}] ${f.path}`)
    );
    if (results.missingFiles.length > 20) {
      console.log(`    ... 共 ${results.missingFiles.length} 个缺失文件`);
    }
    console.log('');
  }

  if (results.zeroByteFiles.length > 0) {
    console.log('  0 字节文件:');
    results.zeroByteFiles.forEach(f =>
      console.log(`    ${f.cardId} [${f.type}] ${f.path}`)
    );
    console.log('');
  }

  if (results.outdatedFiles.length > 0) {
    console.log('  过期音频 (文本已变更):');
    results.outdatedFiles.slice(0, 10).forEach(e =>
      console.log(`    ${e.cardId} [${e.type}]: ${e.reason}`)
    );
    console.log('');
  }

  if (results.unexpectedChineseFiles.length > 0) {
    console.log('  WARNING — 意外中文文件:');
    results.unexpectedChineseFiles.forEach(f =>
      console.log(`    ${f.path}`)
    );
    console.log('');
  }

  if (results.pass) {
    console.log('  OK 所有预期德语音频文件校验通过');
  }

  console.log('═══════════════════════════════════════');
  return results;
}

function main() {
  const cliArgs = parseArgs(process.argv.slice(2));
  const code = readFileSync(join(ROOT, 'js', 'data.js'), 'utf8');
  const allCards = parseCards(code);
  const targetCards = allCards.filter(c => c.batch === BATCH);

  if (targetCards.length === 0) {
    console.error(`[ERROR] 批次 ${BATCH} 没有卡片数据`);
    process.exit(1);
  }

  const manifest = loadManifest();
  const results = validateAudio(allCards, manifest, cliArgs);

  if (cliArgs.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    printReport(results);
  }

  const reportsDir = join(ROOT, 'reports');
  mkdirSync(reportsDir, { recursive: true });
  writeFileSync(
    join(reportsDir, `audio-validation-batch-${BATCH}.json`),
    JSON.stringify(results, null, 2),
    'utf8'
  );

  if (!results.pass) process.exitCode = 1;
}

main();
