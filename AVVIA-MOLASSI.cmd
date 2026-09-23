@echo off
setlocal
cd /d "%~dp0"
set "MOLASSI_PYTHON=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%MOLASSI_PYTHON%" goto bundled
where py >nul 2>nul
if errorlevel 1 goto missing
py -3 serve.py
goto end
:bundled
"%MOLASSI_PYTHON%" serve.py
goto end
:missing
echo Python non trovato. Installa Python 3.10 o successivo.
echo Poi esegui: py -3 -m pip install -r requirements.txt
:end
pause
