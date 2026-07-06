@echo off
chcp 65001 >nul
title Agregar y Publicar Patrones
color 0A

echo ========================================
echo   AGREGAR Y PUBLICAR PATRONES
echo ========================================
echo.

echo [1/5] Eliminando patrones marcados...
echo.
python "%~dp0delete_patterns.py"
echo.

echo [2/5] Extrayendo imagenes de PDFs...
echo.
python "%~dp0extract_images.py"
echo.

echo [3/5] Actualizando data.json...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0update.ps1"
echo.

echo [4/5] Subiendo PDFs a Google Drive...
echo.
python "%~dp0google_drive_sync.py"
echo.

echo [5/5] Copiando archivos a docs/ y subiendo a GitHub...
echo.
xcopy "%~dp0app.js" "%~dp0docs\" /Y /Q
xcopy "%~dp0index.html" "%~dp0docs\" /Y /Q
xcopy "%~dp0styles.css" "%~dp0docs\" /Y /Q
xcopy "%~dp0firebase-config.js" "%~dp0docs\" /Y /Q
xcopy "%~dp0firebase-sync.js" "%~dp0docs\" /Y /Q
xcopy "%~dp0data.json" "%~dp0docs\" /Y /Q
xcopy "%~dp0drive_links.json" "%~dp0docs\" /Y /Q
xcopy "%~dp0images\*" "%~dp0docs\images\" /Y /Q /E
cd /d "%~dp0"
git add docs/
git commit -m "Actualizar patrones"
git push
echo.

echo ========================================
echo   LISTO! Tu web se actualiza en 1-2 min
echo ========================================
echo.
echo Web: https://tomascor.github.io/natalia-patrones/
echo.
pause
