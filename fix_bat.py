content = """@echo off
chcp 65001 >nul
title Publicar Patrones
color 0A

echo ========================================
echo   PUBLICAR PATRONES EN LA WEB
echo ========================================
echo.

echo [0/3] Eliminando patrones marcados...
echo.
python "%~dp0delete_patterns.py"
echo.

echo [1/3] Escaneando PDFs y extrayendo imagenes...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0update.ps1"
python "%~dp0extract_images.py"
echo.

echo [2/3] Subiendo a la web...
echo.
cd /d "%~dp0"
git add .
git commit -m "Actualizar patrones"
git push
echo.

echo ========================================
echo   LISTO! Tu web se actualiza en 1-2 min
echo ========================================
echo.
echo Web: https://natalia-punto.netlify.app/
echo.
pause
"""

with open("D:/Natalia/web/publicar.bat", "wb") as f:
    f.write(content.encode("ascii"))
print("OK")
