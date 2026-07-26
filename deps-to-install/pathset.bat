@echo off
setlocal EnableDelayedExpansion

:: -----------------------------------------------------------
:: This script adds or removes the current directory from the
:: user's PATH environment variable in Windows.
::
:: It first reads the current user's PATH from the registry.
:: Then it checks if the current directory (%CD%) is already
:: included in that PATH.
::
:: - If the directory is found, the script prompts the user
::   whether to remove it from PATH.
:: - If the directory is not found, it prompts the user whether
::   to add it to PATH.
::
:: The changes are applied by updating the registry key:
:: HKCU\Environment\Path
::
:: Note: You may need to restart your terminal or sign out
:: and back in for the changes to take effect.
:: -----------------------------------------------------------

:: Get current directory
set "CURRENT_DIR=%CD%"

:: Get user PATH
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USER_PATH=%%b"

echo.
echo Current directory: %CURRENT_DIR%
echo.

:: Check if already in PATH
echo %USER_PATH% | findstr /I /C:"%CURRENT_DIR%" >nul
if %errorlevel%==0 (
    echo The current directory is already in the user PATH.
    set /p "CONFIRM=Do you want to REMOVE it from PATH? [y/N]: "
    if /I "!CONFIRM!"=="y" (
        set "NEW_PATH=!USER_PATH:%CURRENT_DIR%;=!"
        set "NEW_PATH=!NEW_PATH:;%CURRENT_DIR%=!"
        reg add "HKCU\Environment" /v Path /d "!NEW_PATH!" /f >nul
        echo Removed.
    ) else (
        echo No changes made.
    )
) else (
    echo The current directory is NOT in the user PATH.
    set /p "CONFIRM=Do you want to ADD it to PATH? [y/N]: "
    if /I "!CONFIRM!"=="y" (
        if defined USER_PATH (
            set "NEW_PATH=%USER_PATH%;%CURRENT_DIR%"
        ) else (
            set "NEW_PATH=%CURRENT_DIR%"
        )
        reg add "HKCU\Environment" /v Path /d "!NEW_PATH!" /f >nul
        echo Added.
    ) else (
        echo No changes made.
    )
)

echo.
echo You may need to restart your terminal or sign out/in for changes to take effect.
pause
endlocal
