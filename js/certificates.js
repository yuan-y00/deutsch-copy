/* ============================================================================
 * certificates.js — 证书生成和下载模块
 *
 * 证书类型：
 *   - 等级证书：当前等级全部完成后可查看
 *   - 总证书：A1–C2 全部 7000 张卡片完成后可查看
 *
 * 下载：
 *   - 保存为图片（PNG）：SVG foreignObject → canvas → download
 *   - 打印：window.print()（产生 PDF）
 * ============================================================================ */

const Certificates = (function () {
  const LEVEL_TARGETS = { A1: 650, A2: 650, B1: 1100, B2: 1200, C1: 1600, C2: 1800 };
  const TOTAL_TARGET = 7000;

  /* 生成证书编号 */
  function _generateCertId(level) {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return 'DE-' + (level || 'TOTAL') + '-' + date + '-' + rand;
  }

  /* 构建证书 HTML（inline styles，用于显示和图片导出） */
  function buildCertificateHtml(certData) {
    const { titleDe, titleZh, subtitle, completed, target, date, certId, isTotal } = certData;
    return `
<div class="cert-render" style="
  max-width:600px;margin:0 auto;padding:40px 32px;background:#fff;
  border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,0.05);
  border:2px solid #E07A5F;text-align:center;font-family:'Noto Serif SC','Playfair Display',serif;
  color:#1C1C1C;line-height:1.6;
">
  <div style="font-family:'Playfair Display','Noto Serif SC',serif;font-size:28px;font-weight:900;
    color:#C2513B;margin-bottom:4px;">${escapeHtml(titleDe)}</div>
  <div style="font-size:16px;color:#555;margin-bottom:20px;">${escapeHtml(titleZh)}</div>
  <div style="width:60px;height:2px;background:#C2513B;margin:0 auto 20px;"></div>
  ${subtitle ? `<div style="font-family:'Playfair Display','Noto Serif SC',serif;font-size:20px;
    font-weight:700;color:#4A6FA5;margin-bottom:16px;">${escapeHtml(subtitle)}</div>` : ''}
  <div style="font-size:15px;color:#555;margin-bottom:4px;">
    已完成词卡数：<strong style="color:#1C1C1C;">${completed}</strong>` +
    (isTotal ? '' : ` / ${target}`) + `</div>
  <div style="font-size:13px;color:#8B8B8B;margin-bottom:20px;">完成日期：${escapeHtml(date)}</div>
  <div style="font-size:11px;color:#8B8B8B;margin-bottom:24px;letter-spacing:0.5px;">
    证书编号：${escapeHtml(certId)}</div>
  <div style="background:#FDF6F2;border-left:3px solid #C2513B;padding:10px 14px;
    border-radius:0 8px 8px 0;font-size:11px;color:#5D3A2E;line-height:1.6;margin-bottom:20px;">
    <strong style="color:#C2513B;">非官方学习完成证明</strong><br>
    本证书由德语单词抄写工具（Deutsch Copy）生成，<br>
    不是 Goethe、telc、ÖSD 或任何官方语言考试证书。
  </div>
</div>`;
  }

  /* 渲染证书到容器 */
  function renderToContainer(containerId, certData) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = buildCertificateHtml(certData) + `
      <div style="text-align:center;margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
        <button class="cert-download-btn" id="cert-download-png"
          style="padding:8px 18px;font-size:13px;font-weight:600;border:none;border-radius:8px;
          background:#C2513B;color:#fff;cursor:pointer;font-family:'DM Sans','Noto Sans SC',sans-serif;">
          保存为图片</button>
        <button class="cert-download-btn" id="cert-download-print"
          style="padding:8px 18px;font-size:13px;font-weight:600;border:1px solid #E8E4DA;
          border-radius:8px;background:#fff;color:#1C1C1C;cursor:pointer;
          font-family:'DM Sans','Noto Sans SC',sans-serif;">
          打印证书</button>
      </div>`;
    container.classList.add('visible');

    // 绑定下载按钮
    setTimeout(() => {
      const pngBtn = document.getElementById('cert-download-png');
      const printBtn = document.getElementById('cert-download-print');
      if (pngBtn) pngBtn.addEventListener('click', () => downloadAsImage(certData));
      if (printBtn) printBtn.addEventListener('click', () => window.print());
    }, 50);
  }

  /* 下载为 PNG 图片 */
  function downloadAsImage(certData) {
    const html = buildCertificateHtml(certData);
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="520">
  <foreignObject width="640" height="520">
    <div xmlns="http://www.w3.org/1999/xhtml" style="
      width:600px;padding:40px 20px;background:#fff;text-align:center;
      font-family:'Noto Serif SC','Playfair Display',serif;color:#1C1C1C;
    ">${html.replace(/class="[^"]*"/g, '').replace(/<button[^>]*>.*?<\/button>/gs, '')}</div>
  </foreignObject>
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 520;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 640, 520);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = (certData.certId || 'certificate') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert('图片生成失败，请尝试使用"打印证书"保存为 PDF。');
    };
    img.src = url;
  }

  /* 生成等级证书数据 */
  function buildLevelCertData(level, completedCount) {
    const target = LEVEL_TARGETS[level] || completedCount;
    const now = new Date();
    const dateStr = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
    return {
      titleDe: 'Zertifikat des Deutschen Wortschatztrainings',
      titleZh: '德语词汇抄写完成证书',
      subtitle: 'Niveau ' + level,
      completed: completedCount,
      target: target,
      date: dateStr,
      certId: _generateCertId(level),
      isTotal: false,
    };
  }

  /* 生成总证书数据 */
  function buildTotalCertData(totalCompleted) {
    const now = new Date();
    const dateStr = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
    return {
      titleDe: 'Zertifikat des Deutschen Wortschatztrainings',
      titleZh: '德语词汇抄写完成证书',
      subtitle: 'A1–C2 全部等级完成',
      completed: totalCompleted,
      target: TOTAL_TARGET,
      date: dateStr,
      certId: _generateCertId('TOTAL'),
      isTotal: true,
    };
  }

  function getTotalTarget() { return TOTAL_TARGET; }
  function getLevelTarget(level) { return LEVEL_TARGETS[level] || 0; }

  return {
    buildLevelCertData, buildTotalCertData, renderToContainer,
    getTotalTarget, getLevelTarget,
  };
})();
