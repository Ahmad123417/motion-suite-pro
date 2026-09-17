@echo off
title Motion Studio - License Generator
cd /d "%~dp0"
start "" npx electron scripts/keygen-gui.js
exit
