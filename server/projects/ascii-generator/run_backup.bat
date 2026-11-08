@echo off
chcp 65001 >nul
title ASCII Generator [BACKUP RUNNER]
color 02
cls
echo [BACKUP ENGINE ACTIVATED]
echo Invoking standalone Python fallback...
python code_backup.py
pause
