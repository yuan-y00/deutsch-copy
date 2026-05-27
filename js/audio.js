/* ============================================================================
 * audio.js — 统一音频播放模块
 *
 * 架构：
 *   - 正式音频：优先使用 card.wordAudioUrl / exampleAudioUrl
 *   - meaningAudioUrl 保留字段，但播放逻辑已忽略，不再播放中文含义
 *   - Fallback：音频文件不存在或加载失败时，使用 Web Speech API (TTS) de-DE
 *   - 队列：同一时间只有一组音频播放，新播放自动停止旧播放
 *   - 状态：播放中按钮显示 audio-active 样式
 *
 * 用法：
 *   AudioPlayer.playWord(card)          — 单词按钮：wordUrl（仅德语）
 *   AudioPlayer.playExample(card)       — 例句按钮：exampleUrl（仅德语）
 *   AudioPlayer.playFull(card)          — 抄写按钮：wordUrl → exampleUrl（仅德语）
 *   AudioPlayer.stop()                  — 停止当前播放
 * ============================================================================ */

const AudioPlayer = (function () {
  /* --- 内部状态 --- */
  let _abortFlag = false;                     // 停止标记
  let _activeEls = [];                        // 当前显示播放状态的 DOM 元素
  let _fallbackUsed = false;                  // 当前序列是否使用了 fallback

  /* --- 工具 --- */

  function _clearActiveState() {
    _activeEls.forEach(el => el && el.classList.remove('audio-active'));
    _activeEls = [];
  }

  function _setActiveState(els) {
    _clearActiveState();
    _activeEls = Array.isArray(els) ? els.filter(Boolean) : (els ? [els] : []);
    _activeEls.forEach(el => el.classList.add('audio-active'));
  }

  /* --- 单段播放：文件优先，TTS fallback --- */

  function _playFileAudio(url) {
    return new Promise((resolve) => {
      if (!url || !url.trim()) { resolve(false); return; }
      const audio = new Audio(url);
      audio.onended = () => resolve(true);
      audio.onerror = () => {
        console.log('[Audio] 音频文件加载失败，回退到 TTS：' + url);
        resolve(false);
      };
      audio.play().catch(() => {
        console.log('[Audio] 音频播放失败，回退到 TTS：' + url);
        resolve(false);
      });
    });
  }

  function _playTts(text, lang) {
    return new Promise((resolve) => {
      if (!text || !text.trim()) { resolve(false); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = lang === 'de-DE' ? 0.85 : 0.9;
      u.onend = () => resolve(true);
      u.onerror = () => {
        console.log('[Audio] TTS 播放失败：' + text);
        resolve(false);
      };
      speechSynthesis.speak(u);
    });
  }

  /* 播放一段音频：先试文件，失败则 TTS */
  async function _playSegment(url, fallbackText, fallbackLang) {
    if (_abortFlag) return;
    if (url && url.trim()) {
      const ok = await _playFileAudio(url);
      if (!ok && !_abortFlag) {
        _fallbackUsed = true;
        await _playTts(fallbackText, fallbackLang);
      }
    } else {
      _fallbackUsed = true;
      await _playTts(fallbackText, fallbackLang);
    }
  }

  /* --- 序列播放 --- */

  async function _playSequence(segments, activeEls, onComplete) {
    // 停止当前播放
    _abortFlag = true;
    // 等待一个微任务让上一个序列的 Promise 链终止
    await new Promise(r => setTimeout(r, 30));
    _abortFlag = false;
    _fallbackUsed = false;

    _setActiveState(activeEls);

    for (const seg of segments) {
      if (_abortFlag) break;
      await _playSegment(seg.url, seg.fallbackText, seg.fallbackLang);
    }

    _clearActiveState();

    if (_fallbackUsed) {
      console.log('[Audio] 提示：当前播放使用了 Web Speech TTS fallback，非正式音频文件。');
    }

    if (!_abortFlag && typeof onComplete === 'function') {
      onComplete();
    }
  }

  /* --- 公开 API --- */

  function stop() {
    _abortFlag = true;
    speechSynthesis.cancel();
    _clearActiveState();
  }

  function playWord(card) {
    const wordBtn = document.querySelector(
      `button[data-action="play-word"][data-card-id="${card.id}"]`
    );
    // 只播放德语单词，不播放中文含义
    const segments = [
      {
        url: card.wordAudioUrl,
        fallbackText: (card.wordAudioText && card.wordAudioText.trim()) || card.wordDisplay,
        fallbackLang: 'de-DE',
      },
    ];
    _playSequence(segments, wordBtn);
  }

  function playExample(card) {
    const exampleBtns = document.querySelectorAll(
      `button[data-action="play-example"][data-card-id="${card.id}"]`
    );
    // 只播放德语例句
    const segments = [
      {
        url: card.exampleAudioUrl,
        fallbackText: (card.exampleAudioText && card.exampleAudioText.trim()) || card.exampleDe,
        fallbackLang: 'de-DE',
      },
    ];
    _playSequence(segments, [...exampleBtns]);
  }

  function playFull(card) {
    const copyBtn = document.getElementById('copy-btn-' + card.id);
    // 只播放德语单词 + 德语例句，不播放中文含义
    const segments = [
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
    _playSequence(segments, copyBtn, () => {
      // 播放完成后聚焦输入框
      const input = document.getElementById('input-' + card.id);
      if (input) input.focus();
    });
  }

  return { playWord, playExample, playFull, stop };
})();
