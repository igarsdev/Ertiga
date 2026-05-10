@echo off
set /p msg="Enter commit message (or press Enter for 'update'): "
if "%msg%"=="" set msg=update

git add .
git commit -m "%msg%"
git pull --rebase origin main
git push origin main

echo.
echo Sync complete!
pause
