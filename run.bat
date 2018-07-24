@echo off
cmd /k "gulp vendor & gulp sass & env\Scripts\activate & set FLASK_APP=app & set FLASK_ENV=development & set OAUTHLIB_INSECURE_TRANSPORT=1 & set OAUTHLIB_RELAX_TOKEN_SCOPE=1 & flask run -h 0.0.0.0 -p 80"

