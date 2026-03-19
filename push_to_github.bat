@echo off
chcp 65001 >nul
echo ========================================
echo   Push to GitHub - Checkclass
echo   https://github.com/n0ngXarm/Checkclass
echo ========================================
echo.

cd /d "%~dp0"

:: Check if git is already initialized
if not exist ".git" (
    echo [1/5] Initializing git repository...
    git init
    git remote add origin https://github.com/n0ngXarm/Checkclass.git
) else (
    echo [1/5] Git repository already initialized.
    :: Make sure remote is set correctly
    git remote set-url origin https://github.com/n0ngXarm/Checkclass.git
)

:: Create .gitignore if not exists
if not exist ".gitignore" (
    echo [2/5] Creating .gitignore...
    (
        echo # PHP
        echo config/database.php
        echo ca.pem
        echo test_db.php
        echo.
        echo # Node / Next.js
        echo frontend/node_modules/
        echo frontend/.next/
        echo frontend/.env.local
        echo.
        echo # XAMPP / OS
        echo Thumbs.db
        echo .DS_Store
        echo *.log
    ) > .gitignore
) else (
    echo [2/5] .gitignore already exists.
)

echo [3/5] Staging all files...
git add -A

:: Ask for commit message
echo.
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Update: %DATE% %TIME%

echo [4/5] Committing: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"

echo [5/5] Pushing to GitHub (branch: main)...
git push -u origin main

echo.
echo ========================================
if %ERRORLEVEL%==0 (
    echo   SUCCESS! Code pushed to GitHub.
    echo   https://github.com/n0ngXarm/Checkclass
) else (
    echo   ERROR! Push failed.
    echo   Try running manually:
    echo     git push -u origin main
)
echo ========================================
pause
