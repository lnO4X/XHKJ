@echo off
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo === Starting Strapi CMS ===
cd /d C:\Users\eashe\x\XHKJ\mainsite\xinghui-cms
rmdir /s /q dist 2>nul
start /b cmd /c "npm run develop > C:\Users\eashe\x\XHKJ\mainsite\cms_start.log 2>&1"

echo Waiting for CMS to start...
timeout /t 40 /nobreak >nul

echo === Starting Nuxt Web ===
cd /d C:\Users\eashe\x\XHKJ\mainsite\xinghui-web
start /b cmd /c "npm run dev > C:\Users\eashe\x\XHKJ\mainsite\web_start.log 2>&1"

echo Waiting for Web to start...
timeout /t 20 /nobreak >nul

echo === Done ===
echo CMS log:
type C:\Users\eashe\x\XHKJ\mainsite\cms_start.log
echo.
echo ===
echo Web log:
type C:\Users\eashe\x\XHKJ\mainsite\web_start.log
