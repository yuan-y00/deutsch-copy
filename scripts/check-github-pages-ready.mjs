/* ============================================================================
 * check-github-pages-ready.mjs — GitHub Pages 部署准备检查
 *
 * 用法：
 *   node scripts/check-github-pages-ready.mjs
 *   node scripts/check-github-pages-ready.mjs --json
 * ============================================================================ */

import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function parseArgs(argv) {
  const args = { json: false };
  argv.forEach(a => { if (a === '--json') args.json = true; });
  return args;
}

function checkFile(path, label) {
  const full = join(ROOT, path);
  const exists = existsSync(full);
  let size = 0;
  if (exists) {
    try { size = statSync(full).size; } catch {}
  }
  return { path, label, exists, size };
}

function checkDirFileCount(dirPath) {
  const full = join(ROOT, dirPath);
  if (!existsSync(full)) return 0;
  try { return readdirSync(full).filter(f => f.endsWith('.mp3')).length; } catch {}
  return 0;
}

function checkContentContains(filePath, patterns) {
  const full = join(ROOT, filePath);
  if (!existsSync(full)) return [];
  const content = readFileSync(full, 'utf8');
  return patterns.filter(p => content.includes(p));
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const results = {
    checkedAt: new Date().toISOString(),
    root: ROOT,
    files: {},
    audioStats: {},
    issues: [],
    warnings: [],
    pass: true,
  };

  // ---- Required files ----
  const requiredFiles = [
    ['index.html', 'index.html'],
    ['manifest.webmanifest', 'manifest.webmanifest'],
    ['.nojekyll', '.nojekyll'],
    ['404.html', '404.html'],
    ['service-worker.js', 'service-worker.js'],
    ['css/app.css', 'css/app.css'],
    ['theme/brand-research-theme.css', 'theme/brand-research-theme.css'],
    ['js/data.js', 'js/data.js'],
    ['js/storage.js', 'js/storage.js'],
    ['js/audio.js', 'js/audio.js'],
    ['js/certificates.js', 'js/certificates.js'],
    ['js/validate.js', 'js/validate.js'],
    ['js/app.js', 'js/app.js'],
    ['icons/icon-192.png', 'icons/icon-192.png'],
    ['icons/icon-512.png', 'icons/icon-512.png'],
  ];

  for (const [path, label] of requiredFiles) {
    const r = checkFile(path, label);
    results.files[path] = r;
    if (!r.exists) {
      results.issues.push('缺少文件: ' + path);
    }
    if (r.exists && r.size === 0) {
      results.warnings.push('文件大小为 0: ' + path);
    }
  }

  // ---- Audio files ----
  const wordCount = checkDirFileCount('audio/de/words');
  const exampleCount = checkDirFileCount('audio/de/examples');
  results.audioStats.wordMp3 = wordCount;
  results.audioStats.exampleMp3 = exampleCount;
  results.audioStats.totalGermanMp3 = wordCount + exampleCount;

  // Check DE-0001 specifically
  const de0001Word = checkFile('audio/de/words/DE-0001.mp3', 'DE-0001 word');
  const de0001Example = checkFile('audio/de/examples/DE-0001.mp3', 'DE-0001 example');
  results.audioStats.de0001WordExists = de0001Word.exists;
  results.audioStats.de0001ExampleExists = de0001Example.exists;
  if (!de0001Word.exists) results.issues.push('缺失: audio/de/words/DE-0001.mp3');
  if (!de0001Example.exists) results.issues.push('缺失: audio/de/examples/DE-0001.mp3');

  // Check for Chinese audio
  const zhWords = existsSync(join(ROOT, 'audio/zh/words')) ? checkDirFileCount('audio/zh/words') : 0;
  const zhMeanings = existsSync(join(ROOT, 'audio/zh/meanings')) ? checkDirFileCount('audio/zh/meanings') : 0;
  results.audioStats.zhWordMp3 = zhWords;
  results.audioStats.zhMeaningMp3 = zhMeanings;
  if (zhWords > 0) results.warnings.push('存在中文单词音频 ' + zhWords + ' 个 (audio/zh/words/)');
  if (zhMeanings > 0) results.warnings.push('存在中文释义音频 ' + zhMeanings + ' 个 (audio/zh/meanings/)');

  // ---- Path checks ----
  // index.html: check for absolute paths
  const indexContent = existsSync(join(ROOT, 'index.html')) ? readFileSync(join(ROOT, 'index.html'), 'utf8') : '';
  const absolutePathPatterns = [
    { pattern: 'href="/css', desc: 'index.html 中有绝对路径 /css' },
    { pattern: 'href="/js', desc: 'index.html 中有绝对路径 /js' },
    { pattern: 'src="/js', desc: 'index.html 中有绝对路径 /js (src)' },
    { pattern: 'href="/audio', desc: 'index.html 中有绝对路径 /audio' },
    { pattern: 'href="/theme', desc: 'index.html 中有绝对路径 /theme' },
  ];
  for (const { pattern, desc } of absolutePathPatterns) {
    if (indexContent.includes(pattern)) {
      results.issues.push(desc);
    }
  }

  // Check for resolveAssetUrl usage
  if (!indexContent.includes('resolveAssetUrl')) {
    results.warnings.push('index.html 中未找到 resolveAssetUrl 定义');
  }
  if (indexContent.includes('DEUTSCH_COPY_BASE_PATH')) {
    results.files['_basePathConfig'] = { exists: true, label: 'resolveAssetUrl 配置' };
  }

  // Check manifest paths
  let manifestOk = true;
  if (existsSync(join(ROOT, 'manifest.webmanifest'))) {
    try {
      const m = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
      if (m.start_url && m.start_url.startsWith('/')) {
        results.issues.push('manifest start_url 是绝对路径: ' + m.start_url);
        manifestOk = false;
      }
      if (m.scope && m.scope.startsWith('/') && m.scope !== './') {
        results.warnings.push('manifest scope 可能是绝对路径: ' + m.scope);
      }
      results.files['manifest.webmanifest'].start_url = m.start_url;
      results.files['manifest.webmanifest'].scope = m.scope;
    } catch(e) {
      results.issues.push('manifest.webmanifest JSON 解析失败: ' + e.message);
      manifestOk = false;
    }
  }
  if (manifestOk) {
    results.files['manifest.webmanifest'].pathsOk = true;
  }

  // Check service worker registration
  if (indexContent.includes('serviceWorker.register(')) {
    const hasRelativeReg = indexContent.includes('"./service-worker.js"');
    results.files['_swReg'] = { exists: true, relativePath: hasRelativeReg };
    if (!hasRelativeReg) {
      results.warnings.push('Service Worker 注册路径可能不是相对路径');
    }
  }

  // ---- Pass/fail ----
  results.pass = results.issues.length === 0;

  // ---- Output ----
  if (args.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log('═══════════════════════════════════════');
    console.log('  GitHub Pages 部署准备检查');
    console.log('═══════════════════════════════════════');
    console.log('  检查时间: ' + results.checkedAt);
    console.log('  项目路径: ' + results.root);
    console.log('');

    console.log('── 必需文件 ──');
    for (const [path, info] of Object.entries(results.files)) {
      if (path.startsWith('_')) continue;
      const status = info.exists ? (info.size > 0 ? '✓' : '⚠ 0 字节') : '✗ 缺失';
      console.log('  ' + status + '  ' + path + (info.start_url ? ' (start_url=' + info.start_url + ')' : ''));
    }

    console.log('\n── 音频统计 ──');
    console.log('  Word mp3:     ' + results.audioStats.wordMp3);
    console.log('  Example mp3:  ' + results.audioStats.exampleMp3);
    console.log('  总德语 mp3:   ' + results.audioStats.totalGermanMp3);
    console.log('  DE-0001 word: ' + (results.audioStats.de0001WordExists ? '✓' : '✗'));
    console.log('  DE-0001 ex:   ' + (results.audioStats.de0001ExampleExists ? '✓' : '✗'));
    if (results.audioStats.zhWordMp3 > 0 || results.audioStats.zhMeaningMp3 > 0) {
      console.log('  中文 word:    ' + results.audioStats.zhWordMp3 + ' (仅报告)');
      console.log('  中文 meaning: ' + results.audioStats.zhMeaningMp3 + ' (仅报告)');
    }

    if (results.issues.length > 0) {
      console.log('\n── 问题 ──');
      results.issues.forEach(i => console.log('  ✗ ' + i));
    }

    if (results.warnings.length > 0) {
      console.log('\n── 警告 ──');
      results.warnings.forEach(w => console.log('  ⚠ ' + w));
    }

    console.log('\n  通过: ' + (results.pass ? '✓ 是' : '✗ 否'));
    console.log('═══════════════════════════════════════');
  }

  // Save report
  const reportsDir = join(ROOT, 'reports');
  mkdirSync(reportsDir, { recursive: true });
  writeFileSync(join(reportsDir, 'github-pages-ready.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log('\n报告已保存: reports/github-pages-ready.json');

  if (!results.pass) process.exitCode = 1;
}

main();