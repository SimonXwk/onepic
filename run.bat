@echo off

set env_folder=env
echo -------------------------------------------------------------------------------
echo Default Python Virtual Environment is ^/%env_folder%

:ask1
echo -------------------------------------------------------------------------------
echo Press [1] Development Mode
echo Press [2] Production Mode
set /P ENV_MODE=Your Choice: %=%
If /I "%ENV_MODE%"=="1" goto setToDevelopment
If /I "%ENV_MODE%"=="2" goto setToProduction
cls & echo ! Please Choose from given list only & goto ask1

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
echo Press [1] Skip project environment Setup
echo Press [2] Prepare project environment Setup
set INPUT=
set /P INPUT=Your Choice: %=%
If /I "%INPUT%"=="1" goto skipSetupEnv
If /I "%INPUT%"=="2" goto setupEnv
cls & echo ! Please Type Y/N only & goto ask2

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
echo ^ ^ ^> gulping sass conversion ...
echo -------------------------------------------------------------------------------
call gulp sass

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