/* ============================================================================
 * generate-audio-batch.mjs — 通用批次德语音频生成脚本
 *
 * 用法：
 *   node scripts/generate-audio-batch.mjs --batch=03 --provider=piper --force
 *   node scripts/generate-audio-batch.mjs --batch=03 --provider=piper --limit=10 --force
 *   node scripts/generate-audio-batch.mjs --batch=02 --dry-run
 *
 * Piper 速度控制：
 *   PIPER_WORD_LENGTH_SCALE=1.0    (env, 默认 1.0)
 *   PIPER_EXAMPLE_LENGTH_SCALE=1.08 (env, 默认 1.08)
 * ============================================================================ */

import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PIPER_DEFAULTS = {
  exe: join('D:', 'Yuan', 'tts', 'piper', 'piper', 'piper.exe'),
  model: join('D:', 'Yuan', 'tts', 'models', 'de_DE-thorsten-high.onnx'),
  config: join('D:', 'Yuan', 'tts', 'models', 'de_DE-thorsten-high.onnx.json'),
};

// ============================================================================
// CLI 参数解析
// ============================================================================

function parseArgs(argv) {
  const args = { provider: null, batch: null, limit: null, from: null, to: null,
    force: false, dryRun: false, card: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--force') args.force = true;
    else if (a.startsWith('--provider=')) args.provider = a.split('=')[1].toLowerCase();
    else if (a.startsWith('--batch=')) args.batch = a.split('=')[1];
    else if (a.startsWith('--limit=')) args.limit = parseInt(a.split('=')[1], 10);
    else if (a.startsWith('--from=')) args.from = a.split('=')[1];
    else if (a.startsWith('--to=')) args.to = a.split('=')[1];
    else if (a === '--card') { args.card = argv[i + 1]; i++; }
  }
  return args;
}

// ============================================================================
// Provider 检测
// ============================================================================

function detectProvider(cliProvider) {
  if (cliProvider && ['piper', 'google', 'azure', 'dry-run'].includes(cliProvider)) return cliProvider;
  const envP = process.env.TTS_PROVIDER;
  if (envP && ['piper', 'google', 'azure', 'dry-run'].includes(envP)) return envP;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return 'google';
  if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) return 'azure';
  if (existsSync(process.env.PIPER_EXE || PIPER_DEFAULTS.exe)) return 'piper';
  return 'dry-run';
}

// ============================================================================
// 加载词卡
// ============================================================================

function parseCardsFromSource(code, batch) {
  const allCards = [];
  const cardPattern = /\{\s*id:\s*'(DE-\d+)',\s*level:\s*'(\w+)',\s*batch:\s*'(\d+)'[\s\S]*?\},?/g;
  let match;
  while ((match = cardPattern.exec(code)) !== null) {
    const cardStr = match[0];
    const id = match[1];
    const level = match[2];
    const b = match[3];
    if (b !== batch) continue;
    const getStr = (k) => { const r = new RegExp(k + ":\\s*'([^']*)'"); const m = cardStr.match(r); return m ? m[1] : ''; };
    const getNum = (k) => { const r = new RegExp(k + ":\\s*(\\d+)"); const m = cardStr.match(r); return m ? parseInt(m[1], 10) : 0; };
    allCards.push({
      id, level, batch: b, category: getStr('category'), globalOrder: getNum('globalOrder'),
      word: getStr('word'), wordDisplay: getStr('wordDisplay'),
      wordAudioText: getStr('wordAudioText'), exampleAudioText: getStr('exampleAudioText'),
      wordAudioUrl: getStr('wordAudioUrl'), exampleAudioUrl: getStr('exampleAudioUrl'),
    });
  }
  return allCards.sort((a, b) => a.globalOrder - b.globalOrder);
}

function loadCards(batch) {
  const code = readFileSync(join(ROOT, 'js', 'data.js'), 'utf8');
  let cards = parseCardsFromSource(code, batch);
  if (!cards || cards.length === 0) {
    const adapted = code.replace(/\bconst\s+WORD_BANK\b/g, 'var WORD_BANK').replace(/\bconst\s+BATCH_PLAN\b/g, 'var BATCH_PLAN');
    eval(adapted);
    const bank = typeof WORD_BANK !== 'undefined' ? WORD_BANK : {};
    const all = []; Object.values(bank).forEach(arr => all.push(...arr));
    cards = all.filter(c => c.batch === batch).sort((a, b) => a.globalOrder - b.globalOrder);
  }
  return cards;
}

// ============================================================================
// Text hash
// ============================================================================

function textHash(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex').substring(0, 16);
}

// ============================================================================
// Piper 音频生成
// ============================================================================

function getPiperPaths() {
  return {
    exe: process.env.PIPER_EXE || PIPER_DEFAULTS.exe,
    model: process.env.PIPER_MODEL || PIPER_DEFAULTS.model,
    config: process.env.PIPER_CONFIG || PIPER_DEFAULTS.config,
    ffmpeg: process.env.FFMPEG_EXE || 'ffmpeg',
  };
}

function getLengthScales() {
  return {
    word: parseFloat(process.env.PIPER_WORD_LENGTH_SCALE || '1.0'),
    example: parseFloat(process.env.PIPER_EXAMPLE_LENGTH_SCALE || '1.08'),
  };
}

function generatePiperSegment(card, type, tempDir) {
  const paths = getPiperPaths();
  const scales = getLengthScales();
  const isWord = type === 'word';
  const text = isWord ? card.wordAudioText : card.exampleAudioText;
  const outputPath = isWord ? card.wordAudioUrl : card.exampleAudioUrl;
  const filePath = join(ROOT, outputPath.replace(/^\//, ''));
  const wavPath = join(tempDir, `${card.id}-${type}.wav`);
  const lengthScale = isWord ? scales.word : scales.example;

  const entry = {
    cardId: card.id, level: card.level, batch: card.batch, type, text,
    textHash: textHash(text), outputPath,
    provider: 'piper', modelName: 'de_DE-thorsten-high', languageCode: 'de-DE',
    lengthScale,
    generatedAt: null, audioVersion: 1, status: 'pending',
    fileExists: false, fileSizeBytes: 0, errorMessage: '',
  };

  try {
    mkdirSync(dirname(filePath), { recursive: true });
    mkdirSync(tempDir, { recursive: true });

    const piperArgs = ['--model', paths.model, '--length_scale', String(lengthScale), '--output_file', wavPath];
    execFileSync(paths.exe, piperArgs, {
      input: text + '\n', encoding: 'utf8', timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (!existsSync(wavPath) || statSync(wavPath).size === 0) {
      throw new Error('Piper 未生成有效 wav 文件');
    }

    const ffmpegArgs = ['-y', '-i', wavPath, '-codec:a', 'libmp3lame', '-b:a', '128k', filePath];
    execFileSync(paths.ffmpeg, ffmpegArgs, {
      encoding: 'utf8', timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    try { unlinkSync(wavPath); } catch {}

    if (!existsSync(filePath)) throw new Error('ffmpeg 未生成 mp3 文件');
    const mp3Size = statSync(filePath).size;
    if (mp3Size === 0) throw new Error('mp3 文件为空');

    entry.status = 'generated';
    entry.fileExists = true;
    entry.fileSizeBytes = mp3Size;
    entry.generatedAt = new Date().toISOString();
    console.log(`  [${type}] OK  ${outputPath}  (${mp3Size} bytes, ls=${lengthScale})`);
  } catch (err) {
    entry.status = 'failed';
    entry.errorMessage = err.message;
    try { if (existsSync(wavPath)) unlinkSync(wavPath); } catch {}
    console.error(`  [${type}] FAIL  ${outputPath}: ${err.message}`);
  }

  return entry;
}

async function generatePiper(cards, tempDir) {
  const scales = getLengthScales();
  console.log(`[Piper] model: de_DE-thorsten-high`);
  console.log(`[Piper] word length_scale: ${scales.word}, example length_scale: ${scales.example}`);
  const paths = getPiperPaths();
  console.log(`[Piper] exe: ${paths.exe}`);
  console.log('');

  const manifest = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    console.log(`[${i + 1}/${cards.length}] ${card.id} — ${card.wordDisplay}`);
    manifest.push(generatePiperSegment(card, 'word', tempDir));
    manifest.push(generatePiperSegment(card, 'example', tempDir));
  }
  return manifest;
}

// ============================================================================
// dry-run
// ============================================================================

async function generateDryRun(cards) {
  console.log('[DRY-RUN] 模拟音频生成，不产生实际文件\n');
  const manifest = [];
  for (const card of cards) {
    manifest.push({
      cardId: card.id, level: card.level, batch: card.batch, type: 'word',
      text: card.wordAudioText, textHash: textHash(card.wordAudioText),
      outputPath: card.wordAudioUrl, provider: 'dry-run', modelName: '', languageCode: 'de-DE',
      lengthScale: 1.0,
      generatedAt: null, audioVersion: 1, status: 'dryRun', fileExists: false, fileSizeBytes: 0, errorMessage: '',
    });
    manifest.push({
      cardId: card.id, level: card.level, batch: card.batch, type: 'example',
      text: card.exampleAudioText, textHash: textHash(card.exampleAudioText),
      outputPath: card.exampleAudioUrl, provider: 'dry-run', modelName: '', languageCode: 'de-DE',
      lengthScale: 1.0,
      generatedAt: null, audioVersion: 1, status: 'dryRun', fileExists: false, fileSizeBytes: 0, errorMessage: '',
    });
  }
  return manifest;
}

// ============================================================================
// Manifest merge
// ============================================================================

function mergeManifest(oldManifest, newEntries) {
  if (!oldManifest || !Array.isArray(oldManifest)) return newEntries;
  const newMap = new Map();
  newEntries.forEach(e => newMap.set(`${e.cardId}-${e.type}`, e));
  const merged = oldManifest.map(e => {
    const key = `${e.cardId}-${e.type}`;
    return newMap.has(key) ? newMap.get(key) : e;
  });
  const oldKeys = new Set(oldManifest.map(e => `${e.cardId}-${e.type}`));
  newEntries.forEach(e => { if (!oldKeys.has(`${e.cardId}-${e.type}`)) merged.push(e); });
  return merged;
}

// ============================================================================
// 报告
// ============================================================================

function generateReport(manifest, opts) {
  const words = manifest.filter(m => m.type === 'word');
  const examples = manifest.filter(m => m.type === 'example');
  const generated = manifest.filter(m => m.status === 'generated');
  const failed = manifest.filter(m => m.status === 'failed');
  const skipped = manifest.filter(m => m.status === 'skipped');
  const dryRun = manifest.filter(m => m.status === 'dryRun');
  const missing = manifest.filter(m => !m.fileExists || m.fileSizeBytes === 0);

  const scales = getLengthScales();

  return {
    batch: opts.batch, level: opts.level || '?',
    provider: opts.provider,
    modelName: opts.provider === 'piper' ? 'de_DE-thorsten-high'
      : (opts.provider === 'dry-run' ? 'N/A' : (opts.voiceName || '')),
    partial: opts.partial || false, checkedRange: opts.checkedRange || null,
    cardCount: opts.cardCount,
    expectedWordAudioCount: opts.cardCount,
    expectedExampleAudioCount: opts.cardCount,
    expectedTotalGermanAudioCount: opts.cardCount * 2,
    generatedWordAudioCount: words.filter(m => m.status === 'generated').length,
    generatedExampleAudioCount: examples.filter(m => m.status === 'generated').length,
    generatedTotalGermanAudioCount: generated.length,
    skippedTaskCount: skipped.length, failedTaskCount: failed.length,
    dryRunTaskCount: dryRun.length, missingFileCount: missing.length,
    zeroByteFileCount: manifest.filter(m => m.fileExists && m.fileSizeBytes === 0).length,
    wordLengthScale: scales.word, exampleLengthScale: scales.example,
    generatedChineseAudio: false, calledChineseTTS: false,
    outputDirectories: ['audio/de/words/', 'audio/de/examples/'],
    failedItems: failed.map(f => ({ cardId: f.cardId, type: f.type, error: f.errorMessage })),
    missingItems: missing.map(m => ({ cardId: m.cardId, type: m.type, path: m.outputPath })),
    createdAt: new Date().toISOString(),
  };
}

function printReport(report) {
  const label = report.partial ? ` (部分: ${report.checkedRange || ''})` : '';
  console.log('\n' + '='.repeat(51));
  console.log(`  第 ${report.batch} 批 ${report.level} 德语音频生成报告${label}`);
  console.log('='.repeat(51));
  console.log(`  Provider:     ${report.provider}`);
  console.log(`  Model:        ${report.modelName}`);
  console.log(`  word LS:      ${report.wordLengthScale}`);
  console.log(`  example LS:   ${report.exampleLengthScale}`);
  console.log(`  语言:         de-DE`);
  console.log(`  中文音频:     否`);
  console.log('');
  console.log(`  卡片:         ${report.cardCount}`);
  console.log(`  Word 生成:    ${report.generatedWordAudioCount}/${report.expectedWordAudioCount}`);
  console.log(`  Example 生成: ${report.generatedExampleAudioCount}/${report.expectedExampleAudioCount}`);
  console.log(`  总计:         ${report.generatedTotalGermanAudioCount}/${report.expectedTotalGermanAudioCount}`);
  console.log(`  失败:         ${report.failedTaskCount}`);
  console.log(`  跳过:         ${report.skippedTaskCount}`);
  console.log(`  缺失:         ${report.missingFileCount}`);
  console.log('');

  if (report.failedItems.length > 0) {
    console.log('  失败列表:');
    report.failedItems.forEach(f => console.log(`    ${f.cardId} [${f.type}]: ${f.error}`));
  }
  if (report.provider === 'dry-run') {
    console.log('  [INFO] 使用 --provider=piper --force 生成真实音频');
  }
  console.log('='.repeat(51));
}

// ============================================================================
// 主入口
// ============================================================================

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.batch) {
    console.error('[ERROR] 请指定 --batch= 参数，如 --batch=03');
    process.exit(1);
  }

  const provider = detectProvider(args.provider);
  const effectiveProvider = args.dryRun ? 'dry-run' : provider;

  const batchLabel = `第 ${args.batch} 批`;
  let cards = loadCards(args.batch);
  if (!cards || cards.length === 0) {
    console.error(`[ERROR] 无法加载${batchLabel}词卡数据`);
    process.exit(1);
  }

  console.log(`[Deutsch Copy] ${batchLabel} ${cards[0].level} 德语音频生成`);
  console.log(`[Provider] ${effectiveProvider}`);

  let checkedRange = null, partial = false;
  if (args.card) {
    cards = cards.filter(c => c.id === args.card);
    if (cards.length === 0) { console.error(`[ERROR] 未找到 ${args.card}`); process.exit(1); }
    checkedRange = args.card; partial = true;
  } else if (args.from || args.to) {
    const fi = args.from ? cards.findIndex(c => c.id === args.from) : 0;
    const ti = args.to ? cards.findIndex(c => c.id === args.to) : cards.length - 1;
    if (fi === -1 || ti === -1) { console.error('[ERROR] --from/--to 未找到'); process.exit(1); }
    cards = cards.slice(fi, ti + 1);
    checkedRange = `${cards[0].id}–${cards[cards.length-1].id}`;
    partial = true;
  } else if (args.limit) {
    cards = cards.slice(0, args.limit);
    checkedRange = `${cards[0].id}–${cards[cards.length-1].id}`;
    partial = true;
  }

  const BATCH_NUM = args.batch;
  const EXPECTED_TOTAL = parseInt(args.batch) <= 2 ? 325 : 325;
  partial = partial || cards.length < EXPECTED_TOTAL;

  console.log(`[范围] ${cards.length} 张${checkedRange ? ` (${checkedRange})` : ''}\n`);

  const tempDir = join(ROOT, 'temp', 'audio-generation');
  const wordOut = join(ROOT, 'audio', 'de', 'words');
  const exampleOut = join(ROOT, 'audio', 'de', 'examples');
  mkdirSync(wordOut, { recursive: true });
  mkdirSync(exampleOut, { recursive: true });
  mkdirSync(join(ROOT, 'data'), { recursive: true });
  mkdirSync(tempDir, { recursive: true });

  // Load old manifest
  const manifestPath = join(ROOT, 'data', `audio-manifest-batch-${BATCH_NUM}.json`);
  let oldManifest = null;
  if (existsSync(manifestPath)) {
    try { oldManifest = JSON.parse(readFileSync(manifestPath, 'utf8')); } catch {}
  }

  // Skip logic
  const toGenerate = [], skipped = [];
  for (const card of cards) {
    const wf = join(ROOT, card.wordAudioUrl.replace(/^\//, ''));
    const ef = join(ROOT, card.exampleAudioUrl.replace(/^\//, ''));
    const we = existsSync(wf) && statSync(wf).size > 0;
    const ee = existsSync(ef) && statSync(ef).size > 0;
    if (!args.force && we && ee) {
      skipped.push({
        cardId: card.id, type: 'word', outputPath: card.wordAudioUrl, status: 'skipped',
        fileExists: true, fileSizeBytes: statSync(wf).size,
        provider: effectiveProvider, languageCode: 'de-DE',
        text: card.wordAudioText, textHash: textHash(card.wordAudioText), lengthScale: getLengthScales().word,
      });
      skipped.push({
        cardId: card.id, type: 'example', outputPath: card.exampleAudioUrl, status: 'skipped',
        fileExists: true, fileSizeBytes: statSync(ef).size,
        provider: effectiveProvider, languageCode: 'de-DE',
        text: card.exampleAudioText, textHash: textHash(card.exampleAudioText), lengthScale: getLengthScales().example,
      });
      console.log(`[SKIP] ${card.id} — 已有音频`);
    } else {
      toGenerate.push(card);
    }
  }

  if (skipped.length > 0) console.log(`[跳过] ${skipped.length/2} 张已有，${toGenerate.length} 张待生成`);

  let manifest;
  if (toGenerate.length === 0) {
    console.log('[INFO] 无需生成');
    manifest = skipped;
  } else if (effectiveProvider === 'piper') {
    manifest = await generatePiper(toGenerate, tempDir);
  } else if (effectiveProvider === 'google') {
    try { manifest = await generateGoogle(toGenerate); }
    catch (err) { console.error(err.message); manifest = await generateDryRun(toGenerate); }
  } else if (effectiveProvider === 'azure') {
    try { manifest = await generateAzure(toGenerate); }
    catch (err) { console.error(err.message); manifest = await generateDryRun(toGenerate); }
  } else {
    manifest = await generateDryRun(toGenerate);
  }

  const merged = mergeManifest(oldManifest, [...manifest, ...skipped]);
  writeFileSync(manifestPath, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`\n[Manifest] ${manifestPath}`);

  const report = generateReport(merged, {
    batch: BATCH_NUM, level: cards[0]?.level || '?',
    provider: effectiveProvider,
    voiceName: effectiveProvider === 'piper' ? 'de_DE-thorsten-high' : '',
    partial, checkedRange, cardCount: cards.length,
  });

  const reportDir = join(ROOT, 'reports');
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(join(reportDir, `audio-generation-batch-${BATCH_NUM}.json`), JSON.stringify(report, null, 2), 'utf8');
  printReport(report);
}

main().catch(err => { console.error('[FATAL]', err); process.exit(1); });
