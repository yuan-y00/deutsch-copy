<# ============================================================================
 setup-piper-env.ps1 — 本地 Piper TTS 环境准备脚本

 功能：
   1. 创建 D:\Yuan\tts 目录结构
   2. 检查/安装 ffmpeg
   3. 检查/下载 Piper Windows 可执行文件
   4. 检查/下载德语 Thorsten High 模型
   5. 生成环境检查报告

 用法：
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\scripts\setup-piper-env.ps1
 ============================================================================ #>

$ErrorActionPreference = "Continue"

# ============================================================================
# 配置
# ============================================================================

$TtsRoot     = "D:\Yuan\tts"
$PiperDir    = "$TtsRoot\piper"
$ModelsDir   = "$TtsRoot\models"
$DownloadsDir = "$TtsRoot\downloads"
$LogsDir     = "$TtsRoot\logs"

$PiperExe    = "$PiperDir\piper.exe"
$PiperZip    = "$DownloadsDir\piper_windows_amd64.zip"

$ModelFile   = "$ModelsDir\de_DE-thorsten-high.onnx"
$ConfigFile  = "$ModelsDir\de_DE-thorsten-high.onnx.json"

# Piper release URL — 用户可根据需要修改
$PiperRepo   = "https://github.com/rhasspy/piper/releases"
# 常见 Windows amd64 zip 文件名（Piper 发布页可查具体版本）
$PiperZipName = "piper_windows_amd64.zip"

# Hugging Face 模型下载 URL
$ModelUrl    = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx?download=true"
$ConfigUrl   = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx.json?download=true"

# 备选: Thorsten-Voice/Piper 仓库
$ModelUrlAlt = "https://huggingface.co/Thorsten-Voice/Piper/resolve/main/de_DE-thorsten-high.onnx?download=true"
$ConfigUrlAlt = "https://huggingface.co/Thorsten-Voice/Piper/resolve/main/de_DE-thorsten-high.onnx.json?download=true"

$FfmpegInstallId = "Gyan.FFmpeg"

$ReportDir   = "reports"
$ReportFile  = "$ReportDir\piper-env-check.json"

# 环境检查结果容器
$Report = @{
    checkedAt       = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffK")
    os              = ""
    nodeAvailable   = $false
    npmAvailable    = $false
    ffmpegAvailable = $false
    ffmpegVersion   = ""
    piperExePath    = $PiperExe
    piperExists     = $false
    piperRunnable   = $false
    piperVersionOrHelpResult = ""
    modelPath       = $ModelFile
    modelExists     = $false
    modelFileSizeBytes = 0
    configPath      = $ConfigFile
    configExists    = $false
    configFileSizeBytes = 0
    setupComplete   = $false
    warnings        = @()
    errors          = @()
    nextCommands    = @()
}

# ============================================================================
# 辅助函数
# ============================================================================

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-OK {
    param([string]$Message)
    Write-Host "  [OK] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "  [WARN] $Message" -ForegroundColor Yellow
    $script:Report.warnings += $Message
}

function Write-Err {
    param([string]$Message)
    Write-Host "  [ERROR] $Message" -ForegroundColor Red
    $script:Report.errors += $Message
}

function Write-Info {
    param([string]$Message)
    Write-Host "  [INFO] $Message" -ForegroundColor Gray
}

# ============================================================================
# 1. 目录创建
# ============================================================================

Write-Step "1. 创建 TTS 目录结构"

$dirs = @($TtsRoot, $PiperDir, $ModelsDir, $DownloadsDir, $LogsDir)
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
        Write-OK "已创建: $d"
    } else {
        Write-OK "已存在: $d"
    }
}

# ============================================================================
# 2. 系统检测
# ============================================================================

Write-Step "2. 系统环境检测"

$Report.os = if ($IsWindows -or $env:OS -eq "Windows_NT") { "Windows" } else { "Unknown" }
Write-Info "OS: $($Report.os)"

try {
    $nodeVer = & node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $Report.nodeAvailable = $true
        Write-OK "Node.js: $nodeVer"
    } else {
        Write-Err "Node.js 不可用"
    }
} catch {
    Write-Err "Node.js 不可用: $_"
}

try {
    $npmVer = & npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $Report.npmAvailable = $true
        Write-OK "npm: $npmVer"
    } else {
        Write-Err "npm 不可用"
    }
} catch {
    Write-Err "npm 不可用: $_"
}

# ============================================================================
# 3. ffmpeg 检查与安装
# ============================================================================

Write-Step "3. ffmpeg 检查与安装"

try {
    $ffmpegOut = & ffmpeg -version 2>&1 | Select-Object -First 1
    if ($LASTEXITCODE -eq 0 -and $ffmpegOut) {
        $Report.ffmpegAvailable = $true
        $Report.ffmpegVersion = $ffmpegOut.Trim()
        Write-OK "ffmpeg 已可用: $($Report.ffmpegVersion)"
    } else {
        throw "ffmpeg 未找到"
    }
} catch {
    Write-Warn "ffmpeg 不可用，尝试使用 winget 安装..."

    try {
        $wingetVer = & winget --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Info "winget 可用: $wingetVer"
            Write-Info "执行: winget install -e --id $FfmpegInstallId"

            & winget install -e --id $FfmpegInstallId 2>&1 | Write-Host

            if ($LASTEXITCODE -eq 0) {
                Write-OK "ffmpeg 安装命令已执行"
                Write-Warn "请关闭当前 PowerShell，重新打开后运行: ffmpeg -version"
                $Report.nextCommands += "ffmpeg -version  # 验证 ffmpeg 安装"
            } else {
                Write-Err "winget 安装 ffmpeg 失败 (exit code: $LASTEXITCODE)"
            }
        } else {
            Write-Err "winget 不可用，无法自动安装 ffmpeg"
        }
    } catch {
        Write-Err "winget 不可用: $_"
    }

    # 输出手动安装说明
    if (-not $Report.ffmpegAvailable) {
        Write-Host ""
        Write-Host "  --- 手动安装 ffmpeg ---" -ForegroundColor Yellow
        Write-Host "  方式 1 (winget):" -ForegroundColor Yellow
        Write-Host "    winget install -e --id Gyan.FFmpeg" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  方式 2 (官网下载):" -ForegroundColor Yellow
        Write-Host "    下载: https://ffmpeg.org/download.html" -ForegroundColor Yellow
        Write-Host "    解压后将 bin 目录加入 PATH" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  安装后请重新打开 PowerShell 并运行:" -ForegroundColor Yellow
        Write-Host "    ffmpeg -version" -ForegroundColor Yellow
        Write-Host "  ---------------------------------" -ForegroundColor Yellow
        $Report.nextCommands += "# 手动安装 ffmpeg 后运行: ffmpeg -version"
    }
}

# ============================================================================
# 4. Piper 检查与下载
# ============================================================================

Write-Step "4. Piper 检查与下载"

if (Test-Path $PiperExe) {
    $Report.piperExists = $true
    Write-OK "piper.exe 已存在: $PiperExe"

    # 尝试运行 --help
    try {
        $piperHelp = & $PiperExe --help 2>&1
        if ($LASTEXITCODE -eq 0 -or $piperHelp) {
            $Report.piperRunnable = $true
            $Report.piperVersionOrHelpResult = ($piperHelp | Select-Object -First 3) -join "`n"
            Write-OK "piper.exe 可运行"
            Write-Info ($piperHelp | Select-Object -First 3)
        } else {
            Write-Warn "piper.exe 存在但运行异常"
        }
    } catch {
        Write-Warn "piper.exe 存在但运行异常: $_"
    }
} else {
    Write-Warn "piper.exe 不存在，尝试自动下载..."

    # 尝试从 GitHub 下载
    Write-Info "Piper Windows 下载需要知道具体版本号。"
    Write-Info "请访问: $PiperRepo"
    Write-Host ""
    Write-Host "  --- 手动下载 Piper ---" -ForegroundColor Yellow
    Write-Host "  1. 访问: $PiperRepo" -ForegroundColor Yellow
    Write-Host "  2. 找到最新 release" -ForegroundColor Yellow
    Write-Host "  3. 下载: piper_windows_amd64.zip" -ForegroundColor Yellow
    Write-Host "  4. 保存到: $PiperZip" -ForegroundColor Yellow
    Write-Host "  5. 解压到: $PiperDir" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  PowerShell 解压命令:" -ForegroundColor Yellow
    Write-Host "    Expand-Archive -Path `"$PiperZip`" -DestinationPath `"$PiperDir`" -Force" -ForegroundColor Yellow
    Write-Host "  ---------------------------------" -ForegroundColor Yellow

    # 尝试通用下载方式（使用已知的 release URL 模式）
    # Piper 的 release 版本号不是固定的，这里提供手动步骤
    $Report.nextCommands += "# 手动下载 piper_windows_amd64.zip 并解压到 $PiperDir"
}

# ============================================================================
# 5. 德语模型检查与下载
# ============================================================================

Write-Step "5. 德语模型检查与下载"

# 检查 onnx
if (Test-Path $ModelFile) {
    $Report.modelExists = $true
    $Report.modelFileSizeBytes = (Get-Item $ModelFile).Length
    Write-OK "模型文件已存在: $ModelFile ($($Report.modelFileSizeBytes) bytes)"
} else {
    Write-Warn "模型文件不存在: $ModelFile"
    Write-Info "尝试从 Hugging Face 下载..."

    try {
        Write-Info "下载: $ModelUrl"
        Invoke-WebRequest -Uri $ModelUrl -OutFile $ModelFile -ErrorAction Stop
        if (Test-Path $ModelFile) {
            $Report.modelExists = $true
            $Report.modelFileSizeBytes = (Get-Item $ModelFile).Length
            Write-OK "模型下载成功: $($Report.modelFileSizeBytes) bytes"
        }
    } catch {
        Write-Warn "主 URL 下载失败，尝试备选 URL..."
        try {
            Write-Info "下载备选: $ModelUrlAlt"
            Invoke-WebRequest -Uri $ModelUrlAlt -OutFile $ModelFile -ErrorAction Stop
            if (Test-Path $ModelFile) {
                $Report.modelExists = $true
                $Report.modelFileSizeBytes = (Get-Item $ModelFile).Length
                Write-OK "模型下载成功 (备选): $($Report.modelFileSizeBytes) bytes"
            }
        } catch {
            Write-Err "模型自动下载失败: $_"
        }
    }

    if (-not $Report.modelExists) {
        Write-Host ""
        Write-Host "  --- 手动下载模型 ---" -ForegroundColor Yellow
        Write-Host "  方式 1 (Hugging Face):" -ForegroundColor Yellow
        Write-Host "    $ModelUrl" -ForegroundColor Yellow
        Write-Host "    保存到: $ModelFile" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  方式 2 (备选):" -ForegroundColor Yellow
        Write-Host "    $ModelUrlAlt" -ForegroundColor Yellow
        Write-Host "    保存到: $ModelFile" -ForegroundColor Yellow
        Write-Host "  ---------------------------------" -ForegroundColor Yellow
    }
}

# 检查 onnx.json
if (Test-Path $ConfigFile) {
    $Report.configExists = $true
    $Report.configFileSizeBytes = (Get-Item $ConfigFile).Length
    Write-OK "配置文件已存在: $ConfigFile ($($Report.configFileSizeBytes) bytes)"
} else {
    Write-Warn "配置文件不存在: $ConfigFile"
    Write-Info "尝试从 Hugging Face 下载..."

    try {
        Write-Info "下载: $ConfigUrl"
        Invoke-WebRequest -Uri $ConfigUrl -OutFile $ConfigFile -ErrorAction Stop
        if (Test-Path $ConfigFile) {
            $Report.configExists = $true
            $Report.configFileSizeBytes = (Get-Item $ConfigFile).Length
            Write-OK "配置文件下载成功: $($Report.configFileSizeBytes) bytes"
        }
    } catch {
        Write-Warn "主 URL 下载失败，尝试备选 URL..."
        try {
            Write-Info "下载备选: $ConfigUrlAlt"
            Invoke-WebRequest -Uri $ConfigUrlAlt -OutFile $ConfigFile -ErrorAction Stop
            if (Test-Path $ConfigFile) {
                $Report.configExists = $true
                $Report.configFileSizeBytes = (Get-Item $ConfigFile).Length
                Write-OK "配置文件下载成功 (备选): $($Report.configFileSizeBytes) bytes"
            }
        } catch {
            Write-Err "配置文件自动下载失败: $_"
        }
    }

    if (-not $Report.configExists) {
        Write-Host ""
        Write-Host "  --- 手动下载配置文件 ---" -ForegroundColor Yellow
        Write-Host "  方式 1:" -ForegroundColor Yellow
        Write-Host "    $ConfigUrl" -ForegroundColor Yellow
        Write-Host "    保存到: $ConfigFile" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  方式 2 (备选):" -ForegroundColor Yellow
        Write-Host "    $ConfigUrlAlt" -ForegroundColor Yellow
        Write-Host "    保存到: $ConfigFile" -ForegroundColor Yellow
        Write-Host "  ---------------------------------" -ForegroundColor Yellow
    }
}

# ============================================================================
# 6. 判断 setupComplete
# ============================================================================

Write-Step "6. 完整性检查"

$allReady = $true

if (-not $Report.ffmpegAvailable) {
    Write-Warn "ffmpeg 未就绪 — 需要手动安装或重新打开 PowerShell"
    $allReady = $false
}
if (-not $Report.piperExists) {
    Write-Warn "piper.exe 未就绪 — 需要手动下载"
    $allReady = $false
}
if (-not $Report.modelExists) {
    Write-Warn "德语模型 .onnx 未就绪 — 需要手动下载"
    $allReady = $false
}
if (-not $Report.configExists) {
    Write-Warn "模型配置 .onnx.json 未就绪 — 需要手动下载"
    $allReady = $false
}

if ($allReady) {
    $Report.setupComplete = $true
    Write-OK "所有组件已就绪!"
} else {
    Write-Warn "部分组件未就绪，请按提示手动处理"
}

# ============================================================================
# 7. 生成环境检查报告
# ============================================================================

Write-Step "7. 生成环境检查报告"

if (-not (Test-Path $ReportDir)) {
    New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null
}

$Report.nextCommands += ". .\scripts\piper-env.example.ps1"
$Report.nextCommands += "node scripts/test-piper-one.mjs"

$Report | ConvertTo-Json -Depth 4 | Out-File -FilePath $ReportFile -Encoding UTF8
Write-OK "报告已保存: $ReportFile"

# ============================================================================
# 8. 终端总结
# ============================================================================

Write-Step "8. 总结"

Write-Host ""
Write-Host "  环境检测结果:" -ForegroundColor White
Write-Host "  ----------------------------------------"
Write-Host "  OS:              $($Report.os)"
Write-Host "  Node.js:         $(if ($Report.nodeAvailable) { 'OK' } else { 'MISSING' })"
Write-Host "  npm:             $(if ($Report.npmAvailable) { 'OK' } else { 'MISSING' })"
Write-Host "  ffmpeg:          $(if ($Report.ffmpegAvailable) { 'OK' } else { 'MISSING' })"
Write-Host "  piper.exe:       $(if ($Report.piperExists) { 'OK' } else { 'MISSING' })"
Write-Host "  .onnx 模型:      $(if ($Report.modelExists) { 'OK' } else { 'MISSING' })"
Write-Host "  .onnx.json:      $(if ($Report.configExists) { 'OK' } else { 'MISSING' })"
Write-Host "  setupComplete:   $($Report.setupComplete)"
Write-Host "  ----------------------------------------"

if ($Report.warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "  警告 (${($Report.warnings.Count)}):" -ForegroundColor Yellow
    $Report.warnings | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
}

if ($Report.errors.Count -gt 0) {
    Write-Host ""
    Write-Host "  错误 (${($Report.errors.Count)}):" -ForegroundColor Red
    $Report.errors | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
}

Write-Host ""
Write-Host "  下一步命令:" -ForegroundColor White
Write-Host "  ----------------------------------------"
$stepNum = 1
Write-Host "  $stepNum. cd /d D:\Yuan\deutsch-copy"
$stepNum++
Write-Host "  $stepNum. Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass  (如需)"
$stepNum++
Write-Host "  $stepNum. .\scripts\setup-piper-env.ps1  (即本脚本)"
$stepNum++
Write-Host "  $stepNum. . .\scripts\piper-env.example.ps1"
$stepNum++
Write-Host "  $stepNum. ffmpeg -version"
$stepNum++
Write-Host "  $stepNum. node scripts/test-piper-one.mjs"
Write-Host "  ----------------------------------------"

if ($Report.setupComplete) {
    Write-Host ""
    Write-Host "  所有组件已就绪，可以运行测试和后续音频生成!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  请先完成上述缺失组件的安装，再重新运行本脚本。" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  报告文件: $ReportFile" -ForegroundColor Gray
Write-Host ""
