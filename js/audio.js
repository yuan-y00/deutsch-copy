/* ============================================================================
 * audio.js — 统一音频播放模块 (GitHub Pages + iPhone Safari 兼容)
 *
 * 架构：
 *   - 所有音频 URL 通过 resolveAssetUrl() 处理，适配 GitHub Pages 子路径
 *   - 正式音频：优先使用 card.wordAudioUrl / exampleAudioUrl (mp3)
 *   - 不播放 meaningAudioUrl，不播放中文
 *   - Fallback：mp3 失败时使用 Web Speech API (TTS) de-DE
 *   - 队列：同一时间只有一组音频播放，新播放自动停止旧播放
 *   - iPhone Safari：所有播放必须由用户点击直接触发
 *   - 错误处理：捕获 play() rejection，显示轻量提示
 *
 * 用法：
 *   AudioPlayer.playWord(card)          — 单词按钮：word mp3
 *   AudioPlayer.playExample(card)       — 例句按钮：example mp3
 *   AudioPlayer.playFull(card)          — 抄写按钮：word → example mp3
 *   AudioPlayer.stop()                  — 停止当前播放
 * ============================================================================ */

var AudioPlayer = (function () {
  /* --- 内部状态 --- */
  var _abortFlag = false;
  var _activeEls = [];
  var _fallbackUsed = false;
  var _currentAudio = null;   // 当前播放的 Audio 对象（用于 iOS 中断恢复）

  /* --- resolveAssetUrl 快捷方式 --- */
  function _resolve(path) {
    return (typeof resolveAssetUrl === 'function') ? resolveAssetUrl(path) : path;
  }

  /* --- 工具 --- */

  function _clearActiveState() {
    _activeEls.forEach(function(el) { if (el) el.classList.remove('audio-active'); });
    _activeEls = [];
  }

  function _setActiveState(els) {
    _clearActiveState();
    _activeEls = Array.isArray(els) ? els.filter(Boolean) : (els ? [els] : []);
    _activeEls.forEach(function(el) { el.classList.add('audio-active'); });
  }

  function _showHint(msg) {
    // 轻量提示，不打扰用户
    var el = document.getElementById('audio-play-hint');
    if (!el) {
      el = document.createElement('div');
      el.id = 'audio-play-hint';
      el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);'
        + 'background:rgba(0,0,0,0.75);color:#fff;padding:6px 16px;border-radius:20px;'
        + 'font-size:12px;z-index:9999;pointer-events:none;opacity:0;transition:opacity 0.3s;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(function() { el.style.opacity = '0'; }, 2500);
  }

  /* --- 单段播放：mp3 优先，TTS fallback --- */

  function _playFileAudio(url) {
    return new Promise(function(resolve) {
      if (!url || !url.trim()) { resolve(false); return; }
      var resolvedUrl = _resolve(url.trim());
      console.log('[Audio] 加载：' + resolvedUrl);
      var audio = new Audio(resolvedUrl);
      _currentAudio = audio;

      var resolved = false;
      function finish(ok) {
        if (resolved) return;
        resolved = true;
        _currentAudio = null;
        audio.onended = null;
        audio.onerror = null;
        try { audio.pause(); } catch(e) {}
        audio.src = '';
        audio.load();
        resolve(ok);
      }

      audio.onended = function() { finish(true); };

      audio.onerror = function(e) {
        console.warn('[Audio] 文件加载失败 → ' + resolvedUrl + ' (可能是 404 或网络错误)');
        finish(false);
      };

      var playPromise;
      try {
        playPromise = audio.play();
      } catch(e) {
        console.warn('[Audio] play() 同步异常 → ' + resolvedUrl + ' : ' + e.message);
        finish(false);
        return;
      }

      if (playPromise !== undefined && typeof playPromise.catch === 'function') {
        playPromise.catch(function(err) {
          console.warn('[Audio] play() 被拒绝 → ' + resolvedUrl + ' : ' + (err.message || err));
          _showHint('请再次点击播放按钮');
          finish(false);
        });
      }
    });
  }

  function _playTts(text, lang) {
    return new Promise(function(resolve) {
      if (!text || !text.trim()) { resolve(false); return; }
      console.log('[Audio] TTS fallback (lang=' + lang + '): ' + text.substring(0, 60));
      try {
        var u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = 0.85;
        u.onend = function() { resolve(true); };
        u.onerror = function(e) {
          console.warn('[Audio] TTS 失败：' + (e.error || 'unknown'));
          resolve(false);
        };
        speechSynthesis.speak(u);
      } catch(e) {
        console.warn('[Audio] TTS 不可用：' + e.message);
        resolve(false);
      }
    });
  }

  /* 播放一段音频：先试 mp3，失败则 TTS */
  function _playSegment(url, fallbackText, fallbackLang) {
    return new Promise(async function(resolve) {
      if (_abortFlag) { resolve(false); return; }
      if (url && url.trim()) {
        var ok = await _playFileAudio(url);
        if (!ok && !_abortFlag) {
          _fallbackUsed = true;
          await _playTts(fallbackText, fallbackLang);
        }
      } else {
        _fallbackUsed = true;
        await _playTts(fallbackText, fallbackLang);
      }
      resolve(true);
    });
  }

  /* --- 序列播放（异步版：用于按钮点击，内部可用 await） --- */

  function _playSequence(segments, activeEls, onComplete) {
    return new Promise(async function(resolveSeq) {
      // 停止当前播放
      _abortFlag = true;
      speechSynthesis.cancel();
      if (_currentAudio) {
        try { _currentAudio.pause(); } catch(e) {}
        _currentAudio = null;
      }
      // 等待微任务让上一个序列终止
      await new Promise(function(r) { setTimeout(r, 30); });
      _abortFlag = false;
      _fallbackUsed = false;

      _setActiveState(activeEls);

      for (var i = 0; i < segments.length; i++) {
        if (_abortFlag) break;
        var seg = segments[i];
        await _playSegment(seg.url, seg.fallbackText, seg.fallbackLang);
      }

      _clearActiveState();

      if (_fallbackUsed) {
        console.log('[Audio] 当前播放使用了 Web Speech TTS fallback。');
      }

      if (!_abortFlag && typeof onComplete === 'function') {
        onComplete();
      }
      resolveSeq();
    });
  }

  /* --- 同步启动播放（用于 Enter/Next 等键盘事件，保持用户手势上下文） --- */
  // 核心思路：在用户手势处理函数中同步调用 audio.play()，
  // 避免 await/setTimeout 导致 iPhone Safari 拒绝播放。

  function _syncPlayUrl(url, fallbackText, fallbackLang, onEnd) {
    if (_abortFlag) { if (onEnd) onEnd(); return; }
    if (url && url.trim()) {
      console.log('[Audio] 加载：' + url);
      var audio = new Audio(url);
      _currentAudio = audio;
      var ended = false;

      function finish() {
        if (ended) return;
        ended = true;
        _currentAudio = null;
        audio.onended = null;
        audio.onerror = null;
        try { audio.pause(); } catch(e) {}
        audio.src = '';
        audio.load();
        if (onEnd) onEnd();
      }

      audio.onended = finish;

      audio.onerror = function() {
        console.warn('[Audio] 文件加载失败 → ' + url);
        _fallbackUsed = true;
        finish();
      };

      var playPromise;
      try {
        playPromise = audio.play();
      } catch(e) {
        console.warn('[Audio] play() 同步异常：' + e.message);
        _fallbackUsed = true;
        finish();
        return;
      }

      if (playPromise !== undefined && typeof playPromise.catch === 'function') {
        playPromise.catch(function(err) {
          console.warn('[Audio] play() 被拒绝：' + (err.message || err));
          _showHint('请再次点击播放按钮');
          _fallbackUsed = true;
          finish();
        });
      }
    } else {
      _fallbackUsed = true;
      _syncPlayTts(fallbackText, fallbackLang, onEnd);
    }
  }

  function _syncPlayTts(text, lang, onEnd) {
    if (!text || !text.trim()) { if (onEnd) onEnd(); return; }
    try {
      var u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.85;
      u.onend = function() { if (onEnd) onEnd(); };
      u.onerror = function() { if (onEnd) onEnd(); };
      speechSynthesis.speak(u);
    } catch(e) {
      console.warn('[Audio] TTS 不可用：' + e.message);
      if (onEnd) onEnd();
    }
  }

  // playFullSync: 必须在用户手势处理函数中直接调用（同步启动播放）
  // 播放序列：word mp3 → example mp3 → 聚焦输入框
  function playFullSync(card) {
    if (!card) return;

    // 同步停止旧播放
    _abortFlag = true;
    speechSynthesis.cancel();
    if (_currentAudio) {
      try { _currentAudio.pause(); } catch(e) {}
      _currentAudio = null;
    }
    _abortFlag = false;
    _fallbackUsed = false;

    var copyBtn = document.getElementById('copy-btn-' + card.id);
    _setActiveState(copyBtn);

    var wordUrl = _resolve(card.wordAudioUrl);
    var wordText = (card.wordAudioText && card.wordAudioText.trim()) || card.wordDisplay;
    var exampleUrl = _resolve(card.exampleAudioUrl);
    var exampleText = (card.exampleAudioText && card.exampleAudioText.trim()) || card.exampleDe;

    var self = this; // not used, but keeping closure clean

    // Word → Example → focus
    _syncPlayUrl(wordUrl, wordText, 'de-DE', function() {
      if (_abortFlag) { _clearActiveState(); return; }
      _syncPlayUrl(exampleUrl, exampleText, 'de-DE', function() {
        _clearActiveState();
        if (_fallbackUsed) console.log('[Audio] 当前播放使用了 TTS fallback。');
        var input = document.getElementById('input-' + card.id);
        if (input) {
          input.focus();
          var len = input.value.length;
          try { input.setSelectionRange(len, len); } catch(e) {}
        }
      });
    });
  }

  /* --- 公开 API --- */

  function stop() {
    _abortFlag = true;
    speechSynthesis.cancel();
    if (_currentAudio) {
      try { _currentAudio.pause(); } catch(e) {}
      _currentAudio = null;
    }
    _clearActiveState();
  }

  function playWord(card) {
    if (!card) return;
    var wordBtn = document.querySelector(
      'button[data-action="play-word"][data-card-id="' + card.id + '"]'
    );
    var segments = [
      {
        url: card.wordAudioUrl,
        fallbackText: (card.wordAudioText && card.wordAudioText.trim()) || card.wordDisplay,
        fallbackLang: 'de-DE',
      },
    ];
    _playSequence(segments, wordBtn);
  }

  function playExample(card) {
    if (!card) return;
    var exampleBtns = document.querySelectorAll(
      'button[data-action="play-example"][data-card-id="' + card.id + '"]'
    );
    var segments = [
      {
        url: card.exampleAudioUrl,
        fallbackText: (card.exampleAudioText && card.exampleAudioText.trim()) || card.exampleDe,
        fallbackLang: 'de-DE',
      },
    ];
    _playSequence(segments, Array.prototype.slice.call(exampleBtns));
  }

  function playFull(card) {
    if (!card) return;
    var copyBtn = document.getElementById('copy-btn-' + card.id);
    // 序列：word mp3 → example mp3（仅德语）
    var segments = [
      {
        url: card.wordAudioUrl,
        fallbackText: (card.wordAudioText && card.wordAudioText.trim()) || card.wordDisplay,
        fallbackLang: 'de-DE',
      },
      {
        url: card.exampleAudioUrl,
        fallbackText: (card.exampleAudioText && card.exampleAudioText.trim()) || card.exampleDe,
        fallbackLang: 'de-DE',
      },
    ];
    _playSequence(segments, copyBtn, function() {
      var input = document.getElementById('input-' + card.id);
      if (input) {
        input.focus();
        // 将光标移到末尾
        var len = input.value.length;
        try { input.setSelectionRange(len, len); } catch(e) {}
      }
    });
  }

  return {
    playWord: playWord,
    playExample: playExample,
    playFull: playFull,
    playFullSync: playFullSync,
    stop: stop,
  };
})();