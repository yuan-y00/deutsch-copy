/* ============================================================================
 * generate-audio-batch01.mjs — 第 01 批 A1 德语音频生成脚本
 *
 * 用法：
 *   node scripts/generate-audio-batch01.mjs                                    # 完整生成 (默认 provider)
 *   node scripts/generate-audio-batch01.mjs --provider=piper --limit=10 --force  # Piper 前10张
 *   node scripts/generate-audio-batch01.mjs --provider=piper --from=DE-0001 --to=DE-0010
 *   node scripts/generate-audio-batch01.mjs --dry-run                          # 仅生成任务清单
 *   node scripts/generate-audio-batch01.mjs --card DE-0050                     # 仅生成单张卡
 *
 * Provider 选择（按优先级）：
 *   1. --provider= 命令行参数 (piper | google | azure | dry-run)
 *   2. TTS_PROVIDER 环境变量
 *   3. 自动检测：有 GOOGLE_APPLICATION_CREDENTIALS → google
 *   4. 自动检测：有 AZURE_SPEECH_KEY → azure
 *   5. 自动检测：有 PIPER_EXE → piper
 *   6. 默认 fallback：dry-run 模式
 *
 * 环境变量（Piper）：
 *   PIPER_EXE    — piper.exe 路径 (默认 D:\Yuan\tts\piper\piper\piper.exe)
 *   PIPER_MODEL  — .onnx 模型路径
 *   PIPER_CONFIG — .onnx.json 配置路径
 *   FFMPEG_EXE   — ffmpeg 路径 (默认 ffmpeg)
 *
 * 环境变量（Google Cloud TTS）：
 *   GOOGLE_APPLICATION_CREDENTIALS — 服务账号 JSON 密钥路径
 *   DE_TTS_VOICE — 德语语音名称（默认 de-DE-Wavenet-G）
 *
 * 环境变量（Azure Speech）：
 *   AZURE_SPEECH_KEY — Azure Speech 密钥
 *   AZURE_SPEECH_REGION — Azure 区域（如 westeurope）
 *   DE_TTS_VOICE — 德语语音名称（默认 de-DE-KatjaNeural）
 *
 * 输出：
 *   audio/de/words/DE-0001.mp3 ... DE-0325.mp3
 *   audio/de/examples/DE-0001.mp3 ... DE-0325.mp3
 *   data/audio-manifest-batch-01.json
 * ============================================================================ */

import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ============================================================================
// 配置
// ============================================================================

const BATCH = '01';
const EXPECTED_TOTAL = 325;

const Dirs = {
  wordOutput: join(ROOT, 'audio', 'de', 'words'),
  exampleOutput: join(ROOT, 'audio', 'de', 'examples'),
  temp: join(ROOT, 'temp', 'audio-generation'),
  data: join(ROOT, 'data'),
  dataJs: join(ROOT, 'js', 'data.js'),
};

const DE_VOICE_DEFAULTS = {
  google: 'de-DE-Wavenet-G',
  azure: 'de-DE-KatjaNeural',
};

const PIPER_DEFAULTS = {
  exe: join('D:', 'Yuan', 'tts', 'piper', 'piper', 'piper.exe'),
  model: join('D:', 'Yuan', 'tts', 'models', 'de_DE-thorsten-high.onnx'),
  config: join('D:', 'Yuan', 'tts', 'models', 'de_DE-thorsten-high.onnx.json'),
};

// ============================================================================
// CLI 参数解析
// ============================================================================

function parseArgs(argv) {
  const args = {
    provider: null,
    limit: null,
    from: null,
    to: null,
    force: false,
    dryRun: false,
    card: null,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') {
      args.dryRun = true;
    } else if (a === '--force') {
      args.force = true;
    } else if (a.startsWith('--provider=')) {
      args.provider = a.split('=')[1].toLowerCase();
    } else if (a.startsWith('--limit=')) {
      args.limit = parseInt(a.split('=')[1], 10);
    } else if (a.startsWith('--from=')) {
      args.from = a.split('=')[1];
    } else if (a.startsWith('--to=')) {
      args.to = a.split('=')[1];
    } else if (a === '--card') {
      args.card = argv[i + 1];
      i++;
    }
  }

  return args;
}

// ============================================================================
// Provider 检测
// ============================================================================

function detectProvider(cliProvider) {
  if (cliProvider) {
    if (['piper', 'google', 'azure', 'dry-run'].includes(cliProvider)) return cliProvider;
    console.log(`[WARN] 未知 provider: ${cliProvider}，使用自动检测`);
  }
  const envProvider = process.env.TTS_PROVIDER;
  if (envProvider && ['piper', 'google', 'azure', 'dry-run'].includes(envProvider)) return envProvider;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return 'google';
  if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) return 'azure';
  const piperExe = process.env.PIPER_EXE || PIPER_DEFAULTS.exe;
  if (existsSync(piperExe)) return 'piper';
  return 'dry-run';
}

// ============================================================================
// 加载词卡数据
// ============================================================================

function parseCardsFromSource(code) {
  const allCards = [];
  const cardPattern = /\{\s*id:\s*'(DE-\d+)',\s*level:\s*'(\w+)',\s*batch:\s*'(\d+)'[\s\S]*?\},?/g;
  let match;
  while ((match = cardPattern.exec(code)) !== null) {
    const cardStr = match[0];
    const id = match[1];
    const level = match[2];
    const batch = match[3];
    if (batch !== BATCH || level !== 'A1') continue;

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
      word: getStr('word'),
      wordDisplay: getStr('wordDisplay'),
      wordAudioText: getStr('wordAudioText'),
      exampleAudioText: getStr('exampleAudioText'),
      wordAudioUrl: getStr('wordAudioUrl'),
      exampleAudioUrl: getStr('exampleAudioUrl'),
    });
  }
  return allCards.sort((a, b) => a.globalOrder - b.globalOrder);
}

function loadCards() {
  const code = readFileSync(Dirs.dataJs, 'utf8');
  let cards = parseCardsFromSource(code);

  // 备用：尝试 eval 方式
  if (!cards || cards.length === 0) {
    const adapted = code
      .replace(/\bconst\s+WORD_BANK\b/g, 'var WORD_BANK')
      .replace(/\bconst\s+BATCH_PLAN\b/g, 'var BATCH_PLAN');
    const ctx = {};
    eval(adapted);
    if (ctx.WORD_BANK || typeof WORD_BANK !== 'undefined') {
      const bank = ctx.WORD_BANK || WORD_BANK;
      const all = [];
      Object.values(bank).forEach(arr => all.push(...arr));
      cards = all.filter(c => c.batch === BATCH && c.level === 'A1')
        .sort((a, b) => a.globalOrder - b.globalOrder);
    }
  }

  return cards;
}

// ============================================================================
// 文本 Hash
// ============================================================================

function textHash(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex').substring(0, 16);
}

// ============================================================================
// Piper 音频生成（复用 test-piper-one.mjs 已验证逻辑）
// ============================================================================

function getPiperPaths() {
  return {
    exe: process.env.PIPER_EXE || PIPER_DEFAULTS.exe,
    model: process.env.PIPER_MODEL || PIPER_DEFAULTS.model,
    config: process.env.PIPER_CONFIG || PIPER_DEFAULTS.config,
    ffmpeg: process.env.FFMPEG_EXE || 'ffmpeg',
  };
}

function generatePiperSegment(card, type) {
  const paths = getPiperPaths();
  const isWord = type === 'word';
  const text = isWord ? card.wordAudioText : card.exampleAudioText;
  const outputPath = isWord ? card.wordAudioUrl : card.exampleAudioUrl;
  const filePath = join(ROOT, outputPath.replace(/^\//, ''));
  const wavPath = join(Dirs.temp, `${card.id}-${type}.wav`);

  const entry = {
    cardId: card.id,
    level: card.level,
    batch: card.batch,
    type,
    text,
    textHash: textHash(text),
    outputPath,
    provider: 'piper',
    modelName: 'de_DE-thorsten-high',
    languageCode: 'de-DE',
    generatedAt: null,
    audioVersion: 1,
    status: 'pending',
    fileExists: false,
    fileSizeBytes: 0,
    errorMessage: '',
  };

  try {
    mkdirSync(dirname(filePath), { recursive: true });
    mkdirSync(Dirs.temp, { recursive: true });

    // Step 1: Piper 生成 wav
    const piperArgs = ['--model', paths.model, '--output_file', wavPath];
    execFileSync(paths.exe, piperArgs, {
      input: text + '\n',
      encoding: 'utf8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (!existsSync(wavPath) || statSync(wavPath).size === 0) {
      throw new Error('Piper 未生成有效 wav 文件');
    }

    // Step 2: ffmpeg 转 mp3
    const ffmpegArgs = ['-y', '-i', wavPath, '-codec:a', 'libmp3lame', '-b:a', '128k', filePath];
    execFileSync(paths.ffmpeg, ffmpegArgs, {
      encoding: 'utf8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Step 3: 清理临时 wav
    try { unlinkSync(wavPath); } catch {}

    // Step 4: 验证输出
    if (!existsSync(filePath)) {
      throw new Error('ffmpeg 未生成 mp3 文件');
    }
    const mp3Size = statSync(filePath).size;
    if (mp3Size === 0) {
      throw new Error('mp3 文件为空');
    }

    entry.status = 'generated';
    entry.fileExists = true;
    entry.fileSizeBytes = mp3Size;
    entry.generatedAt = new Date().toISOString();
    console.log(`  [${type}] OK  ${outputPath}  (${mp3Size} bytes)`);
  } catch (err) {
    entry.status = 'failed';
    entry.errorMessage = err.message;
    // 清理可能残留的 wav
    try { if (existsSync(wavPath)) unlinkSync(wavPath); } catch {}
    console.error(`  [${type}] FAIL  ${outputPath}: ${err.message}`);
  }

  return entry;
}

async function generatePiper(cards) {
  console.log(`[Piper] model: de_DE-thorsten-high`);
  const paths = getPiperPaths();
  console.log(`[Piper] exe: ${paths.exe}`);
  console.log(`[Piper] model: ${paths.model}`);
  console.log('');

  const manifest = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    console.log(`[${i + 1}/${cards.length}] ${card.id} — ${card.wordDisplay}`);

    // Word audio
    manifest.push(generatePiperSegment(card, 'word'));
    // Example audio
    manifest.push(generatePiperSegment(card, 'example'));
  }
  return manifest;
}

// ============================================================================
// 音频生成 — dry-run 模式
// ============================================================================

async function generateDryRun(cards) {
  console.log('[DRY-RUN] 模拟音频生成，不产生实际文件\n');
  const manifest = [];
  for (const card of cards) {
    manifest.push({
      cardId: card.id, level: card.level, batch: card.batch,
      type: 'word', text: card.wordAudioText, textHash: textHash(card.wordAudioText),
      outputPath: card.wordAudioUrl, provider: 'dry-run', modelName: '', languageCode: 'de-DE',
      generatedAt: null, audioVersion: 1, status: 'dryRun', fileExists: false, fileSizeBytes: 0, errorMessage: '',
    });
    manifest.push({
      cardId: card.id, level: card.level, batch: card.batch,
      type: 'example', text: card.exampleAudioText, textHash: textHash(card.exampleAudioText),
      outputPath: card.exampleAudioUrl, provider: 'dry-run', modelName: '', languageCode: 'de-DE',
      generatedAt: null, audioVersion: 1, status: 'dryRun', fileExists: false, fileSizeBytes: 0, errorMessage: '',
    });
  }
  return manifest;
}

// ============================================================================
// 音频生成 — Google Cloud TTS（保留原有逻辑）
// ============================================================================

async function generateGoogle(cards) {
  const voiceName = process.env.DE_TTS_VOICE || DE_VOICE_DEFAULTS.google;
  console.log(`[Google Cloud TTS] voice: ${voiceName}`);
  const { TextToSpeechClient } = await import('@google-cloud/text-to-speech');
  const client = new TextToSpeechClient();

  const manifest = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    console.log(`[${i + 1}/${cards.length}] ${card.id} — ${card.wordDisplay}`);

    const wordEntry = {
      cardId: card.id, level: card.level, batch: card.batch,
      type: 'word', text: card.wordAudioText, textHash: textHash(card.wordAudioText),
      outputPath: card.wordAudioUrl, provider: 'google', modelName: voiceName, languageCode: 'de-DE',
      generatedAt: null, audioVersion: 1, status: 'pending', fileExists: false, fileSizeBytes: 0, errorMessage: '',
    };
    try {
      const filePath = join(ROOT, card.wordAudioUrl.replace(/^\//, ''));
      mkdirSync(dirname(filePath), { recursive: true });
      const [response] = await client.synthesizeSpeech({
        input: { text: card.wordAudioText },
        voice: { languageCode: 'de-DE', name: voiceName },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 },
      });
      writeFileSync(filePath, response.audioContent, 'binary');
      wordEntry.status = 'generated';
      wordEntry.fileExists = true;
      wordEntry.fileSizeBytes = response.audioContent.length;
      wordEntry.generatedAt = new Date().toISOString();
      console.log(`  [word] OK  ${card.wordAudioUrl}  (${response.audioContent.length} bytes)`);
    } catch (err) {
      wordEntry.status = 'failed';
      wordEntry.errorMessage = err.message;
      console.error(`  [word] FAIL: ${err.message}`);
    }
    manifest.push(wordEntry);

    const exEntry = {
      cardId: card.id, level: card.level, batch: card.batch,
      type: 'example', text: card.exampleAudioText, textHash: textHash(card.exampleAudioText),
      outputPath: card.exampleAudioUrl, provider: 'google', modelName: voiceName, languageCode: 'de-DE',
      generatedAt: null, audioVersion: 1, status: 'pending', fileExists: false, fileSizeBytes: 0, errorMessage: '',
    };
    try {
      const filePath = join(ROOT, card.exampleAudioUrl.replace(/^\//, ''));
      mkdirSync(dirname(filePath), { recursive: true });
      const [response] = await client.synthesizeSpeech({
        input: { text: card.exampleAudioText },
        voice: { languageCode: 'de-DE', name: voiceName },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 },
      });
      writeFileSync(filePath, response.audioContent, 'binary');
      exEntry.status = 'generated';
      exEntry.fileExists = true;
      exEntry.fileSizeBytes = response.audioContent.length;
      exEntry.generatedAt = new Date().toISOString();
      console.log(`  [example] OK  ${card.exampleAudioUrl}  (${response.audioContent.length} bytes)`);
    } catch (err) {
      exEntry.status = 'failed';
      exEntry.errorMessage = err.message;
      console.error(`  [example] FAIL: ${err.message}`);
    }
    manifest.push(exEntry);
  }
  return manifest;
}

// ============================================================================
// 音频生成 — Azure Speech（保留原有逻辑）
// ============================================================================

async function generateAzure(cards) {
  const voiceName = process.env.DE_TTS_VOICE || DE_VOICE_DEFAULTS.azure;
  console.log(`[Azure Speech] voice: ${voiceName}`);
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) throw new Error('AZURE_SPEECH_KEY 和 AZURE_SPEECH_REGION 环境变量未设置');

  const manifest = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    console.log(`[${i + 1}/${cards.length}] ${card.id} — ${card.wordDisplay}`);

    // Word
    const wordEntry = {
      cardId: card.id, level: card.level, batch: card.batch,
      type: 'word', text: card.wordAudioText, textHash: textHash(card.wordAudioText),
      outputPath: card.wordAudioUrl, provider: 'azure', modelName: voiceName, languageCode: 'de-DE',
      generatedAt: null, audioVersion: 1, status: 'pending', fileExists: false, fileSizeBytes: 0, errorMessage: '',
    };
    try {
      const filePath = join(ROOT, card.wordAudioUrl.replace(/^\//, ''));
      mkdirSync(dirname(filePath), { recursive: true });
      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="de-DE"><voice name="${voiceName}"><prosody rate="0.95">${card.wordAudioText}</prosody></voice></speak>`;
      const tokenRes = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`, { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': key } });
      if (!tokenRes.ok) throw new Error(`Token 获取失败: ${tokenRes.status}`);
      const token = await tokenRes.text();
      const ttsRes = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3' }, body: ssml });
      if (!ttsRes.ok) throw new Error(`TTS 请求失败: ${ttsRes.status}`);
      const buffer = Buffer.from(await ttsRes.arrayBuffer());
      writeFileSync(filePath, buffer);
      wordEntry.status = 'generated';
      wordEntry.fileExists = true;
      wordEntry.fileSizeBytes = buffer.length;
      wordEntry.generatedAt = new Date().toISOString();
      console.log(`  [word] OK  ${card.wordAudioUrl}  (${buffer.length} bytes)`);
    } catch (err) {
      wordEntry.status = 'failed';
      wordEntry.errorMessage = err.message;
      console.error(`  [word] FAIL: ${err.message}`);
    }
    manifest.push(wordEntry);

    // Example
    const exEntry = {
      cardId: card.id, level: card.level, batch: card.batch,
      type: 'example', text: card.exampleAudioText, textHash: textHash(card.exampleAudioText),
      outputPath: card.exampleAudioUrl, provider: 'azure', modelName: voiceName, languageCode: 'de-DE',
      generatedAt: null, audioVersion: 1, status: 'pending', fileExists: false, fileSizeBytes: 0, errorMessage: '',
    };
    try {
      const filePath = join(ROOT, card.exampleAudioUrl.replace(/^\//, ''));
      mkdirSync(dirname(filePath), { recursive: true });
      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="de-DE"><voice name="${voiceName}"><prosody rate="0.95">${card.exampleAudioText}</prosody></voice></speak>`;
      const tokenRes = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`, { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': key } });
      if (!tokenRes.ok) throw new Error(`Token 获取失败: ${tokenRes.status}`);
      const token = await tokenRes.text();
      const ttsRes = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3' }, body: ssml });
      if (!ttsRes.ok) throw new Error(`TTS 请求失败: ${ttsRes.status}`);
      const buffer = Buffer.from(await ttsRes.arrayBuffer());
      writeFileSync(filePath, buffer);
      exEntry.status = 'generated';
      exEntry.fileExists = true;
      exEntry.fileSizeBytes = buffer.length;
      exEntry.generatedAt = new Date().toISOString();
      console.log(`  [example] OK  ${card.exampleAudioUrl}  (${buffer.length} bytes)`);
    } catch (err) {
      exEntry.status = 'failed';
      exEntry.errorMessage = err.message;
      console.error(`  [example] FAIL: ${err.message}`);
    }
    manifest.push(exEntry);
  }
  return manifest;
}

// ============================================================================
// 跳过逻辑
// ============================================================================

function shouldSkip(entry, force) {
  if (force) return false;
  if (entry.status === 'dryRun') return false;
  const filePath = join(ROOT, entry.outputPath.replace(/^\//, ''));
  if (existsSync(filePath)) {
    try {
      if (statSync(filePath).size > 0) return true;
    } catch {}
  }
  return false;
}

// ============================================================================
// 合并 manifest（保留已有条目用于未处理的卡片）
// ============================================================================

function mergeManifest(oldManifest, newEntries) {
  if (!oldManifest || !Array.isArray(oldManifest)) return newEntries;
  const newMap = new Map();
  newEntries.forEach(e => newMap.set(`${e.cardId}-${e.type}`, e));
  const merged = oldManifest.map(e => {
    const key = `${e.cardId}-${e.type}`;
    return newMap.has(key) ? newMap.get(key) : e;
  });
  // 添加 oldManifest 中没有的新条目
  const oldKeys = new Set(oldManifest.map(e => `${e.cardId}-${e.type}`));
  newEntries.forEach(e => {
    const key = `${e.cardId}-${e.type}`;
    if (!oldKeys.has(key)) merged.push(e);
  });
  return merged;
}

// ============================================================================
// 报告生成
// ============================================================================

function generateReport(manifest, opts) {
  const words = manifest.filter(m => m.type === 'word');
  const examples = manifest.filter(m => m.type === 'example');
  const generated = manifest.filter(m => m.status === 'generated');
  const failed = manifest.filter(m => m.status === 'failed');
  const skipped = manifest.filter(m => m.status === 'skipped');
  const dryRun = manifest.filter(m => m.status === 'dryRun');
  const missing = manifest.filter(m => !m.fileExists || m.fileSizeBytes === 0);

  const generatedWords = words.filter(m => m.status === 'generated');
  const generatedExamples = examples.filter(m => m.status === 'generated');

  const isPartial = opts.partial || false;
  const cardCount = opts.cardCount || EXPECTED_TOTAL;

  const report = {
    batch: BATCH,
    level: 'A1',
    provider: opts.provider,
    modelName: opts.provider === 'piper' ? 'de_DE-thorsten-high'
      : (opts.provider === 'dry-run' ? 'N/A' : (opts.voiceName || '')),
    partial: isPartial,
    checkedRange: opts.checkedRange || null,
    cardCount,
    expectedWordAudioCount: cardCount,
    expectedExampleAudioCount: cardCount,
    expectedTotalGermanAudioCount: cardCount * 2,
    generatedWordAudioCount: generatedWords.length,
    generatedExampleAudioCount: generatedExamples.length,
    generatedTotalGermanAudioCount: generated.length,
    skippedTaskCount: skipped.length,
    failedTaskCount: failed.length,
    dryRunTaskCount: dryRun.length,
    missingFileCount: missing.length,
    zeroByteFileCount: manifest.filter(m => m.fileExists && m.fileSizeBytes === 0).length,
    generatedChineseAudio: false,
    calledChineseTTS: false,
    outputDirectories: ['audio/de/words/', 'audio/de/examples/'],
    failedItems: failed.map(f => ({ cardId: f.cardId, type: f.type, error: f.errorMessage })),
    missingItems: missing.map(m => ({ cardId: m.cardId, type: m.type, path: m.outputPath })),
    createdAt: new Date().toISOString(),
  };

  return report;
}

function printReport(report) {
  const label = report.partial ? `(部分: ${report.checkedRange || `${report.cardCount} 张`})` : '';
  console.log('\n═══════════════════════════════════════');
  console.log(`  第 01 批 A1 德语音频生成报告 ${label}`);
  console.log('═══════════════════════════════════════');
  console.log(`  Provider:     ${report.provider}${report.provider === 'dry-run' ? ' (未检测到 API 凭证)' : ''}`);
  console.log(`  Model/Voice:  ${report.modelName}`);
  console.log(`  语言:         de-DE`);
  console.log(`  生成中文音频: 否`);
  console.log(`  调用中文 TTS:  否`);
  console.log('');
  console.log(`  卡片数量:              ${report.cardCount}`);
  console.log(`  预计 Word 音频:        ${report.expectedWordAudioCount}`);
  console.log(`  预计 Example 音频:     ${report.expectedExampleAudioCount}`);
  console.log(`  预计总德语音頻:        ${report.expectedTotalGermanAudioCount}`);
  console.log(`  Word 已生成:           ${report.generatedWordAudioCount}`);
  console.log(`  Example 已生成:        ${report.generatedExampleAudioCount}`);
  console.log(`  总德语音頻已生成:      ${report.generatedTotalGermanAudioCount}`);
  console.log(`  失败:                  ${report.failedTaskCount}`);
  console.log(`  跳过:                  ${report.skippedTaskCount}`);
  console.log(`  Dry-run:               ${report.dryRunTaskCount}`);
  console.log(`  文件缺失:              ${report.missingFileCount}`);
  console.log('');

  if (report.failedItems.length > 0) {
    console.log('  失败列表:');
    report.failedItems.forEach(f => console.log(`    ${f.cardId} [${f.type}]: ${f.error}`));
  }

  if (report.provider === 'dry-run') {
    console.log('  [INFO] 当前为 dry-run 模式。');
    console.log('  使用 --provider=piper 启用本地 Piper 生成:');
    console.log('    node scripts/generate-audio-batch01.mjs --provider=piper --limit=10 --force');
  }

  if (report.partial) {
    console.log('  [INFO] 这是部分生成。完整第 01 批需处理全部 325 张卡片。');
  }

  console.log('═══════════════════════════════════════');
}

// ============================================================================
// 主入口
// ============================================================================

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const provider = detectProvider(args.provider);

  if (args.dryRun && provider !== 'dry-run') {
    console.log(`[INFO] --dry-run 已指定，覆盖 provider=${provider}`);
  }
  const effectiveProvider = args.dryRun ? 'dry-run' : provider;

  console.log(`[Deutsch Copy] 第 01 批 A1 德语音频生成`);
  console.log(`[Provider] ${effectiveProvider}`);
  console.log('');

  // 加载卡片
  let cards = loadCards();
  if (!cards || cards.length === 0) {
    console.error('[ERROR] 无法加载第 01 批词卡数据');
    process.exit(1);
  }
  console.log(`[数据] 加载了 ${cards.length} 张卡片`);

  // 应用范围过滤
  let checkedRange = null;
  let partial = false;

  if (args.card) {
    cards = cards.filter(c => c.id === args.card);
    if (cards.length === 0) {
      console.error(`[ERROR] 未找到卡片 ${args.card}`);
      process.exit(1);
    }
    checkedRange = args.card;
    partial = EXPECTED_TOTAL > 1;
  } else if (args.from || args.to) {
    const fromIdx = args.from ? cards.findIndex(c => c.id === args.from) : 0;
    const toIdx = args.to ? cards.findIndex(c => c.id === args.to) : cards.length - 1;
    if (fromIdx === -1) { console.error(`[ERROR] 未找到起始卡片 ${args.from}`); process.exit(1); }
    if (toIdx === -1) { console.error(`[ERROR] 未找到结束卡片 ${args.to}`); process.exit(1); }
    cards = cards.slice(fromIdx, toIdx + 1);
    checkedRange = `${cards[0].id}–${cards[cards.length - 1].id}`;
    partial = cards.length < EXPECTED_TOTAL;
  } else if (args.limit) {
    cards = cards.slice(0, args.limit);
    checkedRange = `${cards[0].id}–${cards[cards.length - 1].id}`;
    partial = cards.length < EXPECTED_TOTAL;
  }

  console.log(`[范围] ${cards.length} 张卡片${checkedRange ? ` (${checkedRange})` : ''}`);
  console.log('');

  // 确保输出目录存在
  mkdirSync(Dirs.wordOutput, { recursive: true });
  mkdirSync(Dirs.exampleOutput, { recursive: true });
  mkdirSync(Dirs.data, { recursive: true });
  mkdirSync(Dirs.temp, { recursive: true });

  // 加载旧 manifest
  let oldManifest = null;
  const manifestPath = join(Dirs.data, 'audio-manifest-batch-01.json');
  if (existsSync(manifestPath)) {
    try { oldManifest = JSON.parse(readFileSync(manifestPath, 'utf8')); } catch {}
  }

  // --- 处理跳过逻辑 ---
  const toGenerate = [];
  const skipped = [];
  for (const card of cards) {
    const wordPath = card.wordAudioUrl;
    const examplePath = card.exampleAudioUrl;
    const wordFile = join(ROOT, wordPath.replace(/^\//, ''));
    const exampleFile = join(ROOT, examplePath.replace(/^\//, ''));

    const wordExists = existsSync(wordFile) && statSync(wordFile).size > 0;
    const exampleExists = existsSync(exampleFile) && statSync(exampleFile).size > 0;

    if (!args.force && wordExists && exampleExists) {
      skipped.push({
        cardId: card.id, type: 'word',
        outputPath: wordPath, status: 'skipped', fileExists: true, fileSizeBytes: statSync(wordFile).size,
        provider: effectiveProvider, languageCode: 'de-DE',
        text: card.wordAudioText, textHash: textHash(card.wordAudioText),
      });
      skipped.push({
        cardId: card.id, type: 'example',
        outputPath: examplePath, status: 'skipped', fileExists: true, fileSizeBytes: statSync(exampleFile).size,
        provider: effectiveProvider, languageCode: 'de-DE',
        text: card.exampleAudioText, textHash: textHash(card.exampleAudioText),
      });
      console.log(`[SKIP] ${card.id} — 两个 mp3 已存在`);
    } else {
      toGenerate.push(card);
    }
  }

  if (skipped.length > 0) {
    console.log(`[跳过] ${skipped.length / 2} 张卡片已有音频，${toGenerate.length} 张待生成`);
  }

  // --- 生成音频 ---
  let manifest;
  if (toGenerate.length === 0) {
    console.log('[INFO] 没有需要生成的卡片');
    manifest = skipped;
  } else if (effectiveProvider === 'piper') {
    manifest = await generatePiper(toGenerate);
  } else if (effectiveProvider === 'google') {
    try {
      manifest = await generateGoogle(toGenerate);
    } catch (err) {
      console.error(`[Google Cloud TTS] 初始化失败: ${err.message}`);
      console.log('[回退] 使用 dry-run 模式...\n');
      manifest = await generateDryRun(toGenerate);
    }
  } else if (effectiveProvider === 'azure') {
    try {
      manifest = await generateAzure(toGenerate);
    } catch (err) {
      console.error(`[Azure Speech] 初始化失败: ${err.message}`);
      console.log('[回退] 使用 dry-run 模式...\n');
      manifest = await generateDryRun(toGenerate);
    }
  } else {
    manifest = await generateDryRun(toGenerate);
  }

  // 合并 skipped + 新生成的
  const newEntries = [...manifest, ...skipped];

  // 合并到旧 manifest
  const merged = mergeManifest(oldManifest, newEntries);

  // 保存 manifest
  writeFileSync(manifestPath, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`\n[Manifest] 已保存: ${manifestPath}`);

  // 生成报告
  const report = generateReport(merged, {
    provider: effectiveProvider,
    voiceName: effectiveProvider === 'piper' ? 'de_DE-thorsten-high' : (process.env.DE_TTS_VOICE || ''),
    partial,
    checkedRange,
    cardCount: cards.length,
  });

  const reportDir = join(ROOT, 'reports');
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(
    join(reportDir, 'audio-generation-batch-01.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );
  printReport(report);
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
