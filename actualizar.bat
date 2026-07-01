@echo off
chcp 65001 >nul
title Actualizador de Patrones
color 0A

echo ========================================
echo   ACTUALIZADOR DE PATRONES
echo ========================================
echo.
echo Este script hara lo siguiente:
echo   1. Escaneara tus PDFs nuevos
echo   2. Extraera las imagenes de primera pagina
echo   3. Actualizara el catalogo web
echo.
echo ========================================
echo.

REM Paso 1: Actualizar data.json con los PDFs
echo [1/3] Escaneando PDFs y actualizando catalogo...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0update.ps1"
echo.

REM Paso 2: Extraer imagenes de PDFs
echo [2/3] Extrayendo imagenes de primera pagina...
echo.
python "%~dp0extract_images.py"
echo.

REM Paso 3: Actualizar data.json con rutas de imagenes
echo [3/3] Conectando imagenes al catalogo...
echo.
python "%~dp0update_data_with_images.py"
echo.

echo ========================================
echo   ACTUALIZACION COMPLETADA
echo ========================================
echo.
echo Ahora puedes:
echo   - Abrir index.html para ver los cambios
echo   - Subir a GitHub para actualizar la web
echo.
pause
