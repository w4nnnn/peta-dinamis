@echo off
echo ==============================================
echo   OpenStreetMap Tile Downloader
echo ==============================================
echo.

cd /d "%~dp0.."
node scripts/download-tiles.mjs

echo.
pause
