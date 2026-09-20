@echo off
title Mensetsu VR - Server Lokal
echo ===================================================
echo Membuka Simulasi Mensetsu VR di Browser...
echo ===================================================
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
