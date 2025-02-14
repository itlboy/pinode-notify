@echo off
cd /d %~dp0
echo Stop if running
docker compose down -t0
echo Pulling latest images...
docker compose pull
echo Starting containers...
docker compose up -d
echo Done.
