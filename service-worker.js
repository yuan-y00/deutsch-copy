/* ============================================================================
 * service-worker.js — Deutsch Copy PWA (GitHub Pages 兼容)
 *
 * 缓存策略：
 *   - 预缓存 App 外壳 (shell-v1)
 *   - 音频文件运行时缓存 (runtime)
 *   - 缓存 URL 适配 GitHub Pages 子路径
 *
 * 版本号：deutsch-copy-shell-v1
 *  更新内容时递增版本号以刷新缓存
 * ============================================================================ */

var CACHE_SHELL = 'deutsch-copy-shell-v1';
var CACHE_AUDIO = 'deutsch-copy-audio-v1';

// 从 registration scope 推断 base path
var BASE = self.location.pathname.replace(/\/service-worker\.js$/, '').replace(/\/$/, '') || '';

function baseUrl(path) {
  // path should be like "index.html" or "css/app.css" (relative to root, no leading /)
  if (BASE) return BASE + '/' + path;
  return path;
}

// 预缓存列表（App 外壳）
var SHELL_URLS = [
  'index.html',
  '404.html',
  'css/app.css',
  'theme/brand-research-theme.css',
  'manifest.webmanifest',
  'js/data.js',
  'js/storage.js',
  'js/audio.js',
  'js/certificates.js',
  'js/validate.js',
  'js/app.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
].map(baseUrl);

// ============================================================================
// Install — 预缓存 App 外壳
// ============================================================================
self.addEventListener('install', function(event) {
  console.log('[SW] install — caching shell');
  event.waitUntil(
    caches.open(CACHE_SHELL).then(function(cache) {
      return cache.addAll(SHELL_URLS).catch(function(err) {
        console.warn('[SW] shell cache partial failure:', err.message);
      });
    })
  );
  self.skipWaiting();
});

// ============================================================================
// Activate — 清理旧缓存
// ============================================================================
self.addEventListener('activate', function(event) {
  console.log('[SW] activate');
  var validCaches = [CACHE_SHELL, CACHE_AUDIO];
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (validCaches.indexOf(key) === -1) {
            console.log('[SW] deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ============================================================================
// Fetch — 缓存策略
// ============================================================================
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  // 跳过非本域请求
  if (url.origin !== self.location.origin) return;

  // 音频文件：Network First，成功后缓存
  if (/\.(mp3|wav|ogg|m4a|aac)(\?|$)/i.test(url.pathname)
      || url.pathname.indexOf('/audio/') !== -1) {
    event.respondWith(audioNetworkFirst(event.request));
    return;
  }

  // App 外壳 & 静态资源：Cache First，失败后 Network
  event.respondWith(shellCacheFirst(event.request));
});

// 音频：先网络，成功后缓存；网络失败则从缓存取
function audioNetworkFirst(request) {
  return caches.open(CACHE_AUDIO).then(function(cache) {
    return fetch(request).then(function(response) {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(function() {
      return cache.match(request);
    });
  });
}

// 外壳：先缓存，缓存未命中则网络
function shellCacheFirst(request) {
  return caches.match(request).then(function(cached) {
    if (cached) return cached;
    return fetch(request).then(function(response) {
      if (response.ok) {
        var clone = response.clone();
        caches.open(CACHE_SHELL).then(function(cache) {
          cache.put(request, clone);
        });
      }
      return response;
    });
  });
}