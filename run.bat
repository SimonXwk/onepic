@echo off

set env_folder=env
echo -------------------------------------------------------------------------------
echo Default Python Virtual Environment is ^/%env_folder%

:ask1
echo -------------------------------------------------------------------------------
echo Press [1] for Development Mode
echo Press [2] for Production Mode

rem set /P ENV_MODE=Your Choice: %=%
rem If /I "%ENV_MODE%"=="1" goto setToDevelopment
rem If /I "%ENV_MODE%"=="2" goto setToProduction
rem cls & echo ! Please Choose from given list only & goto ask1

set choice1Timeout=10
choice /t %choice1Timeout% /c 12 /N /d 2 /m "(Decision will be defaulted after %choice1Timeout% seconds) Your Choice ?"
rem The construct if errorlevel n checks if the errorlevel is at least n, therefor the way to do the test is go from higher errorlevel to lower errorlevel
if errorlevel 2 goto setToProduction
if errorlevel 1 goto setToDevelopment


:setToDevelopment
set FLASK_ENV=development
goto finishSetup

:setToProduction
set FLASK_ENV=production
goto finishSetup

:finishSetup
echo ^> flask environment variable will be set to %FLASK_ENV% later


:ask2
echo -------------------------------------------------------------------------------
echo Press [1] for Skipping project environment Setup
echo Press [2] for Preparing project environment Setup

rem set INPUT=
rem set /P INPUT=Your Choice: %=%
rem If /I "%INPUT%"=="1" goto skipSetupEnv
rem If /I "%INPUT%"=="2" goto setupEnv
rem cls & echo ! Please Type Y/N only & goto ask2

set choice2Timeout=10
choice /t %choice2Timeout% /c 12 /N /d 1 /m "(Decision will be defaulted after %choice2Timeout% seconds) Your Choice ?"
rem The construct if errorlevel n checks if the errorlevel is at least n, therefor the way to do the test is go from higher errorlevel to lower errorlevel
if errorlevel 2 goto setupEnv
if errorlevel 1 goto skipSetupEnv


:setupEnv

if exist "%env_folder%\" (
    echo.
    echo -------------------------------------------------------------------------------
	echo ^ ^ ^> skipping creating python virtual environment
	echo -------------------------------------------------------------------------------
	echo [%env_folder%] Exists !
) else (

	rd /s /q "%env_folder%"
	echo.
	echo -------------------------------------------------------------------------------
	echo ^ ^ ^> creating python virtual environment [%env_folder%]
	echo -------------------------------------------------------------------------------
	python -m venv %env_folder%
)

echo.
echo -------------------------------------------------------------------------------
echo ^ ^ ^> activating python virtual environment ...
echo -------------------------------------------------------------------------------
call %env_folder%\Scripts\activate
echo virtual environment [%env_folder%] was activated

echo.
echo -------------------------------------------------------------------------------
echo ^ ^ ^> collecting python packages ...
echo -------------------------------------------------------------------------------
call pip install -r requirements.txt -U

echo.
echo -------------------------------------------------------------------------------
echo ^ ^ ^> installing node dependencies ...
echo -------------------------------------------------------------------------------
call npm install

echo.
echo -------------------------------------------------------------------------------
echo ^ ^ ^> auditing NPM vulnerabilities ...
echo -------------------------------------------------------------------------------
call npm audit fix


:skipSetupEnv
echo.
echo -------------------------------------------------------------------------------
echo ^ ^ ^> gulping vendor dependencies ...
echo -------------------------------------------------------------------------------
call gulp vendor


echo.
echo -------------------------------------------------------------------------------
echo ^ ^ ^> activating python virtual environment ...
echo -------------------------------------------------------------------------------
call %env_folder%\Scripts\activate
echo virtual environment [%env_folder%] was activated


echo.
echo -------------------------------------------------------------------------------
echo ^ ^ ^> setting flask environment variables ...
echo -------------------------------------------------------------------------------
call set FLASK_APP=app
echo FLASK_APP                      --^> app
call set FLASK_ENV=%FLASK_ENV%
echo FLASK_ENV                      --^> %FLASK_ENV%
call set OAUTHLIB_INSECURE_TRANSPORT=1
echo OAUTHLIB_INSECURE_TRANSPORT    --^> 1
call set OAUTHLIB_RELAX_TOKEN_SCOPE=1
echo OAUTHLIB_RELAX_TOKEN_SCOPE     --^> 1

echo.
echo -------------------------------------------------------------------------------
echo ^ ^ ^> run flask server ...
echo -------------------------------------------------------------------------------
cmd /k "flask run -h 0.0.0.0 -p 80"


rem npm init -y
rem npm i gulp browser-sync gulp-sass --save-dev
rem npm i bootstrap jquery popper.js --save