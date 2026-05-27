# Deutsch Copy

德语单词抄写学习工具 — 纯静态 PWA，支持 GitHub Pages 部署。

## 功能

- A1–C2 德语单词词卡，含德语例句和中文翻译
- 单词/例句德语发音（mp3 + Web Speech TTS fallback）
- 抄写模式：输入德语单词进行练习
- 进度本地存储（localStorage）
- PWA：可添加到手机主屏幕
- 离线缓存（Service Worker）

## 本地开发

```bash
# 启动本地服务器
npx http-server . -p 5173 -c-1

# 打开浏览器
# http://127.0.0.1:5173
```

## 部署到 GitHub Pages

### 1. 创建 GitHub 仓库

在 GitHub 上创建新仓库，例如 `deutsch-copy`。

### 2. 推送代码

```bash
cd deutsch-copy
git init
git add -A
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/deutsch-copy.git
git branch -M main
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 打开仓库 → Settings → Pages。
2. Source 选择 **Deploy from a branch**。
3. Branch 选择 **main**，Folder 选择 **/ (root)**。
4. 点击 Save。
5. 等待 1–2 分钟，GitHub 会显示发布地址。

### 4. 访问

```
https://你的用户名.github.io/deutsch-copy/
```

### 5. 手机测试

1. **iPhone：** 用 Safari 打开上面的地址。
2. 点击底部「部署检查」按钮，确认所有检查通过。
3. 点击「测试播放 DE-0001」，确认能听到德语音频。
4. 点击分享按钮 → 选择「添加到主屏幕」。
5. 从主屏幕打开 Deutsch Copy 图标。

### 6. Android 测试

1. 用 Chrome 打开 GitHub Pages 地址。
2. 点击「部署检查」→「测试播放 DE-0001」。
3. 点击菜单 (⋮) →「添加到主屏幕」或「安装应用」。

### 验证部署

```bash
# 运行部署准备检查
node scripts/check-github-pages-ready.mjs

# 查看检查报告
cat reports/github-pages-ready.json
```

## 项目结构

```
deutsch-copy/
├── index.html              # 主页面
├── 404.html                # 404 页面
├── .nojekyll               # 禁用 Jekyll 处理
├── manifest.webmanifest    # PWA manifest
├── service-worker.js       # Service Worker (缓存)
├── css/
│   └── app.css
├── js/
│   ├── data.js             # 词卡数据
│   ├── storage.js          # 进度存储
│   ├── audio.js            # 音频播放
│   ├── certificates.js     # 证书生成
│   ├── validate.js         # 校验
│   └── app.js              # 主逻辑 + 部署检查
├── theme/
│   └── brand-research-theme.css
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── audio/
│   └── de/
│       ├── words/          # 德语单词 mp3
│       └── examples/       # 德语例句 mp3
├── tools/
│   └── audio-review-batch-*.html  # 音频听审
├── scripts/
│   ├── check-github-pages-ready.mjs
│   └── ...
└── reports/
    └── github-pages-ready.json
```

## 音频路径说明

所有词卡音频 URL 以 `/audio/` 开头。页面加载时会自动检测 GitHub Pages 子路径，通过 `resolveAssetUrl()` 函数添加 base path 前缀：

- 本地: `/audio/de/words/DE-0001.mp3` → 直接请求
- GitHub Pages: `/audio/de/words/DE-0001.mp3` → 自动转为 `/deutsch-copy/audio/de/words/DE-0001.mp3`

## 故障排除

### 手机听不到音频

1. 点击「部署检查」，确认「Word 音频 DE-0001」显示通过。
2. 如果显示失败，检查显示的 URL 是否正确。
3. 尝试手动访问：`https://你的用户名.github.io/deutsch-copy/audio/de/words/DE-0001.mp3`
4. 确认 GitHub Pages 已完成部署（Settings → Pages 显示绿色 ✓）。
5. iPhone Safari 需要在用户点击后才会播放音频，这是系统限制。

### 更新后手机仍播放旧文件

1. 刷新页面。
2. 清除 Safari 缓存：设置 → Safari → 清除历史记录与网站数据。
3. 或者更新 `service-worker.js` 中的 `CACHE_SHELL` 版本号（如 `deutsch-copy-shell-v2`）。

### Service Worker 不工作

- Service Worker 需要 HTTPS 或 localhost 环境。
- 局域网 HTTP 地址（如 `192.168.x.x`）不支持 Service Worker，这是正常的。
- GitHub Pages 默认提供 HTTPS，Service Worker 会正常工作。
