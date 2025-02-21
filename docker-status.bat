@echo off
docker info >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Docker is NOT running. Restarting the computer in 10 seconds...
    timeout /t 10 /nobreak >nul
    shutdown /r /t 0
) ELSE (
    echo Docker is running.
    timeout /t 10 /nobreak >nul
    exit /b 0
)
