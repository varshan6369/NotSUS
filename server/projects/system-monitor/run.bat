@echo off
chcp 65001 >nul
title System Hardware Monitor [Retro Terminal]
color 0A
cls
echo [MONITOR] Inspecting local system telemetry...
python code.py
pause
