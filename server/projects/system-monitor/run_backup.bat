@echo off
chcp 65001 >nul
title System Monitor [BACKUP RUNNER]
color 0E
echo ========================================================
echo   SYSTEM HARDWARE MONITOR (BACKUP FALLBACK RUNNER)
echo ========================================================
echo.
python code_backup.py
pause
