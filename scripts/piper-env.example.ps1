<# ============================================================================
 piper-env.example.ps1 — Piper 本地 TTS 环境变量

 用法：
   . .\scripts\piper-env.example.ps1

 如果 PowerShell 不允许执行 ps1，先运行：
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
 ============================================================================ #>

$env:TTS_PROVIDER = "piper"
$env:PIPER_EXE    = "D:\Yuan\tts\piper\piper\piper.exe"
$env:PIPER_MODEL  = "D:\Yuan\tts\models\de_DE-thorsten-high.onnx"
$env:PIPER_CONFIG = "D:\Yuan\tts\models\de_DE-thorsten-high.onnx.json"
$env:FFMPEG_EXE   = "C:\Users\Yuan 1\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"

Write-Host "[piper-env] 环境变量已加载:" -ForegroundColor Cyan
Write-Host "  TTS_PROVIDER = $env:TTS_PROVIDER"
Write-Host "  PIPER_EXE    = $env:PIPER_EXE"
Write-Host "  PIPER_MODEL  = $env:PIPER_MODEL"
Write-Host "  PIPER_CONFIG = $env:PIPER_CONFIG"
Write-Host "  FFMPEG_EXE   = $env:FFMPEG_EXE"
