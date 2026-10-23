@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ==========================================
echo   QianNian YingZao - Deploy to GitHub Pages
echo ==========================================
echo.

REM ---------- 0. Git safe.directory ----------
REM If the repo folder is owned by Administrators but run as a normal user,
REM git refuses to operate (dubious ownership). Register an exception.
set "REPO=%~dp0"
if "%REPO:~-1%"=="\" set "REPO=%REPO:~0,-1%"
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo [0/4] Registering git safe.directory...
    git config --global --add safe.directory "%REPO%"
    git rev-parse --is-inside-work-tree >nul 2>&1
    if errorlevel 1 (
        echo [x] Git still refuses this repository. Aborted.
        goto END
    )
    echo       Done.
)

REM ---------- 1. Build ----------
echo [1/4] Building production bundle...
call npm run build
if errorlevel 1 (
    echo [x] Build failed. Aborted.
    goto END
)

REM ---------- 2. Push source ----------
echo.
echo [2/4] Pushing source to main branch...
git push origin main
if errorlevel 1 (
    echo [WARN] Push to main failed.
    echo        Check network or proxy access to github.com.
)

REM ---------- 3. Prepare gh-pages worktree ----------
echo.
echo [3/4] Preparing gh-pages worktree...
set "DEPLOY=%TEMP%\gh-pages-deploy"
if exist "%DEPLOY%" rd /s /q "%DEPLOY%" 2>nul
git worktree prune
git fetch origin gh-pages
git branch -f gh-pages origin/gh-pages
git worktree add "%DEPLOY%" gh-pages
if errorlevel 1 (
    echo [x] Cannot create gh-pages worktree. Aborted.
    goto END
)

REM wipe everything except .git
for /d %%i in ("%DEPLOY%\*") do (
    if /i not "%%~nxi"==".git" rd /s /q "%%i" 2>nul
)
for %%i in ("%DEPLOY%\*") do (
    if /i not "%%~nxi"==".git" del /q "%%i" 2>nul
)

xcopy "dist\*" "%DEPLOY%\" /E /Y /Q /I >nul
type nul > "%DEPLOY%\.nojekyll"

REM ---------- 4. Commit and push ----------
echo.
echo [4/4] Committing and pushing to gh-pages...
pushd "%DEPLOY%"
git add -A
git commit --allow-empty -m "deploy: automated build"
git push origin HEAD:gh-pages
set "RESULT=!errorlevel!"
popd

cd /d "%~dp0"
git worktree remove --force "%DEPLOY%" 2>nul

echo.
if "!RESULT!"=="0" (
    echo [OK] Deployed successfully.
    echo      https://zmctwjt.github.io/ancient-architecture-viz/
    echo      GitHub Pages needs 30-60 seconds to rebuild.
) else (
    echo [x] gh-pages push failed.
    echo     If it says 502 / CONNECT tunnel failed, the proxy is blocking
    echo     github.com temporarily. Wait a minute and run this script again.
)

:END
echo.
pause
