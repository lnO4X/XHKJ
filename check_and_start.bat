@echo off
echo === Docker Status === > C:\Users\eashe\x\XHKJ\mainsite\status.log 2>&1
docker ps -a >> C:\Users\eashe\x\XHKJ\mainsite\status.log 2>&1
echo. >> C:\Users\eashe\x\XHKJ\mainsite\status.log
echo === Node Version === >> C:\Users\eashe\x\XHKJ\mainsite\status.log 2>&1
node --version >> C:\Users\eashe\x\XHKJ\mainsite\status.log 2>&1
echo. >> C:\Users\eashe\x\XHKJ\mainsite\status.log
echo === CMS node_modules check === >> C:\Users\eashe\x\XHKJ\mainsite\status.log 2>&1
dir C:\Users\eashe\x\XHKJ\mainsite\xinghui-cms\node_modules\.package-lock.json >> C:\Users\eashe\x\XHKJ\mainsite\status.log 2>&1
echo. >> C:\Users\eashe\x\XHKJ\mainsite\status.log
echo === Web node_modules check === >> C:\Users\eashe\x\XHKJ\mainsite\status.log 2>&1
dir C:\Users\eashe\x\XHKJ\mainsite\xinghui-web\node_modules\.package-lock.json >> C:\Users\eashe\x\XHKJ\mainsite\status.log 2>&1
echo. >> C:\Users\eashe\x\XHKJ\mainsite\status.log
echo === DONE === >> C:\Users\eashe\x\XHKJ\mainsite\status.log
