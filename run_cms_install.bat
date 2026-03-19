@echo off
cd /d C:\Users\eashe\x\XHKJ\mainsite\xinghui-cms
npm install > C:\Users\eashe\x\XHKJ\mainsite\cms_install.log 2>&1
echo EXIT_CODE=%ERRORLEVEL% >> C:\Users\eashe\x\XHKJ\mainsite\cms_install.log
