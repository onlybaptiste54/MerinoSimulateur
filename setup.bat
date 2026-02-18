@echo off
echo ========================================
echo   Merino Simulateur - Setup
echo ========================================
echo.

echo [1/4] Installation des dependances...
call npm install
if errorlevel 1 (
    echo Erreur lors de l'installation des dependances
    pause
    exit /b 1
)

echo.
echo [2/4] Configuration de l'environnement...
if not exist .env (
    copy .env.example .env
    echo Fichier .env cree. Pensez a editer NEXTAUTH_SECRET !
) else (
    echo Fichier .env existe deja.
)

echo.
echo [3/4] Generation d'un secret pour NEXTAUTH_SECRET...
powershell -Command "[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))" > secret.tmp
set /p SECRET=<secret.tmp
del secret.tmp
echo Secret genere: %SECRET%
echo Pensez a mettre ce secret dans votre fichier .env !

echo.
echo [4/4] Creation d'un utilisateur admin...
echo.
call npm run create-user-interactive

echo.
echo ========================================
echo   Setup termine !
echo ========================================
echo.
echo Pour lancer l'application :
echo   npm run dev
echo.
pause
