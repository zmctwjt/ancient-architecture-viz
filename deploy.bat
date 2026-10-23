@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================
echo   千年营造 - 一键部署到 GitHub Pages
echo ============================================
echo.

REM ---------- 1. 构建 ----------
echo [1/4] 构建生产版本...
call npm run build
if errorlevel 1 (
    echo [x] 构建失败，已中止
    pause
    exit /b 1
)

REM ---------- 2. 推送源码 ----------
echo.
echo [2/4] 推送源码到 main 分支...
git push origin main
if errorlevel 1 (
    echo [!] main 推送失败（网络问题），继续尝试部署产物
)

REM ---------- 3. 准备 gh-pages 工作区 ----------
echo.
echo [3/4] 准备 gh-pages 工作区...
set "DEPLOY=%TEMP%\gh-pages-deploy"
if exist "%DEPLOY%" (
    rd /s /q "%DEPLOY%" 2>nul
)
git worktree prune
git fetch origin gh-pages
git branch -f gh-pages origin/gh-pages
git worktree add "%DEPLOY%" gh-pages
if errorlevel 1 (
    echo [x] 创建 gh-pages 工作区失败
    pause
    exit /b 1
)

REM 清空（保留 .git）
for /d %%i in ("%DEPLOY%\*") do (
    if /i not "%%~nxi"==".git" rd /s /q "%%i" 2>nul
)
for %%i in ("%DEPLOY%\*") do (
    if /i not "%%~nxi"==".git" del /q "%%i" 2>nul
)

REM 复制构建产物
xcopy "dist\*" "%DEPLOY%\" /E /Y /Q >nul
type nul > "%DEPLOY%\.nojekyll"

REM ---------- 4. 提交并推送 ----------
echo.
echo [4/4] 提交并推送到 gh-pages...
pushd "%DEPLOY%"
git add -A
git -c core.pager=cat commit -m "deploy: %date% %time%"
git push origin HEAD:gh-pages
set "PUSH_RESULT=!errorlevel!"
popd

cd /d "%~dp0"
git worktree remove --force "%DEPLOY%" 2>nul

echo.
if "!PUSH_RESULT!"=="0" (
    echo [OK] 部署成功
    echo      线上地址：https://zmctwjt.github.io/ancient-architecture-viz/
    echo      GitHub Pages 约需 30-60 秒完成构建
) else (
    echo [x] 推送失败，请检查网络或代理后重试
    echo     常见原因：github.com 的 HTTPS 通道被代理阻断
)

echo.
pause
