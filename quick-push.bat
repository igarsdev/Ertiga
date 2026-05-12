@echo off
REM Quick commit and push script batch file
REM Usage: quick-push.bat [commit-message]

setlocal enabledelayedexpansion

set "message=%~1"
if "!message!"=="" set "message=Update"

echo.
echo 📝 Quick Commit ^& Push
echo ========================
echo.

cd /d "%~dp0"

REM Check if git is available
where git >nul 2>nul
if errorlevel 1 (
    echo ❌ Git is not installed or not in PATH
    exit /b 1
)

REM Check git status
git status --short >nul 2>nul
if errorlevel 1 (
    echo ❌ Error: Not a git repository
    exit /b 1
)

REM Get status
for /f %%A in ('git status --short') do (
    set "hasChanges=1"
)

if not defined hasChanges (
    echo ✅ No changes to commit
    echo.
    exit /b 0
)

echo 📊 Changes detected:
git status --short
echo.

REM Stage, commit, and push
echo ⏳ Staging changes...
git add .

echo ⏳ Committing with message: "!message!"
git commit -m "!message!"
if errorlevel 1 (
    echo ❌ Commit failed
    exit /b 1
)

echo ⏳ Pushing to origin/main...
git push origin main
if errorlevel 1 (
    echo ❌ Push failed
    exit /b 1
)

echo.
echo ✅ Commit ^& Push completed successfully!
echo.
