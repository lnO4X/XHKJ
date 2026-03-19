@echo off
cd /d C:\Users\eashe\x\XHKJ\mainsite\xinghui-cms
if exist dist rmdir /s /q dist
npm run develop > C:\Users\eashe\x\XHKJ\mainsite\cms_start.log 2>&1
