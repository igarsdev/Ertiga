@echo off
setlocal EnableExtensions EnableDelayedExpansion

set /p msg="Enter commit message (or press Enter for 'update'): "
if not defined msg set "msg=update"

echo Checking remote updates...
git fetch --prune origin main
if errorlevel 1 goto :error

echo Staging changes...
git add -A
if errorlevel 1 goto :error

git diff --cached --quiet
if not errorlevel 1 (
	echo No changes to commit.
	goto :end
)

echo Creating commit...
git commit -m "!msg!"
if errorlevel 1 goto :error

echo Pushing to origin/main...
git push origin main
if not errorlevel 1 goto :success

echo Push was rejected. Rebasing onto the latest origin/main...
git pull --rebase --autostash origin main
if errorlevel 1 goto :error

echo Pushing again...
git push origin main
if errorlevel 1 goto :error

:success
echo.
echo Sync complete!
goto :end

:error
echo.
echo Sync failed. Please resolve the error above and try again.

:end
endlocal
pause
