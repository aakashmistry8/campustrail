# PowerShell helper to build and run backend & frontend
# Usage: ./scripts/run-all.ps1

param(
	[switch]$SkipBuild,
	[string]$ApiPort = '4000'
)

Write-Host "== CampusTrail Dev Launcher ==" -ForegroundColor Cyan
if (-not $SkipBuild) {
	Write-Host "== Building backend =="
		pushd ./backend | Out-Null
		npx tsc -p tsconfig.json
		$tsExit = $LASTEXITCODE
		popd | Out-Null
		if ($tsExit -ne 0) { Write-Error "Backend build failed"; exit 1 }
	if ($LASTEXITCODE -ne 0) { Write-Error "Backend build failed"; exit 1 }
} else {
	Write-Host "-- Skipping backend build (--SkipBuild)" -ForegroundColor Yellow
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptRoot\..

$env:PORT = $ApiPort
if (-not $env:LOG_DISABLE_MSSQL) { $env:LOG_DISABLE_MSSQL = '1' }
if (-not $env:DEV_OTP_PREVIEW) { $env:DEV_OTP_PREVIEW = '1' }
if (-not $env:VITE_API_BASE) { $env:VITE_API_BASE = "http://localhost:$ApiPort" }

Write-Host "== Starting backend on port $ApiPort =="
Start-Process -FilePath node -ArgumentList "backend/dist/src/server.js" -WorkingDirectory (Resolve-Path .) -NoNewWindow

Write-Host "== Starting frontend (Vite dev) =="
Start-Process -FilePath node -ArgumentList "frontend/node_modules/vite/bin/vite.js" -WorkingDirectory (Resolve-Path .) -NoNewWindow

# Simple health wait
Write-Host "== Waiting for backend health =="
for ($i=0; $i -lt 20; $i++) {
	try {
		$resp = Invoke-RestMethod "http://localhost:$ApiPort/health" -TimeoutSec 2
		if ($resp.status -eq 'ok') { Write-Host "Backend healthy" -ForegroundColor Green; break }
	} catch { Start-Sleep -Milliseconds 500 }
}

Write-Host "Backend: http://localhost:$ApiPort/health"
Write-Host "Frontend: http://localhost:5173"

if ($PSVersionTable.PSEdition -eq 'Desktop' -or $PSVersionTable.Platform -eq 'Win32NT') {
	try { Start-Process "http://localhost:5173" } catch {}
}
