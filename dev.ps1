# Run the app even if npm isn't on PATH yet (restart terminal after Node install)
$nodeDir = "C:\Program Files\nodejs"
if (Test-Path $nodeDir) {
  $env:Path = "$nodeDir;$env:Path"
}

Set-Location $PSScriptRoot

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: npm not found. Install Node.js from https://nodejs.org" -ForegroundColor Red
  Write-Host "Or restart Cursor / your terminal after installing." -ForegroundColor Yellow
  exit 1
}

Write-Host "Using: $(node -v) / npm $(npm -v)" -ForegroundColor Green
npm run dev
