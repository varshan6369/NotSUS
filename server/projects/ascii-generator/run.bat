@echo off
chcp 65001 >nul
title ASCII Generator v1.0.0 [Console Edition]
color 0A
cls
echo ========================================================
echo   ASCII GENERATOR v1.0.0 — LOCAL TERMINAL UTILITY
echo ========================================================
echo.
echo [INIT] Verifying Python runtime...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python was not found in your system PATH.
    echo Please ensure Python 3.8 or newer is installed from python.org.
    echo.
    pause
    exit /b 1
)
echo [OK] Python runtime detected.
echo [RUN] Launching ASCII Generator script...
echo.
python code.py
echo.
echo [EXIT] Process finished.
pause
