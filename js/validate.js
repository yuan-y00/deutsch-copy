/* ============================================================================
 * validate.js — 词包数据校验模块
 *
 * 用法：
 *   const report = validateWordBank(WORD_BANK);
 *   console.log(formatValidationReport(report));
 *
 * report 结构：
 *   { errors: [{ cardId, field, message }], warnings: [{ cardId, field, message }] }
 * ============================================================================ */

const REQUIRED_CARD_FIELDS = [
  'id', 'level', 'batch', 'category', 'globalOrder',
  'word', 'wordDisplay', 'copyText', 'partOfSpeech', 'article', 'plural',
  'shortMeaningZh', 'exampleDe', 'exampleZh',
  'wordAudioUrl', 'meaningAudioUrl', 'exampleAudioUrl',
  'wordAudioText', 'exampleAudioText',
  'pronunciationStatus', 'pronunciationNote',
];

/* 音频 manifest 预留字段（当前可选，未来音频生成后变为必需） */
const AUDIO_MANIFEST_FIELDS = [
  'audioProvider', 'voiceName', 'audioVersion',
  'wordAudioHash', 'meaningAudioHash', 'exampleAudioHash',
  'audioGeneratedAt',
];

// 禁止出现在内容数据中的字段
const FORBIDDEN_FIELDS = ['completed', 'isCompleted', 'done'];

// 中文标点 + 英文标点
const PUNCTUATION_RE = /[，。！？；：""''（）【】《》、,…\.!\?;:"'\(\)\[\]\{\}<>]/;

function validateWordBank(wordBank) {
  const errors = [];
  const warnings = [];
  const flat = [];

  // 展平
  Object.entries(wordBank).forEach(([level, cards]) => {
    if (!Array.isArray(cards)) {
      errors.push({ cardId: null, field: 'WORD_BANK.' + level, message: '词包等级值必须为数组' });
      return;
    }
    cards.forEach(card => flat.push({ ...card, _levelKey: level }));
  });

  if (flat.length === 0) {
    errors.push({ cardId: null, field: 'WORD_BANK', message: '词包数据为空' });
    return { errors, warnings };
  }

  // 1. id 唯一性
  const idMap = new Map();
  flat.forEach(c => {
    if (!c.id) {
      errors.push({ cardId: '(missing)', field: 'id', message: 'id 缺失' });
      return;
    }
    if (idMap.has(c.id)) {
      const prev = idMap.get(c.id);
      errors.push({ cardId: c.id, field: 'id', message: `id 重复（与 ${prev._levelKey} 中的卡片冲突）` });
    } else {
      idMap.set(c.id, c);
    }
  });

  // 2. globalOrder 唯一性
  const orderMap = new Map();
  flat.forEach(c => {
    if (c.globalOrder == null) {
      errors.push({ cardId: c.id || '(missing)', field: 'globalOrder', message: 'globalOrder 缺失' });
      return;
    }
    if (orderMap.has(c.globalOrder)) {
      const prev = orderMap.get(c.globalOrder);
      errors.push({ cardId: c.id, field: 'globalOrder', message: `globalOrder=${c.globalOrder} 重复（与 ${prev.id} 冲突）` });
    } else {
      orderMap.set(c.globalOrder, c);
    }
  });

  // 逐卡检查
  flat.forEach(c => {
    const cid = c.id || '(missing)';

    // 3. id 格式校验 DE-XXXX
    if (c.id && !/^DE-\d{4}$/.test(c.id)) {
      errors.push({ cardId: cid, field: 'id', message: `id 格式不正确，期望 DE-NNNN，实际为 "${c.id}"` });
    }

    // 4. level
    if (!c.level) {
      errors.push({ cardId: cid, field: 'level', message: 'level 缺失' });
    } else if (!VALID_LEVELS.includes(c.level)) {
      errors.push({ cardId: cid, field: 'level', message: `无效等级 "${c.level}"，有效值：${VALID_LEVELS.join(', ')}` });
    } else if (c.level !== c._levelKey) {
      warnings.push({ cardId: cid, field: 'level', message: `level="${c.level}" 与所在词包键 "${c._levelKey}" 不一致` });
    }

    // 5. batch
    if (!c.batch) {
      errors.push({ cardId: cid, field: 'batch', message: 'batch 缺失' });
    } else if (!/^\d{2}$/.test(String(c.batch))) {
      warnings.push({ cardId: cid, field: 'batch', message: `batch 格式建议为两位数字（如 "01"），当前为 "${c.batch}"` });
    }

    // 6. partOfSpeech
    if (c.partOfSpeech && !VALID_PARTS_OF_SPEECH.includes(c.partOfSpeech)) {
      warnings.push({ cardId: cid, field: 'partOfSpeech', message: `未知词性 "${c.partOfSpeech}"` });
    }

    // 7. pronunciationStatus
    if (c.pronunciationStatus && !VALID_PRONUNCIATION_STATUSES.includes(c.pronunciationStatus)) {
      warnings.push({ cardId: cid, field: 'pronunciationStatus', message: `未知发音状态 "${c.pronunciationStatus}"，有效值：${VALID_PRONUNCIATION_STATUSES.join(', ')}` });
    }

    // 8. word 非空
    if (!c.word || !c.word.trim()) {
      errors.push({ cardId: cid, field: 'word', message: 'word 为空' });
    }

    // 8b. category 非空
    if (!c.category || !c.category.trim()) {
      errors.push({ cardId: cid, field: 'category', message: 'category 为空' });
    }

    // 9. wordDisplay 非空
    if (!c.wordDisplay || !c.wordDisplay.trim()) {
      errors.push({ cardId: cid, field: 'wordDisplay', message: 'wordDisplay 为空' });
    }

    // 9. copyText 非空
    if (!c.copyText || !c.copyText.trim()) {
      errors.push({ cardId: cid, field: 'copyText', message: 'copyText 为空' });
    }

    // 10. shortMeaningZh 非空
    if (!c.shortMeaningZh || !c.shortMeaningZh.trim()) {
      errors.push({ cardId: cid, field: 'shortMeaningZh', message: 'shortMeaningZh 为空' });
    } else if (PUNCTUATION_RE.test(c.shortMeaningZh)) {
      // 11. shortMeaningZh 不应包含标点
      const matches = c.shortMeaningZh.match(PUNCTUATION_RE);
      errors.push({ cardId: cid, field: 'shortMeaningZh', message: `shortMeaningZh 包含标点符号：${matches.join(' ')}` });
    }

    // 12. exampleDe 非空
    if (!c.exampleDe || !c.exampleDe.trim()) {
      errors.push({ cardId: cid, field: 'exampleDe', message: 'exampleDe 为空' });
    }

    // 13. exampleZh 非空
    if (!c.exampleZh || !c.exampleZh.trim()) {
      errors.push({ cardId: cid, field: 'exampleZh', message: 'exampleZh 为空' });
    }

    // 14. 三个 audioUrl 字段必须存在（值可以为空字符串）
    if (c.wordAudioUrl === undefined || c.wordAudioUrl === null) {
      errors.push({ cardId: cid, field: 'wordAudioUrl', message: 'wordAudioUrl 字段缺失' });
    }
    if (c.meaningAudioUrl === undefined || c.meaningAudioUrl === null) {
      errors.push({ cardId: cid, field: 'meaningAudioUrl', message: 'meaningAudioUrl 字段缺失' });
    }
    if (c.exampleAudioUrl === undefined || c.exampleAudioUrl === null) {
      errors.push({ cardId: cid, field: 'exampleAudioUrl', message: 'exampleAudioUrl 字段缺失' });
    }

    // 15. wordAudioText 非空
    if (!c.wordAudioText || !c.wordAudioText.trim()) {
      warnings.push({ cardId: cid, field: 'wordAudioText', message: 'wordAudioText 为空，TTS 将回退到 wordDisplay' });
    }

    // 16. exampleAudioText 非空
    if (!c.exampleAudioText || !c.exampleAudioText.trim()) {
      warnings.push({ cardId: cid, field: 'exampleAudioText', message: 'exampleAudioText 为空，TTS 将回退到 exampleDe' });
    }

    // 17. 禁止字段检查
    FORBIDDEN_FIELDS.forEach(f => {
      if (c.hasOwnProperty(f)) {
        errors.push({ cardId: cid, field: f, message: `内容数据中不应包含 "${f}" 字段（用户进度应独立存储）` });
      }
    });

    // 18. article 与 partOfSpeech 一致性
    if (c.partOfSpeech === 'noun' && !c.article) {
      warnings.push({ cardId: cid, field: 'article', message: '名词未设置冠词（article）' });
    }
    if (c.partOfSpeech !== 'noun' && c.article) {
      warnings.push({ cardId: cid, field: 'article', message: `非名词（${c.partOfSpeech}）设置了冠词 "${c.article}"` });
    }

    // 19. 缺少字段检查
    REQUIRED_CARD_FIELDS.forEach(f => {
      if (c[f] === undefined || c[f] === null) {
        errors.push({ cardId: cid, field: f, message: `缺少必需字段 "${f}"` });
      }
    });

    // 20. 音频 manifest 预留字段（当前为可选，缺失仅警告）
    AUDIO_MANIFEST_FIELDS.forEach(f => {
      if (c[f] === undefined || c[f] === null) {
        warnings.push({ cardId: cid, field: f, message: `音频 manifest 字段 "${f}" 缺失（预留字段，当前可选）` });
      }
    });
  });

  // 全局统计
  if (errors.length === 0) {
    console.log(`校验通过：${flat.length} 张卡片，${idMap.size} 个唯一 ID，${orderMap.size} 个唯一 globalOrder`);
  }

  return { errors, warnings };
}

function formatValidationReport(report) {
  const lines = [];
  const total = report.errors.length + report.warnings.length;

  lines.push('═══════════════════════════════════════');
  lines.push('  词包数据校验报告');
  lines.push('═══════════════════════════════════════');

  if (total === 0) {
    lines.push('  ✅ 全部校验通过');
    return lines.join('\n');
  }

  if (report.errors.length > 0) {
    lines.push(`\n  ❌ 错误 (${report.errors.length}):`);
    report.errors.forEach((e, i) => {
      const id = e.cardId || '(全局)';
      lines.push(`     ${i + 1}. [${id}] ${e.field}: ${e.message}`);
    });
  }

  if (report.warnings.length > 0) {
    lines.push(`\n  ⚠️  警告 (${report.warnings.length}):`);
    report.warnings.forEach((w, i) => {
      const id = w.cardId || '(全局)';
      lines.push(`     ${i + 1}. [${id}] ${w.field}: ${w.message}`);
    });
  }

  lines.push('\n═══════════════════════════════════════');
  return lines.join('\n');
}

/* 初始化时自动运行校验（仅在开发环境输出） */
(function autoValidate() {
  if (typeof WORD_BANK !== 'undefined') {
    const report = validateWordBank(WORD_BANK);
    if (report.errors.length > 0 || report.warnings.length > 0) {
      console.log(formatValidationReport(report));
    }
  }
})();

/* ============================================================================
 * 批量导入校验（用于 20 批词包导入前验证）
 * ============================================================================ */

/* 展平并排序全部卡片 */
function flattenCards(wordBank) {
  const cards = [];
  Object.values(wordBank).forEach(arr => cards.push(...arr));
  cards.sort((a, b) => a.globalOrder - b.globalOrder);
  return cards;
}

/* globalOrder 连续性：1 到 N 连续无缺 */
function checkGlobalOrderContinuity(cards) {
  const errors = [];
  if (cards.length === 0) {
    errors.push({ message: '词包为空，无法检查连续性' });
    return errors;
  }
  const orders = cards.map(c => c.globalOrder).sort((a, b) => a - b);
  if (orders[0] !== 1) {
    errors.push({ message: `globalOrder 应从 1 开始，实际最小值为 ${orders[0]}` });
  }
  for (let i = 1; i < orders.length; i++) {
    if (orders[i] !== orders[i - 1] + 1) {
      errors.push({ message: `globalOrder 不连续：${orders[i - 1]} → ${orders[i]}，缺少 ${orders[i - 1] + 1}` });
      if (errors.length >= 10) { errors.push({ message: '...（连续错误过多，仅显示前 10 条）' }); break; }
    }
  }
  return errors;
}

/* 按等级统计数量 */
function checkLevelCounts(cards, expected) {
  const errors = [];
  const counts = {};
  cards.forEach(c => { counts[c.level] = (counts[c.level] || 0) + 1; });
  Object.entries(expected || LEVEL_TARGET_COUNTS || {}).forEach(([level, expectedCount]) => {
    const actual = counts[level] || 0;
    if (actual !== expectedCount) {
      errors.push({ message: `等级 ${level}：期望 ${expectedCount} 张，实际 ${actual} 张` });
    }
  });
  return errors;
}

/* 按批次统计数量 */
function checkBatchCounts(cards, batchPlan) {
  const errors = [];
  const plan = batchPlan || (typeof BATCH_PLAN !== 'undefined' ? BATCH_PLAN : []);
  if (plan.length === 0) {
    errors.push({ message: '无 BATCH_PLAN 参考数据' });
    return errors;
  }
  const batchMap = {};
  cards.forEach(c => { batchMap[c.batch] = (batchMap[c.batch] || 0) + 1; });
  plan.forEach(bp => {
    const actual = batchMap[bp.batch] || 0;
    if (actual !== bp.count) {
      errors.push({ message: `批次 ${bp.batch}（${bp.level}）：期望 ${bp.count} 张，实际 ${actual} 张` });
    }
  });
  return errors;
}

/* 检查 id 与 globalOrder 的对应关系（根据 BATCH_PLAN 验证） */
function checkIdOrderMapping(cards, batchPlan) {
  const errors = [];
  const plan = batchPlan || (typeof BATCH_PLAN !== 'undefined' ? BATCH_PLAN : []);
  if (plan.length === 0) return errors;

  // 建立 globalOrder → expectedId 映射
  const orderToId = {};
  plan.forEach(bp => {
    const idFrom = parseInt(bp.idFrom.replace('DE-', ''), 10);
    const idTo = parseInt(bp.idTo.replace('DE-', ''), 10);
    const orderFrom = idFrom; // globalOrder 与 id 数字部分一致
    const orderTo = idTo;
    for (let o = orderFrom; o <= orderTo; o++) {
      orderToId[o] = 'DE-' + String(o).padStart(4, '0');
    }
  });

  cards.forEach(c => {
    const expected = orderToId[c.globalOrder];
    if (expected && c.id !== expected) {
      errors.push({ cardId: c.id, message: `globalOrder=${c.globalOrder} 期望 id=${expected}，实际 id=${c.id}` });
    }
  });
  return errors;
}

/* ============================================================================
 * 单批校验 — 只校验指定批次的完整性（用于分批导入场景）
 * ============================================================================ */
function validateSingleBatch(wordBank, targetBatch) {
  const cards = flattenCards(wordBank).filter(c => c.batch === targetBatch);
  const errors = [];
  const warnings = [];

  if (cards.length === 0) {
    errors.push({ cardId: null, field: 'batch', message: `批次 ${targetBatch} 没有卡片` });
    return { batch: targetBatch, count: 0, errors, warnings };
  }

  // 1. 数量校验（根据 BATCH_PLAN）
  const planEntry = (typeof BATCH_PLAN !== 'undefined' ? BATCH_PLAN : []).find(b => b.batch === targetBatch);
  if (planEntry && cards.length !== planEntry.count) {
    errors.push({ cardId: null, field: 'count', message: `批次 ${targetBatch} 期望 ${planEntry.count} 张，实际 ${cards.length} 张` });
  }

  // 2. id 范围校验
  cards.sort((a, b) => a.globalOrder - b.globalOrder);
  const firstId = cards[0].id;
  const lastId = cards[cards.length - 1].id;
  if (planEntry) {
    if (firstId !== planEntry.idFrom) {
      errors.push({ cardId: null, field: 'idFrom', message: `第一张 id=${firstId}，期望 ${planEntry.idFrom}` });
    }
    if (lastId !== planEntry.idTo) {
      errors.push({ cardId: null, field: 'idTo', message: `最后一张 id=${lastId}，期望 ${planEntry.idTo}` });
    }
  }

  // 3. globalOrder 连续性（仅校验本批内部）
  const orders = cards.map(c => c.globalOrder);
  const expectedStart = orders[0];
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== expectedStart + i) {
      errors.push({ cardId: cards[i].id, field: 'globalOrder', message: `globalOrder 不连续：期望 ${expectedStart + i}，实际 ${orders[i]}` });
      if (errors.length > 10) break;
    }
  }

  // 4. id 与 globalOrder 对应
  cards.forEach(c => {
    const idNum = parseInt(c.id.replace('DE-', ''), 10);
    if (idNum !== c.globalOrder) {
      errors.push({ cardId: c.id, field: 'id/globalOrder', message: `id 数字=${idNum}，globalOrder=${c.globalOrder}，不匹配` });
    }
  });

  // 5. level 全部一致
  const expectedLevel = planEntry ? planEntry.level : cards[0].level;
  cards.forEach(c => {
    if (c.level !== expectedLevel) {
      errors.push({ cardId: c.id, field: 'level', message: `level=${c.level}，期望 ${expectedLevel}` });
    }
  });

  // 6. batch 全部一致
  cards.forEach(c => {
    if (c.batch !== targetBatch) {
      errors.push({ cardId: c.id, field: 'batch', message: `batch=${c.batch}，期望 ${targetBatch}` });
    }
  });

  // 7. 本批内部无重复 id
  const idSet = new Set();
  cards.forEach(c => {
    if (idSet.has(c.id)) errors.push({ cardId: c.id, field: 'id', message: '本批内 id 重复' });
    idSet.add(c.id);
  });

  // 8. 本批内部无重复 globalOrder
  const orderSet = new Set();
  cards.forEach(c => {
    if (orderSet.has(c.globalOrder)) errors.push({ cardId: c.id, field: 'globalOrder', message: '本批内 globalOrder 重复' });
    orderSet.add(c.globalOrder);
  });

  // 9. pronunciationStatus 全部为 unchecked
  cards.forEach(c => {
    if (c.pronunciationStatus !== 'unchecked') {
      errors.push({ cardId: c.id, field: 'pronunciationStatus', message: `pronunciationStatus=${c.pronunciationStatus}，期望 unchecked` });
    }
  });

  // 10. 无 completed 字段
  cards.forEach(c => {
    if (c.hasOwnProperty('completed')) {
      errors.push({ cardId: c.id, field: 'completed', message: '内容数据中不应包含 completed 字段' });
    }
  });

  // 11. 核心字段非空
  cards.forEach(c => {
    ['word', 'wordDisplay', 'copyText', 'shortMeaningZh', 'exampleDe', 'exampleZh', 'wordAudioText', 'exampleAudioText'].forEach(f => {
      if (!c[f] || !String(c[f]).trim()) {
        errors.push({ cardId: c.id, field: f, message: `${f} 为空` });
      }
    });
  });

  // 12. copyText === wordDisplay
  cards.forEach(c => {
    if (c.copyText !== c.wordDisplay) {
      errors.push({ cardId: c.id, field: 'copyText', message: `copyText="${c.copyText}" 与 wordDisplay="${c.wordDisplay}" 不一致` });
    }
  });

  // 13. shortMeaningZh 不含标点
  const PUNCT_RE = /[，。！？；：""''（）【】《》、,…\.!\?;:"'\(\)\[\]\{\}<>]/;
  cards.forEach(c => {
    if (PUNCT_RE.test(c.shortMeaningZh || '')) {
      const matches = (c.shortMeaningZh || '').match(PUNCT_RE);
      errors.push({ cardId: c.id, field: 'shortMeaningZh', message: `包含标点符号：${matches.join(' ')}` });
    }
  });

  // 14. 音频 URL 路径规则
  cards.forEach(c => {
    const expectedWord = `/audio/de/words/${c.id}.mp3`;
    const expectedMeaning = `/audio/zh/meanings/${c.id}.mp3`;
    const expectedExample = `/audio/de/examples/${c.id}.mp3`;
    if (c.wordAudioUrl !== expectedWord) {
      errors.push({ cardId: c.id, field: 'wordAudioUrl', message: `期望 ${expectedWord}，实际 ${c.wordAudioUrl}` });
    }
    if (c.meaningAudioUrl !== expectedMeaning) {
      errors.push({ cardId: c.id, field: 'meaningAudioUrl', message: `期望 ${expectedMeaning}，实际 ${c.meaningAudioUrl}` });
    }
    if (c.exampleAudioUrl !== expectedExample) {
      errors.push({ cardId: c.id, field: 'exampleAudioUrl', message: `期望 ${expectedExample}，实际 ${c.exampleAudioUrl}` });
    }
  });

  // 15. 允许的分类
  const ALLOWED_CATEGORIES = ['问候礼貌', '自我介绍', '国家语言', '家庭关系', '职业学习', '时间数字', '地点方位', '日常动作', '考试课堂', '基础状态'];
  cards.forEach(c => {
    if (!ALLOWED_CATEGORIES.includes(c.category)) {
      warnings.push({ cardId: c.id, field: 'category', message: `分类 "${c.category}" 不在本批允许分类中` });
    }
  });

  // 16. 检查与其他批次数据的 id 冲突
  const allCards = flattenCards(wordBank);
  const otherBatchIds = new Set(allCards.filter(c => c.batch !== targetBatch).map(c => c.id));
  cards.forEach(c => {
    if (otherBatchIds.has(c.id)) {
      errors.push({ cardId: c.id, field: 'id', message: 'id 与其他批次数据冲突' });
    }
  });

  return {
    batch: targetBatch,
    count: cards.length,
    expectedCount: planEntry ? planEntry.count : null,
    idRange: cards.length > 0 ? `${cards[0].id} – ${cards[cards.length - 1].id}` : 'N/A',
    orderRange: cards.length > 0 ? `${cards[0].globalOrder} – ${cards[cards.length - 1].globalOrder}` : 'N/A',
    categoryCounts: cards.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {}),
    errors,
    warnings,
  };
}

function formatSingleBatchReport(report) {
  const lines = [];
  lines.push('═══════════════════════════════════════');
  lines.push(`  批次 ${report.batch} 单批校验报告`);
  lines.push('═══════════════════════════════════════');
  lines.push(`  卡片数量：${report.count}${report.expectedCount ? ' / ' + report.expectedCount : ''}`);
  lines.push(`  ID 范围：${report.idRange}`);
  lines.push(`  globalOrder 范围：${report.orderRange}`);
  lines.push(`  分类统计：`);
  Object.entries(report.categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, cnt]) => {
    lines.push(`    ${cat}: ${cnt}`);
  });

  const total = report.errors.length + report.warnings.length;
  if (total === 0) {
    lines.push('\n  ✅ 本批全部校验通过');
  } else {
    if (report.errors.length > 0) {
      lines.push(`\n  ❌ 错误 (${report.errors.length}):`);
      report.errors.slice(0, 20).forEach((e, i) => {
        const id = e.cardId || '(全局)';
        lines.push(`     ${i + 1}. [${id}] ${e.field}: ${e.message}`);
      });
      if (report.errors.length > 20) lines.push(`     ... 共 ${report.errors.length} 条错误`);
    }
    if (report.warnings.length > 0) {
      lines.push(`\n  ⚠️  警告 (${report.warnings.length}):`);
      report.warnings.slice(0, 10).forEach((w, i) => {
        const id = w.cardId || '(全局)';
        lines.push(`     ${i + 1}. [${id}] ${w.field}: ${w.message}`);
      });
      if (report.warnings.length > 10) lines.push(`     ... 共 ${report.warnings.length} 条警告`);
    }
  }

  lines.push('\n═══════════════════════════════════════');
  return lines.join('\n');
}

/* 全量导入校验报告 */
function validateBatchImport(wordBank, batchPlan) {
  const cards = flattenCards(wordBank);
  const report = {
    totalCards: cards.length,
    expectedTotal: typeof TOTAL_TARGET_COUNT !== 'undefined' ? TOTAL_TARGET_COUNT : 7000,
    idErrors: [],
    orderErrors: [],
    levelErrors: [],
    batchErrors: [],
    mappingErrors: [],
  };

  // ID 唯一性
  const idSet = new Set();
  cards.forEach(c => {
    if (idSet.has(c.id)) report.idErrors.push({ cardId: c.id, message: 'id 重复' });
    idSet.add(c.id);
  });

  // globalOrder 连续性
  report.orderErrors = checkGlobalOrderContinuity(cards);

  // 等级数量
  report.levelErrors = checkLevelCounts(cards, LEVEL_TARGET_COUNTS);

  // 批次数量
  report.batchErrors = checkBatchCounts(cards, batchPlan || BATCH_PLAN);

  // id-order 对应
  report.mappingErrors = checkIdOrderMapping(cards, batchPlan || BATCH_PLAN);

  return report;
}

function formatBatchImportReport(report) {
  const lines = [];
  lines.push('═══════════════════════════════════════');
  lines.push('  批量导入校验报告');
  lines.push('═══════════════════════════════════════');
  lines.push(`  总卡片数：${report.totalCards} / ${report.expectedTotal}`);

  const allOk = report.idErrors.length === 0
    && report.orderErrors.length === 0
    && report.levelErrors.length === 0
    && report.batchErrors.length === 0
    && report.mappingErrors.length === 0;

  if (allOk) {
    lines.push('  ✅ 全部校验通过，可以导入');
    return lines.join('\n');
  }

  if (report.idErrors.length > 0) {
    lines.push(`\n  ❌ ID 错误 (${report.idErrors.length}):`);
    report.idErrors.slice(0, 5).forEach(e => lines.push(`     [${e.cardId}] ${e.message}`));
  }
  if (report.orderErrors.length > 0) {
    lines.push(`\n  ❌ globalOrder 错误 (${report.orderErrors.length}):`);
    report.orderErrors.slice(0, 5).forEach(e => lines.push(`     ${e.message}`));
  }
  if (report.levelErrors.length > 0) {
    lines.push(`\n  ❌ 等级数量错误 (${report.levelErrors.length}):`);
    report.levelErrors.forEach(e => lines.push(`     ${e.message}`));
  }
  if (report.batchErrors.length > 0) {
    lines.push(`\n  ❌ 批次数量错误 (${report.batchErrors.length}):`);
    report.batchErrors.forEach(e => lines.push(`     ${e.message}`));
  }
  if (report.mappingErrors.length > 0) {
    lines.push(`\n  ❌ id-globalOrder 映射错误 (${report.mappingErrors.length}):`);
    report.mappingErrors.slice(0, 5).forEach(e => lines.push(`     [${e.cardId}] ${e.message}`));
  }

  lines.push('\n═══════════════════════════════════════');
  return lines.join('\n');
}
