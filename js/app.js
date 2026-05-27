/* ============================================================================
 * app.js — 德语单词抄写工具 主逻辑
 * ============================================================================ */

/* --------------------------------------------------------------------------
 * App State
 * -------------------------------------------------------------------------- */
const state = {
  currentLevel: 'A1',
  currentCategory: null,   // null = 全部（仅影响显示，不影响学习队列）
  words: [],               // 当前等级词包（已按 globalOrder 排序）
  filteredWords: [],       // 按分类筛选后的显示列表
};

/* 并发保护：防止快速连续 Enter 导致重复完成或跳过多词 */
let processingCardId = null;
/* 最后聚焦的抄写输入框（用于 iPhone blur 场景恢复） */
let lastFocusedCopyInputId = null;

/* --------------------------------------------------------------------------
 * DOM Helpers
 * -------------------------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* --------------------------------------------------------------------------
 * Word Lookup
 * -------------------------------------------------------------------------- */
function findWordById(id) {
  return state.words.find(w => w.id === id);
}

/* ======================================================================
 * 全局队列 — 核心函数
 *
 * findFirstUncompletedCard(level)
 *   在当前等级词包中按 globalOrder 从小到大查找第一个未抄写卡片。
 *   不受 category 筛选影响。
 *   所有导航（Next / Enter / 跳转按钮）必须使用此函数。
 * ====================================================================== */
function findFirstUncompletedCard(level) {
  const words = getWordsByLevel(level);
  const completedIds = getCompletedWordIds();
  return words.find(w => !completedIds.has(w.id)) || null;
}

/* --------------------------------------------------------------------------
 * Progress Bar & Level Badge
 * -------------------------------------------------------------------------- */
function updateProgress() {
  const allWords = state.words;
  const completedIds = getCompletedWordIds();
  const total = allWords.length;
  const done = allWords.filter(w => completedIds.has(w.id)).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  $('#level-badge').textContent = state.currentLevel;
  $('#progress-text').textContent = done + '/' + total;
  $('#progress-pct').textContent = pct + '%';
  $('#progress-fill').style.width = pct + '%';

  // 50 词里程碑检查
  checkMilestones();

  // 等级完成检查
  if (done === total && total > 0) {
    const milestone = state.currentLevel + '-all-done';
    if (!hasCelebratedMilestone(milestone)) {
      addCelebratedMilestone(milestone);
      checkLevelCertificate(state.currentLevel, done);
    }
  }
}

/* --------------------------------------------------------------------------
 * 50 词里程碑庆祝
 * -------------------------------------------------------------------------- */
function checkMilestones() {
  const totalDone = getTotalCompletedCount();
  if (totalDone < 50) return;

  // 使用 floor 而非 modulo，避免跳过里程碑（如 49→51 直接跳过 50）
  const currentMilestone = Math.floor(totalDone / 50) * 50;
  const milestoneKey = 'words-' + currentMilestone;
  if (hasCelebratedMilestone(milestoneKey)) return;

  addCelebratedMilestone(milestoneKey);
  showMilestoneModal(currentMilestone);
}

function showMilestoneModal(count) {
  const levelDone = getCompletedCountByLevel(state.currentLevel);
  $('#modal-title').textContent = '🌟 Sehr gut gemacht!';
  $('#modal-text').innerHTML =
    '已完成 <strong>' + count + '</strong> 个德语词卡<br>' +
    '<span style="font-size:13px;color:var(--br-ink-muted);">' +
    '当前等级已完成 ' + levelDone + ' 个 · 继续下一个 50 词目标</span>';
  showCelebration();
}

/* --------------------------------------------------------------------------
 * 等级证书 & 总证书
 * -------------------------------------------------------------------------- */
function checkLevelCertificate(level, completedCount) {
  const certId = 'level-' + level;
  if (hasGeneratedCertificate(certId)) return;

  addGeneratedCertificate(certId);
  const certData = Certificates.buildLevelCertData(level, completedCount);
  Certificates.renderToContainer('certificate-area', certData);

  // 检查是否全部等级完成
  const allLevels = getAllLevels();
  const allDone = allLevels.every(l => {
    const ids = getCardIdsByLevel(l);
    return ids.length > 0 && ids.every(id => isWordCompleted(id));
  });
  if (allDone) {
    const totalCertId = 'total-all';
    if (!hasGeneratedCertificate(totalCertId)) {
      addGeneratedCertificate(totalCertId);
      const totalData = Certificates.buildTotalCertData(getTotalCompletedCount());
      // 在证书区下方追加总证书
      setTimeout(() => {
        const area = document.getElementById('certificate-area');
        if (area) {
          const divider = document.createElement('hr');
          divider.className = 'br-divider';
          area.appendChild(divider);
          const container2 = document.createElement('div');
          container2.id = 'certificate-area-total';
          area.appendChild(container2);
          Certificates.renderToContainer('certificate-area-total', totalData);
        }
      }, 200);
    }
  }
}
function formatCardMeta(card) {
  const parts = [];
  if (card.partOfSpeech) {
    const posLabel = { noun: '名词', verb: '动词', adj: '形容词', adv: '副词', prep: '介词', conj: '连词', pron: '代词', art: '冠词', num: '数词', other: '其他' };
    parts.push(posLabel[card.partOfSpeech] || card.partOfSpeech);
  }
  if (card.plural) {
    parts.push('复数: ' + card.plural);
  }
  return parts.join(' · ');
}

function renderCards() {
  const container = $('#word-cards');
  const completedIds = getCompletedWordIds();

  if (state.filteredWords.length === 0) {
    container.innerHTML = `
      <div class="app-empty">
        <div class="app-empty-icon">📭</div>
        <h3>暂无单词</h3>
        <p>该分类下没有单词，请尝试其他筛选条件。</p>
      </div>`;
    return;
  }

  container.innerHTML = state.filteredWords.map((card) => {
    const done = completedIds.has(card.id);
    const meta = formatCardMeta(card);
    return `
      <div class="app-word-card" data-id="${card.id}">
        <div class="app-card-header">
          <span class="app-card-index">#${card.globalOrder} · ${card.id}</span>
          <span class="br-tag br-tag-sm">${escapeHtml(card.category)}</span>
        </div>

        <!-- Line 1: German word + Chinese meaning + play button -->
        <div class="app-word-row">
          <span class="app-word-german">${escapeHtml(card.wordDisplay)}</span>
          <span class="app-word-chinese">${escapeHtml(card.shortMeaningZh)}</span>
          <button class="app-word-play-btn" data-action="play-word" data-card-id="${card.id}" title="播放德语单词和中文含义" aria-label="播放德语单词">🔊</button>
        </div>

        <!-- Line 2: German example + inline play button -->
        <div class="app-example-row">
          <span class="app-example-de">${escapeHtml(card.exampleDe)}</span>
          <button class="app-example-play-btn" data-action="play-example" data-card-id="${card.id}" title="播放德语例句" aria-label="播放德语例句">🔊</button>
        </div>

        <!-- Line 3: Chinese translation -->
        <div class="app-example-zh-row">
          <span class="app-example-zh">${escapeHtml(card.exampleZh)}</span>
        </div>

        ${meta ? `<div class="app-word-meta">${escapeHtml(meta)}</div>` : ''}

        <!-- Action area: input + copy btn -->
        <div class="app-card-actions">
          <input
            type="text"
            id="input-${card.id}"
            class="app-copy-input${done ? ' completed' : ''}"
            placeholder="${done ? '' : '输入德语单词'}"
            ${done ? 'disabled' : ''}
            ${done ? 'value="' + escapeHtml(card.copyText) + '"' : ''}
            data-card-id="${card.id}"
            enterkeyhint="next"
            inputmode="text"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          >
          <button
            class="app-copy-btn${done ? ' completed' : ''}"
            id="copy-btn-${card.id}"
            data-card-id="${card.id}"
          >${done ? '已抄写' : '抄写'}</button>
          <span class="app-copy-hint" id="hint-${card.id}"></span>
        </div>
      </div>`;
  }).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* --------------------------------------------------------------------------
 * Event Delegation
 * -------------------------------------------------------------------------- */
function setupDelegation() {
  const cardsContainer = $('#word-cards');

  // ── 点击事件 ──────────────────────────────────────────────
  cardsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const cardId = btn.dataset.cardId;
    if (!cardId) return;

    const action = btn.dataset.action;
    const word = findWordById(cardId);

    if (action === 'play-word') {
      if (!word) return;
      AudioPlayer.playWord(word);
    } else if (action === 'play-example') {
      if (!word) return;
      AudioPlayer.playExample(word);
    } else if (btn.classList.contains('app-copy-btn')) {
      if (!word) return;
      if (isWordCompleted(cardId)) return;
      if (processingCardId) return;
      handleCopyClick(cardId);
    }
  });

  // ── 输入法组合状态 ──────────────────────────────────────
  cardsContainer.addEventListener('compositionstart', (e) => {
    const input = e.target.closest('.app-copy-input');
    if (input) input.dataset.composing = '1';
  }, true);

  cardsContainer.addEventListener('compositionend', (e) => {
    const input = e.target.closest('.app-copy-input');
    if (input) {
      // 延迟清除，确保 compositionend 之后触发的 keydown 不会误判
      setTimeout(() => { delete input.dataset.composing; }, 0);
    }
  }, true);

  // ── beforeinput：拦截 insertLineBreak（iPhone 可能触发） ──
  cardsContainer.addEventListener('beforeinput', (e) => {
    if (e.inputType === 'insertLineBreak') {
      const input = e.target.closest('.app-copy-input');
      if (input) {
        e.preventDefault();
        // 触发 Enter 处理逻辑
        handleCopyInputEnter(input);
      }
    }
  });

  // ── keydown Enter ─────────────────────────────────────────
  cardsContainer.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const input = e.target.closest('.app-copy-input');
    if (!input) return;

    // beforeinput 已经处理过 insertLineBreak，无需重复
    if (e.inputType === 'insertLineBreak') return;

    e.preventDefault();
    handleCopyInputEnter(input);
  });

  // ── focus 追踪（用于 iPhone blur 恢复） ──────────────────
  cardsContainer.addEventListener('focusin', (e) => {
    const input = e.target.closest('.app-copy-input');
    if (input) lastFocusedCopyInputId = input.dataset.cardId;
  });

  // ── blur 时如果正在 processing，重新聚焦 ──────────────────
  cardsContainer.addEventListener('blur', (e) => {
    const input = e.target.closest('.app-copy-input');
    if (input && processingCardId === input.dataset.cardId) {
      // 短暂延迟后重新聚焦，对抗 iPhone Enter 导致的 blur
      setTimeout(() => {
        if (processingCardId === input.dataset.cardId && document.activeElement !== input) {
          input.focus();
        }
      }, 50);
    }
  }, true);
}

/* 统一的 Enter 处理逻辑（keydown 和 beforeinput 共用） */
function handleCopyInputEnter(input) {
  const cardId = input.dataset.cardId;

  // 并发保护
  if (processingCardId) return;

  // IME 组合中
  if (input.dataset.composing === '1') return;

  const word = findWordById(cardId);
  if (!word) return;
  if (isWordCompleted(cardId)) return;

  const userInput = input.value.trim();

  // 严格比较：大小写、变音 äöüß 必须完全一致
  if (userInput === word.copyText.trim()) {
    processingCardId = cardId;
    const hint = document.getElementById('hint-' + cardId);
    if (hint) { hint.classList.remove('visible'); hint.textContent = ''; }
    completeWord(cardId);
    jumpToFirstUncompleted();
  } else {
    recordCopyAttempt(false);
    input.style.borderColor = 'var(--br-negative)';
    const hint = document.getElementById('hint-' + cardId);
    if (hint) {
      hint.textContent = getCopyErrorMessage(userInput, word.copyText.trim());
      hint.classList.add('visible');
      setTimeout(() => { hint.classList.remove('visible'); }, 2500);
    }
    setTimeout(() => { input.style.borderColor = ''; }, 600);
  }
}

/* --------------------------------------------------------------------------
 * Copy Logic
 * -------------------------------------------------------------------------- */
function getCopyErrorMessage(userInput, expected) {
  if (!userInput) return '请输入德语单词';
  // 检查大小写
  if (userInput.toLowerCase() === expected.toLowerCase()) {
    return '大小写不一致，德语名词首字母需大写';
  }
  // 检查常见变音错误
  const simpleUmlaut = userInput
    .replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü')
    .replace(/Ae/g, 'Ä').replace(/Oe/g, 'Ö').replace(/Ue/g, 'Ü')
    .replace(/ss/g, 'ß');
  if (simpleUmlaut === expected) {
    return '变音字母错误：请使用 ä ö ü ß 而非 ae oe ue ss';
  }
  if (userInput.replace(/ss/g, 'ß').toLowerCase() === expected.toLowerCase()) {
    return 'ß 需使用 ß 而非 ss';
  }
  return '拼写不匹配，请检查后再试';
}

function handleCopyClick(cardId) {
  if (processingCardId && processingCardId !== cardId) return;
  const word = findWordById(cardId);
  if (!word) return;
  setLastFocusedCardId(state.currentLevel, cardId);
  const hint = document.getElementById('hint-' + cardId);
  if (hint) { hint.classList.remove('visible'); hint.textContent = ''; }
  AudioPlayer.playFull(word);
}

function completeWord(cardId) {
  const newlyCompleted = markWordCompleted(cardId);
  if (!newlyCompleted) return; // 已完成，不重复操作

  const btn = document.getElementById('copy-btn-' + cardId);
  const input = document.getElementById('input-' + cardId);
  if (btn) {
    btn.textContent = '已抄写';
    btn.classList.add('completed');
  }
  if (input) {
    input.classList.add('completed');
    input.disabled = true;
  }
  updateProgress();
}

/* --------------------------------------------------------------------------
 * Focus Helper — 安全聚焦输入框（含 iOS 兼容）
 * -------------------------------------------------------------------------- */
function focusCardInput(cardId) {
  const input = document.getElementById('input-' + cardId);
  if (!input || input.disabled) return false;

  try {
    input.focus({ preventScroll: true });
  } catch (_e) {
    input.focus();
  }
  // 将光标放到末尾
  const len = input.value.length;
  try { input.setSelectionRange(len, len); } catch (_e) { /* ignore */ }
  return document.activeElement === input;
}

/* --------------------------------------------------------------------------
 * goToCardAndFocus — 统一跳转+聚焦（不播放音频）
 *
 * 用于：顶部 Next 按钮、Enter 完成后跳转
 * 规则：
 *   1. 等待 DOM 稳定（最多重试 3 次）
 *   2. 滚动到目标卡片
 *   3. 短暂高亮
 *   4. 聚焦输入框（含 iOS 延迟补偿）
 * ====================================================================== */
function goToCardAndFocus(cardId) {
  const MAX_RETRIES = 3;
  let retries = 0;
  let scrollDone = false;

  function tryFocus() {
    const card = document.querySelector(`.app-word-card[data-id="${cardId}"]`);
    if (!card) {
      retries++;
      if (retries < MAX_RETRIES) {
        setTimeout(tryFocus, 50);
      }
      return;
    }

    if (!scrollDone) {
      // 计算 sticky topbar 高度，避免卡片被遮挡
      const topbar = document.getElementById('app-topbar');
      const offset = topbar ? topbar.offsetHeight + 8 : 60;
      const cardTop = card.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: cardTop - offset, behavior: 'smooth' });
      scrollDone = true;
    }

    // 高亮
    card.classList.add('flash');
    setTimeout(() => card.classList.remove('flash'), 700);

    // 聚焦输入框（滚动完成后）
    setTimeout(() => {
      const ok = focusCardInput(cardId);
      if (!ok) {
        // iOS 补偿：延迟重试
        setTimeout(() => focusCardInput(cardId), 100);
      }
      // iOS 二次确认：确保焦点未丢失
      setTimeout(() => {
        const input = document.getElementById('input-' + cardId);
        if (input && !input.disabled && document.activeElement !== input) {
          focusCardInput(cardId);
        }
      }, 200);
    }, 250);
  }

  tryFocus();
}

/* --------------------------------------------------------------------------
 * Jump to First Uncompleted（全局队列 — 核心导航）
 *
 * 规则：
 *   1. 只在当前 level 内查找
 *   2. 按 globalOrder 从小到大
 *   3. 不受 category 筛选影响
 *   4. 如果当前在分类筛选视图，先切回"全部"再跳转
 *   5. 如果当前等级全部完成，显示已完成提示
 *   6. 如果 A1–C2 全部完成，显示总完成提示
 * ====================================================================== */
function jumpToFirstUncompleted() {
  const next = findFirstUncompletedCard(state.currentLevel);

  if (!next) {
    processingCardId = null;
    if (state.currentCategory !== null) {
      state.currentCategory = null;
      setActiveCategory(state.currentLevel, null);
      renderCategories();
      applyFilter();
    }
    showLevelDoneHint();
    return;
  }

  if (state.currentCategory !== null) {
    state.currentCategory = null;
    setActiveCategory(state.currentLevel, null);
    renderCategories();
    applyFilter();
  }

  // 等待 DOM 更新后跳转、聚焦、并播放音频
  setTimeout(() => {
    goToCardAndFocus(next.id);
    // 跳转到新卡片后自动播放单词+例句音频
    setTimeout(() => {
      AudioPlayer.playFull(next);
    }, 350);
    processingCardId = null;
  }, 150);
}

/* 当前等级全部完成时的提示 */
function showLevelDoneHint() {
  const allLevels = getAllLevels();
  const allDone = allLevels.every(l => findFirstUncompletedCard(l) === null);

  if (allDone) {
    if (!hasCelebratedMilestone('all-levels-done')) {
      addCelebratedMilestone('all-levels-done');
    }
    $('#modal-title').textContent = '🏆 全部完成！';
    $('#modal-text').textContent = '你已完成 A1 到 C2 所有等级的德语单词抄写！';
    showCelebration();
  } else {
    const progressBar = $('#progress-fill');
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.background = 'var(--br-positive)';
      setTimeout(() => {
        progressBar.style.transition = 'width 0.3s ease';
        progressBar.style.background = 'var(--br-accent)';
      }, 800);
    }
  }
}

/* --------------------------------------------------------------------------
 * Filter & Render（仅影响显示）
 * -------------------------------------------------------------------------- */
function applyFilter() {
  if (state.currentCategory) {
    state.filteredWords = state.words.filter(w => w.category === state.currentCategory);
  } else {
    state.filteredWords = state.words;
  }
  renderCards();
}

/* --------------------------------------------------------------------------
 * Level Switch
 * -------------------------------------------------------------------------- */
function switchLevel(level) {
  state.currentLevel = level;
  state.currentCategory = getActiveCategory(level);
  state.words = getWordsByLevel(level);
  setCurrentLevel(level);

  $$('.app-level-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.level === level);
  });

  renderCategories();
  applyFilter();
  updateProgress();
}

/* --------------------------------------------------------------------------
 * Render Level Tabs
 * -------------------------------------------------------------------------- */
function renderLevels() {
  const levels = getAllLevels();
  const container = $('#level-tabs');
  container.innerHTML = levels.map(l =>
    `<button class="app-level-btn${l === state.currentLevel ? ' active' : ''}" data-level="${l}">${l}</button>`
  ).join('');

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.app-level-btn');
    if (btn && btn.dataset.level !== state.currentLevel) {
      switchLevel(btn.dataset.level);
    }
  });
}

/* --------------------------------------------------------------------------
 * Render Category Tags（从当前等级词包提取）
 * -------------------------------------------------------------------------- */
function renderCategories() {
  const cats = getCategoriesByLevel(state.currentLevel);
  const container = $('#category-tags');
  container.innerHTML = `
    <span class="app-cat-tag${state.currentCategory === null ? ' active' : ''}" data-cat="">全部</span>
    ${cats.map(c => `<span class="app-cat-tag${state.currentCategory === c ? ' active' : ''}" data-cat="${c}">${c}</span>`).join('')}
  `;

  container.addEventListener('click', (e) => {
    const tag = e.target.closest('.app-cat-tag');
    if (tag) {
      state.currentCategory = tag.dataset.cat || null;
      setActiveCategory(state.currentLevel, state.currentCategory);
      renderCategories();
      applyFilter();
    }
  });
}

/* --------------------------------------------------------------------------
 * Celebration Modal
 * -------------------------------------------------------------------------- */
function showCelebration() {
  $('#celebration-modal').classList.add('visible');
}

function hideCelebration() {
  $('#celebration-modal').classList.remove('visible');
}

/* --------------------------------------------------------------------------
 * Init
 * -------------------------------------------------------------------------- */
function init() {
  // 恢复上次会话的等级和分类
  const savedLevel = getCurrentLevel();
  if (getAllLevels().includes(savedLevel)) {
    state.currentLevel = savedLevel;
  }
  state.currentCategory = getActiveCategory(state.currentLevel);
  state.words = getWordsByLevel(state.currentLevel);

  renderLevels();
  renderCategories();
  applyFilter();
  updateProgress();
  setupDelegation();

  // 庆祝弹窗
  $('#modal-close-btn').addEventListener('click', hideCelebration);
  $('#celebration-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideCelebration();
  });

  // 顶部跳转按钮
  $('#btn-jump-top').addEventListener('click', jumpToFirstUncompleted);

  // 底部重置按钮
  $('#btn-reset-level').addEventListener('click', () => {
    if (confirm(`确定要重置 ${state.currentLevel} 等级的所有抄写进度吗？`)) {
      const cardIds = getCardIdsByLevel(state.currentLevel);
      resetLevelProgress(cardIds);
      document.getElementById('certificate-area').innerHTML = '';
      document.getElementById('certificate-area').classList.remove('visible');
      applyFilter();
      updateProgress();
    }
  });
  $('#btn-reset-all').addEventListener('click', () => {
    if (confirm('确定要重置所有等级的全部抄写进度吗？此操作不可恢复。')) {
      resetAllProgress();
      document.getElementById('certificate-area').innerHTML = '';
      document.getElementById('certificate-area').classList.remove('visible');
      applyFilter();
      updateProgress();
    }
  });

  // PWA 手机使用说明
  $('#btn-pwa-help').addEventListener('click', () => {
    const panel = document.getElementById('pwa-help-panel');
    panel.classList.toggle('visible');
  });
  $('#btn-pwa-help-close').addEventListener('click', () => {
    document.getElementById('pwa-help-panel').classList.remove('visible');
  });
}

document.addEventListener('DOMContentLoaded', init);
