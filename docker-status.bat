@echo off
docker info >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Docker is NOT running.
    timeout /t 10 /nobreak >nul
    exit /b 1
) ELSE (
    echo Docker is running.
    timeout /t 10 /nobreak >nul
    exit /b 0
)
