# Quick commit and push script for Ertiga project
# Usage: .\quick-push.ps1 [commit-message]

param(
    [string]$message = "Update"
)

# Get current directory
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Change to project directory
Push-Location $projectDir

try {
    # Check git status
    $status = git status --short
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Not a git repository" -ForegroundColor Red
        exit 1
    }
    
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host "✅ No changes to commit" -ForegroundColor Green
        exit 0
    }
    
    Write-Host "📝 Changes detected:" -ForegroundColor Cyan
    Write-Host $status
    Write-Host ""
    
    # Stage all changes
    git add .
    Write-Host "✔️ Staged all changes" -ForegroundColor Green
    
    # Commit
    git commit -m $message
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Commit failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✔️ Committed: '$message'" -ForegroundColor Green
    
    # Push to origin main
    git push origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Push failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✔️ Pushed to origin/main" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Commit & push completed successfully!" -ForegroundColor Green
    
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}
