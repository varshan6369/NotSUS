@echo off
chcp 65001 >nul
title Matrix Digital Rain Terminal
color 0A
cls
echo [MATRIX RAIN] Launching console digital rain...
echo Press Ctrl+C anytime to stop.
echo.
python code.py
pause
