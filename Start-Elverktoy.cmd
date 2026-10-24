@echo off
chcp 65001 >nul
title Elverktøy
cd /d "%~dp0"
echo Starter Elverktøy på http://localhost:5180/
echo La dette vinduet stå åpent mens du tester. Lukk det for å stoppe appen.
echo.
node tools\serve.mjs --port=5180 --open
if errorlevel 1 (
  echo.
  echo Serveren stoppet med en feil. Sjekk at Node.js er installert.
  pause
)
