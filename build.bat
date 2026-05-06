@echo off
setlocal enabledelayedexpansion
title Build and Preview

REM =============================================
REM Build project and start local preview server
REM Usage: double-click to run
REM Auto-installs Node.js if missing
REM =============================================

cd /d "%~dp0"

echo.
echo ============================================
echo   Build and Preview
echo ============================================
echo.

REM ---------- Check Node.js ----------
where node >nul 2>nul
if %errorlevel% equ 0 goto :node_ok

echo   Node.js not found!
echo   Trying to auto-install...
echo.

REM ---- Method 1: winget ----
where winget >nul 2>nul
if %errorlevel% equ 0 (
    echo   [1/3] Installing via winget...
    echo.
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    if !errorlevel! equ 0 goto :node_installed
    echo   winget install failed, trying next method...
    echo.
) else (
    echo   [1/3] winget not available, skipping...
    echo.
)

REM ---- Method 2: PowerShell direct download ----
echo   [2/3] Downloading Node.js LTS via PowerShell...
echo.
set "NODE_INSTALLER=%TEMP%\node-installer-%RANDOM%.msi"
set "NODE_URL=https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi"

powershell -NoProfile -ExecutionPolicy Bypass -Command "Write-Host '   Downloading...'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { (New-Object System.Net.WebClient).DownloadFile('%NODE_URL%', '%NODE_INSTALLER%'); Write-Host '   Download OK.' } catch { Write-Host '   Download failed:' $_.Exception.Message; exit 1 }"

if %errorlevel% neq 0 (
    echo.
    echo   Official download failed. Trying npmmirror CDN...
    set "NODE_MIRROR=https://cdn.npmmirror.com/binaries/node/v20.11.1/node-v20.11.1-x64.msi"
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Write-Host '   Downloading from mirror...'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { (New-Object System.Net.WebClient).DownloadFile('!NODE_MIRROR!', '%NODE_INSTALLER%'); Write-Host '   Download OK.' } catch { Write-Host '   Mirror download failed:' $_.Exception.Message; exit 1 }"
    if !errorlevel! neq 0 goto :install_failed
)

if not exist "%NODE_INSTALLER%" goto :install_failed

echo.
echo   Installing Node.js (silent)...
echo   This may take 1-2 minutes, please wait...
echo.
msiexec /i "%NODE_INSTALLER%" /qn /norestart ADDLOCAL=ALL
if %errorlevel% neq 0 (
    echo   msiexec silent install failed, trying with admin elevation...
    powershell -NoProfile -Command "Start-Process msiexec.exe -ArgumentList '/i \"%NODE_INSTALLER%\" /qn /norestart ADDLOCAL=ALL' -Verb RunAs -Wait"
)

del /f /q "%NODE_INSTALLER%" 2>nul
goto :node_installed

:install_failed
del /f /q "%NODE_INSTALLER%" 2>nul

REM ---- Method 3: Open download page ----
echo.
echo   [3/3] Auto-install failed.
echo   Opening Node.js download page in browser...
echo   Please download and install the LTS version, then run build.bat again.
echo.
start "" "https://nodejs.org/en/download/"
pause
exit /b 1

:node_installed
echo.
echo   Node.js installed! Refreshing PATH...

REM Refresh PATH from registry (pick up newly installed Node.js)
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SYS_PATH=%%b"
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USR_PATH=%%b"
set "PATH=%USR_PATH%;%SYS_PATH%"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo   Node.js was installed but not yet in PATH.
    echo   Please CLOSE this window and double-click build.bat again.
    echo.
    pause
    exit /b 1
)

:node_ok
for /f "tokens=*" %%v in ('node -v') do echo   Node.js: %%v

REM ---------- Check dependencies ----------
if not exist "node_modules" (
    echo.
    echo   Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo   npm install failed, trying China mirror...
        call npm config set registry https://registry.npmmirror.com
        call npm install
        if !errorlevel! neq 0 (
            echo.
            echo   [ERROR] npm install failed
            echo.
            pause
            exit /b 1
        )
    )
)

REM ---------- Build ----------
echo.
echo   Building...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo   [ERROR] Build failed
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Build OK! Output: dist/
echo ============================================
echo.
echo   Starting preview server...
echo   Press Ctrl+C to stop
echo.

REM ---------- Start preview ----------
call npm run preview -- --base /ancient-architecture-viz/

echo.
pause
