@echo off
echo ========================================
echo NextCoal Initiative - Deployment Tool
echo ========================================
echo.

:menu
echo Choose your deployment option:
echo.
echo 1. Vercel (Recommended - Easiest)
echo 2. Netlify
echo 3. GitHub Pages
echo 4. Docker (Local)
echo 5. Build Only (No deployment)
echo 6. Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto vercel
if "%choice%"=="2" goto netlify
if "%choice%"=="3" goto github-pages
if "%choice%"=="4" goto docker
if "%choice%"=="5" goto build-only
if "%choice%"=="6" goto exit
echo Invalid choice. Please try again.
goto menu

:vercel
echo.
echo ========================================
echo Deploying to Vercel...
echo ========================================
echo.
call deploy-vercel.bat
goto end

:netlify
echo.
echo ========================================
echo Deploying to Netlify...
echo ========================================
echo.
echo Installing Netlify CLI...
npm install -g netlify-cli

echo.
echo Building the application...
npm run build

if %errorlevel% neq 0 (
    echo Build failed! Please check the errors above.
    pause
    goto menu
)

echo.
echo Deploying to Netlify...
netlify deploy --prod --dir=dist

echo.
echo Netlify deployment completed!
echo Check the URL provided above to access your application.
echo.
pause
goto end

:github-pages
echo.
echo ========================================
echo Deploying to GitHub Pages...
echo ========================================
echo.
echo Installing gh-pages...
npm install --save-dev gh-pages

echo.
echo Building the application...
npm run build

if %errorlevel% neq 0 (
    echo Build failed! Please check the errors above.
    pause
    goto menu
)

echo.
echo Deploying to GitHub Pages...
npm run deploy

echo.
echo GitHub Pages deployment completed!
echo Your site will be available at: https://yourusername.github.io/your-repo-name
echo.
pause
goto end

:docker
echo.
echo ========================================
echo Deploying with Docker...
echo ========================================
echo.
echo Building Docker image...
docker build -t nextcoal-app .

if %errorlevel% neq 0 (
    echo Docker build failed! Please check the errors above.
    pause
    goto menu
)

echo.
echo Starting Docker container...
docker run -d -p 80:80 --name nextcoal-container nextcoal-app

echo.
echo Docker deployment completed!
echo Your application is running at: http://localhost
echo.
echo To stop the container: docker stop nextcoal-container
echo To remove the container: docker rm nextcoal-container
echo.
pause
goto end

:build-only
echo.
echo ========================================
echo Building Application Only...
echo ========================================
echo.
echo Building the application...
npm run build

if %errorlevel% neq 0 (
    echo Build failed! Please check the errors above.
    pause
    goto menu
)

echo.
echo Build completed successfully!
echo The built files are in the 'dist' folder.
echo.
pause
goto end

:exit
echo.
echo Exiting deployment tool.
exit /b 0

:end
echo.
echo Deployment process completed!
echo.
pause 