@echo off
REM Vercel Deployment Helper Script for Windows
REM Usage: deploy-setup.bat

setlocal enabledelayedexpansion

cls
echo ========================================
echo BizFlow Enterprise - Vercel Setup Helper
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not installed
    exit /b 1
)

for /f "tokens=1" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% detected
echo.

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not installed
    exit /b 1
)
echo [OK] npm installed
echo.

REM Check if vercel.json files exist
if not exist "bizflow-api\vercel.json" (
    echo [ERROR] Backend vercel.json missing
    exit /b 1
)
echo [OK] Backend vercel.json exists

if not exist "bizflow-ui\vercel.json" (
    echo [ERROR] Frontend vercel.json missing
    exit /b 1
)
echo [OK] Frontend vercel.json exists
echo.

echo ========================================
echo Environment Variables Needed
echo ========================================
echo.
echo BACKEND (bizflow-api):
echo   [ ] MONGODB_URI=mongodb+srv://user:pass@cluster...
echo   [ ] DB_NAME=bizflow
echo   [ ] JWT_SECRET=(copy the value below)
echo   [ ] JWT_REFRESH_SECRET=(copy the value below)
echo   [ ] CORS_ORIGIN=your-frontend-url
echo   [ ] NODE_ENV=production
echo.

REM Generate JWT secrets using Node.js
echo Generating secure JWT secrets...
echo.

for /f %%A in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set JWT_SECRET=%%A
echo JWT_SECRET:
echo   %JWT_SECRET%
echo.

for /f %%A in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set JWT_REFRESH_SECRET=%%A
echo JWT_REFRESH_SECRET:
echo   %JWT_REFRESH_SECRET%
echo.

echo FRONTEND (bizflow-ui):
echo   [ ] ENVIRONMENT_API_URL=your-backend-api-url/api
echo.

echo ========================================
echo Deployment Steps
echo ========================================
echo.
echo STEP 1: Deploy Backend
echo   1. Go to https://vercel.com/dashboard
echo   2. Click "Add New" ^> "Project"
echo   3. Import your GitHub repository
echo   4. Root Directory: ./bizflow-api
echo   5. Build Command: npm run build
echo   6. Output Directory: dist
echo   7. Add environment variables above
echo   8. Click Deploy
echo   9. SAVE THE BACKEND URL
echo.

echo STEP 2: Deploy Frontend
echo   1. Go to https://vercel.com/dashboard
echo   2. Click "Add New" ^> "Project"
echo   3. Import your GitHub repository
echo   4. Root Directory: ./bizflow-ui
echo   5. Build Command: npm run build
echo   6. Output Directory: dist/bizflow-ui
echo   7. Set ENVIRONMENT_API_URL to backend URL from Step 1
echo   8. Click Deploy
echo.

echo STEP 3: Update Backend CORS
echo   1. Go back to backend project settings
echo   2. Update CORS_ORIGIN to your frontend URL
echo.

echo ========================================
echo Optional: Test Builds Locally
echo ========================================
echo.
set /p TEST_BUILD="Test builds locally? (y/n): "

if /i "%TEST_BUILD%"=="y" (
    echo.
    echo Testing backend build...
    cd bizflow-api
    call npm run build >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Backend build successful
    ) else (
        echo [ERROR] Backend build failed
    )
    cd ..
    
    echo Testing frontend build...
    cd bizflow-ui
    call npm run build >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Frontend build successful
    ) else (
        echo [ERROR] Frontend build failed
    )
    cd ..
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You're ready to deploy to Vercel!
echo.
echo For detailed instructions, see: VERCEL_DEPLOYMENT.md
echo For quick reference, see: VERCEL_QUICK_START.md
echo.
pause
