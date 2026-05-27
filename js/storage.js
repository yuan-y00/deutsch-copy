/* ============================================================================
 * storage.js — 用户进度持久化（独立于词包数据）
 *
 * 存储结构 (v2)：
 * {
 *   version: 2,
 *   completedCardIds: string[],
 *   completedAtMap: { [cardId]: 'ISO-string' },
 *   currentLevel: 'A1',
 *   activeCategoryByLevel: { [level]: string | null },
 *   celebratedMilestones: string[],
 *   generatedCertificates: string[],
 *   lastFocusedCardIdByLevel: { [level]: string },
 *   copyStats: {
 *     totalCopyCount: number,
 *     correctCopyCount: number,
 *     lastCopiedAt: 'ISO-string' | null,
 *   },
 * }
 *
 * 迁移兼容：
 *   - v1 格式 { [wordId]: { completed, completedAt } } 自动迁移到 v2
 *   - 无法解析的数据重置为空状态
 * ============================================================================ */

const STORAGE_KEY = 'deutsch-copy-progress';
const STORAGE_VERSION = 2;

/* --- 工厂 --- */

function createEmptyProgress() {
  return {
    version: STORAGE_VERSION,
    completedCardIds: [],
    completedAtMap: {},
    currentLevel: 'A1',
    activeCategoryByLevel: {},
    celebratedMilestones: [],
    generatedCertificates: [],
    lastFocusedCardIdByLevel: {},
    copyStats: {
      totalCopyCount: 0,
      correctCopyCount: 0,
      lastCopiedAt: null,
    },
  };
}

/* --- 加载 / 保存 --- */

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyProgress();
    const data = JSON.parse(raw);

    // v2 → 直接返回
    if (data && data.version === 2) {
      // 补全可能缺失的字段
      return { ...createEmptyProgress(), ...data };
    }

    // v1 迁移
    return migrateV1ToV2(data);
  } catch (e) {
    console.warn('Failed to load progress, starting fresh.', e);
    return createEmptyProgress();
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress.', e);
  }
}

/* --- v1 → v2 迁移 --- */

function migrateV1ToV2(oldData) {
  const fresh = createEmptyProgress();
  if (!oldData || typeof oldData !== 'object') return fresh;

  const entries = Object.entries(oldData).filter(
    ([, v]) => v && v.completed
  );

  if (entries.length === 0) return fresh;

  fresh.completedCardIds = entries.map(([id]) => id);
  entries.forEach(([id, v]) => {
    if (v.completedAt) fresh.completedAtMap[id] = v.completedAt;
  });
  console.log('Migrated ' + entries.length + ' entries from v1 to v2 progress format.');
  saveProgress(fresh);
  return fresh;
}

/* --- 读写 --- */

function isWordCompleted(cardId) {
  const progress = loadProgress();
  return progress.completedCardIds.includes(cardId);
}

function getCompletedWordIds() {
  const progress = loadProgress();
  return new Set(progress.completedCardIds);
}

function markWordCompleted(cardId) {
  const progress = loadProgress();
  if (!progress.completedCardIds.includes(cardId)) {
    progress.completedCardIds.push(cardId);
    progress.completedAtMap[cardId] = new Date().toISOString();
    progress.copyStats.totalCopyCount += 1;
    progress.copyStats.correctCopyCount += 1;
    progress.copyStats.lastCopiedAt = new Date().toISOString();
    saveProgress(progress);
    return true; // 新完成
  }
  return false; // 已经完成，不重复计数
}

function getCurrentLevel() {
  return loadProgress().currentLevel;
}

function setCurrentLevel(level) {
  const progress = loadProgress();
  progress.currentLevel = level;
  saveProgress(progress);
}

function getActiveCategory(level) {
  const progress = loadProgress();
  return (progress.activeCategoryByLevel && progress.activeCategoryByLevel[level]) || null;
}

function setActiveCategory(level, category) {
  const progress = loadProgress();
  if (!progress.activeCategoryByLevel) progress.activeCategoryByLevel = {};
  progress.activeCategoryByLevel[level] = category;
  saveProgress(progress);
}

function getLastFocusedCardId(level) {
  const progress = loadProgress();
  return (progress.lastFocusedCardIdByLevel && progress.lastFocusedCardIdByLevel[level]) || null;
}

function setLastFocusedCardId(level, cardId) {
  const progress = loadProgress();
  if (!progress.lastFocusedCardIdByLevel) progress.lastFocusedCardIdByLevel = {};
  progress.lastFocusedCardIdByLevel[level] = cardId;
  saveProgress(progress);
}

function addCelebratedMilestone(milestone) {
  const progress = loadProgress();
  if (!progress.celebratedMilestones.includes(milestone)) {
    progress.celebratedMilestones.push(milestone);
  }
  saveProgress(progress);
}

function hasCelebratedMilestone(milestone) {
  return loadProgress().celebratedMilestones.includes(milestone);
}

function getCopyStats() {
  return loadProgress().copyStats;
}

function recordCopyAttempt(correct) {
  const progress = loadProgress();
  progress.copyStats.totalCopyCount += 1;
  if (correct) progress.copyStats.correctCopyCount += 1;
  progress.copyStats.lastCopiedAt = new Date().toISOString();
  saveProgress(progress);
}

/* --- 重置 --- */

function resetAllProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

function resetLevelProgress(cardIds) {
  const progress = loadProgress();
  const idSet = new Set(cardIds);
  progress.completedCardIds = progress.completedCardIds.filter(id => !idSet.has(id));
  cardIds.forEach(id => { delete progress.completedAtMap[id]; });
  saveProgress(progress);
}

/* --- 统计 --- */

function getTotalCompletedCount() {
  return loadProgress().completedCardIds.length;
}

function getCompletedCountByLevel(level) {
  const cardIds = typeof getCardIdsByLevel === 'function'
    ? getCardIdsByLevel(level) : [];
  const idSet = new Set(cardIds);
  return loadProgress().completedCardIds.filter(id => idSet.has(id)).length;
}

/* --- 证书 --- */

function addGeneratedCertificate(certId) {
  const progress = loadProgress();
  if (!progress.generatedCertificates.includes(certId)) {
    progress.generatedCertificates.push(certId);
    saveProgress(progress);
  }
}

function hasGeneratedCertificate(certId) {
  return loadProgress().generatedCertificates.includes(certId);
}
