@echo off
cd /d C:\Users\eashe\x\XHKJ\mainsite\xinghui-cms
rmdir /s /q dist 2>nul
npm run develop > C:\Users\eashe\x\XHKJ\mainsite\cms_start.log 2>&1
