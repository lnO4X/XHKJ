@echo off
cd /d C:\Users\eashe\x\XHKJ\mainsite\xinghui-cms
npm run develop > C:\Users\eashe\x\XHKJ\mainsite\cms_start.log 2>&1
echo EXIT=%ERRORLEVEL% >> C:\Users\eashe\x\XHKJ\mainsite\cms_start.log
