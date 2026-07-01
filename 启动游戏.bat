@echo off
setlocal
cd /d "%~dp0"
title Create A Lin One - Local Server

set "NODE_EXE=node"
where node >nul 2>&1
if not errorlevel 1 goto :CHECK_APP

set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%NODE_EXE%" goto :CHECK_APP

cls
echo Node.js is not installed or available in PATH.
echo Please install the LTS version from: https://nodejs.org/
echo After installation, double-click this file again.
echo.
pause
exit /b 1

:CHECK_APP
if exist "node_modules\vite\bin\vite.js" goto :START_APP

cls
echo Game dependencies are missing.
echo Please install Node.js, then run: npm install
echo.
pause
exit /b 1

:START_APP
echo Starting the game...
echo Your browser will open automatically.
echo Keep this window open while playing.
echo.
"%NODE_EXE%" "node_modules\vite\bin\vite.js" --host 127.0.0.1 --open

echo.
echo The game server has stopped.
pause
