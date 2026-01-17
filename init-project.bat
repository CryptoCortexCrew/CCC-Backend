@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

echo Initializing project structure...

REM Create base folders
mkdir src
mkdir src\config
mkdir src\models
mkdir src\controllers
mkdir src\routes

REM Create files inside src
type nul > src\config\db.js
type nul > src\config\mailer.js
type nul > src\models\Contact.js
type nul > src\controllers\contactController.js
type nul > src\routes\contactRoutes.js
type nul > src\app.js

REM Create root-level files
type nul > index.js
type nul > .env
type nul > package.json

echo.
echo Project structure created successfully.
echo.

ENDLOCAL
pause
