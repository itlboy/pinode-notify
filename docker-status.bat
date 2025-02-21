@echo off
docker info >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Docker is NOT running.
    exit /b 1
) ELSE (
    echo Docker is running.
    exit /b 0
)
