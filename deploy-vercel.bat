@echo off
echo ========================================
echo NextCoal Initiative - Vercel Deployment
echo ========================================
echo.

echo Checking if Vercel CLI is installed...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
) else (
    echo Vercel CLI is already installed.
)

echo.
echo Building the application...
npm run build

if %errorlevel% neq 0 (
    echo Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo Build successful! Starting deployment...
echo.

vercel --prod

echo.
echo Deployment completed!
echo Check the URL provided above to access your application.
echo.
pause 