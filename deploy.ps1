# ==============================================
# Kreasi Fashion - Auto Build, Commit & Push (Windows)
# URL: https://visio.cepat.digital/kreasi/
# ==============================================

$ErrorActionPreference = "Stop"

Write-Host "Building project..." -ForegroundColor Cyan
npm run build

Write-Host ""
Write-Host "Staging all changes (including dist/)..." -ForegroundColor Cyan
git add -A

# Auto-generate commit message with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMsg = if ($args[0]) { $args[0] } else { "Deploy: auto build & push - $timestamp" }

Write-Host "Committing: $commitMsg" -ForegroundColor Cyan
$commitResult = git commit -m $commitMsg 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing to commit, working tree clean." -ForegroundColor Yellow
} else {
    Write-Host $commitResult
}

Write-Host ""
Write-Host "Pushing to GitHub (origin/main)..." -ForegroundColor Cyan
git push origin main

Write-Host ""
Write-Host "Done! Deployed to GitHub successfully." -ForegroundColor Green
Write-Host "Selanjutnya, pull dari cPanel atau upload isi folder dist/ ke public_html/kreasi/" -ForegroundColor Yellow
