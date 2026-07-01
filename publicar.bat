@echo off
chcp 65001 >nul
title Publicar Patrones
color 0A

echo ========================================
echo   PUBLICAR PATRONES EN LA WEB
echo ========================================
echo.

REM Paso 1: Actualizar catalogo e imagenes
echo [1/3] Escaneando PDFs y extrayendo imagenes...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0update.ps1"
python "%~dp0extract_images.py"
echo.

REM Paso 2: Sincronizar con Google Drive
echo [2/3] Sincronizando PDFs con Google Drive...
echo.
python "%~dp0google_drive_sync.py"
echo.

REM Paso 3: Subir a GitHub
echo [3/3] Subiendo a la web...
echo.
cd /d "%~dp0"
git add .
git commit -m "Actualizar patrones"
git push
echo.

echo ========================================
echo   ¡LISTO! Tu web se actualiza en 1-2 min
echo ========================================
echo.
echo Web: https://tomascor.github.io/natalia-patrones/
echo.
pause
