/**
 * test-piper-one.mjs — Piper 单条德语 TTS 测试
 *
 * 输入: "das Haus"
 * 输出: audio/de/words/TEST-PIPER.mp3
 *
 * 用法:
 *   . .\scripts\piper-env.example.ps1   (PowerShell 加载环境变量)
 *   node scripts/test-piper-one.mjs
 *
 * 流程:
 *   1. Piper 生成 temp/audio-generation/TEST-PIPER.wav
 *   2. ffmpeg 转 mp3 → audio/de/words/TEST-PIPER.mp3
 *   3. 验证输出文件
 */

import { execSync, execFileSync } from 'child_process';
import { existsSync, statSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ============================================================================
// 配置
// ============================================================================

const TEST_TEXT = 'das Haus';
const TEST_WAV = join(ROOT, 'temp', 'audio-generation', 'TEST-PIPER.wav');
const TEST_MP3 = join(ROOT, 'audio', 'de', 'words', 'TEST-PIPER.mp3');

// ============================================================================
// 环境变量读取
// ============================================================================

const PIPER_EXE = process.env.PIPER_EXE || join('D:', 'Yuan', 'tts', 'piper', 'piper', 'piper.exe');
const PIPER_MODEL = process.env.PIPER_MODEL || join('D:', 'Yuan', 'tts', 'models', 'de_DE-thorsten-high.onnx');
const PIPER_CONFIG = process.env.PIPER_CONFIG || join('D:', 'Yuan', 'tts', 'models', 'de_DE-thorsten-high.onnx.json');
const FFMPEG_EXE = process.env.FFMPEG_EXE || 'ffmpeg';

// ============================================================================
// 辅助
// ============================================================================

function log(level, msg) {
  const prefix = { ok: '✅', err: '❌', warn: '⚠️', info: '📋' }[level] || '  ';
  console.log(`${prefix} ${msg}`);
}

function checkFile(path, label) {
  if (!existsSync(path)) {
    log('err', `${label} 不存在: ${path}`);
    return false;
  }
  const size = statSync(path).size;
  if (size === 0) {
    log('err', `${label} 为空文件: ${path}`);
    return false;
  }
  log('ok', `${label}: ${path} (${size} bytes)`);
  return true;
}

// ============================================================================
// 主流程
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  Piper 单条德语 TTS 测试');
  console.log('═══════════════════════════════════════');
  console.log(`  测试文本: "${TEST_TEXT}"`);
  console.log(`  Piper:     ${PIPER_EXE}`);
  console.log(`  Model:     ${PIPER_MODEL}`);
  console.log(`  Config:    ${PIPER_CONFIG}`);
  console.log(`  ffmpeg:    ${FFMPEG_EXE}`);
  console.log('');

  const errors = [];

  // --- 1. 检查 Piper ---
  log('info', '检查 Piper 可执行文件...');
  if (!existsSync(PIPER_EXE)) {
    log('err', `PIPER_EXE 不存在: ${PIPER_EXE}`);
    log('info', '请先运行: .\\scripts\\setup-piper-env.ps1');
    process.exit(1);
  }
  log('ok', `Piper 可执行文件: ${PIPER_EXE}`);

  // --- 2. 检查模型 ---
  log('info', '检查德语模型...');
  if (!existsSync(PIPER_MODEL)) {
    log('err', `模型文件不存在: ${PIPER_MODEL}`);
    log('info', '请先运行: .\\scripts\\setup-piper-env.ps1');
    process.exit(1);
  }
  log('ok', `模型文件: ${PIPER_MODEL} (${statSync(PIPER_MODEL).size} bytes)`);

  if (!existsSync(PIPER_CONFIG)) {
    log('warn', `模型配置文件不存在: ${PIPER_CONFIG}`);
    log('info', 'Piper 可能仍可运行，继续...');
  } else {
    log('ok', `配置文件: ${PIPER_CONFIG} (${statSync(PIPER_CONFIG).size} bytes)`);
  }

  // --- 3. 检查 ffmpeg ---
  log('info', '检查 ffmpeg...');
  try {
    const ffmpegVer = execSync(`"${FFMPEG_EXE}" -version`, { encoding: 'utf8', timeout: 10000 });
    log('ok', `ffmpeg: ${ffmpegVer.split('\n')[0]}`);
  } catch (e) {
    log('err', `ffmpeg 不可用: ${FFMPEG_EXE}`);
    log('info', '请安装 ffmpeg 或将 FFMPEG_EXE 指向正确的路径');
    process.exit(1);
  }

  // --- 4. 创建临时目录 ---
  mkdirSync(dirname(TEST_WAV), { recursive: true });
  mkdirSync(dirname(TEST_MP3), { recursive: true });

  // --- 5. Piper 生成 wav ---
  log('info', '调用 Piper 生成 wav...');
  const piperArgs = [
    '--model', PIPER_MODEL,
    '--output_file', TEST_WAV,
  ];

  try {
    console.log(`  命令: "${PIPER_EXE}" --model "${PIPER_MODEL}" --output_file "${TEST_WAV}"`);
    console.log(`  输入: "${TEST_TEXT}"`);

    const child = execFileSync(PIPER_EXE, piperArgs, {
      input: TEST_TEXT + '\n',
      encoding: 'utf8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (child) console.log(`  Piper stdout: ${child.trim()}`);
  } catch (e) {
    const stderr = e.stderr || '';
    const stdout = e.stdout || '';
    log('err', `Piper 执行失败: ${e.message}`);
    if (stderr) console.log(`  stderr: ${stderr.trim()}`);
    if (stdout) console.log(`  stdout: ${stdout.trim()}`);
    errors.push(`Piper: ${e.message}`);
  }

  if (!existsSync(TEST_WAV)) {
    log('err', `wav 文件未生成: ${TEST_WAV}`);
    errors.push('wav 文件未生成');
  } else {
    const wavSize = statSync(TEST_WAV).size;
    log('ok', `wav 已生成: ${TEST_WAV} (${wavSize} bytes)`);

    // --- 6. ffmpeg 转 mp3 ---
    log('info', '调用 ffmpeg 转换 wav → mp3...');
    const ffmpegArgs = [
      '-y',
      '-i', TEST_WAV,
      '-codec:a', 'libmp3lame',
      '-b:a', '128k',
      TEST_MP3,
    ];

    try {
      console.log(`  命令: "${FFMPEG_EXE}" -y -i "${TEST_WAV}" -codec:a libmp3lame -b:a 128k "${TEST_MP3}"`);
      execFileSync(FFMPEG_EXE, ffmpegArgs, {
        encoding: 'utf8',
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (e) {
      const stderr = e.stderr || '';
      log('err', `ffmpeg 执行失败: ${e.message}`);
      if (stderr) console.log(`  stderr: ${stderr.trim()}`);
      errors.push(`ffmpeg: ${e.message}`);
    }
  }

  // --- 7. 验证 mp3 ---
  console.log('');
  log('info', '验证输出文件...');
  let mp3Ok = false;

  if (existsSync(TEST_MP3)) {
    const mp3Size = statSync(TEST_MP3).size;
    if (mp3Size > 0) {
      mp3Ok = true;
      log('ok', `TEST-PIPER.mp3 已就绪: ${TEST_MP3} (${mp3Size} bytes)`);
    } else {
      log('err', `TEST-PIPER.mp3 为空: ${TEST_MP3}`);
      errors.push('mp3 为空');
    }
  } else {
    log('err', `TEST-PIPER.mp3 不存在: ${TEST_MP3}`);
    errors.push('mp3 不存在');
  }

  // --- 8. 输出结果 ---
  console.log('');
  console.log('═══════════════════════════════════════');
  if (mp3Ok && errors.length === 0) {
    console.log('  测试通过!');
    console.log('');
    console.log('  输出文件:');
    console.log(`    ${TEST_MP3}`);
    console.log('');
    console.log('  下一步可以运行第 01 批音频生成:');
    console.log('    node scripts/generate-audio-batch01.mjs --dry-run');
    console.log('    (需要先将 generate-audio-batch01.mjs 适配 Piper)');
  } else {
    console.log('  测试未通过');
    if (errors.length > 0) {
      console.log('');
      console.log('  错误列表:');
      errors.forEach(e => console.log(`    - ${e}`));
    }
  }
  console.log('═══════════════════════════════════════');

  process.exit(mp3Ok && errors.length === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
