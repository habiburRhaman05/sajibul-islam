@echo off
rem Starts a local web server and opens the portfolio, so YouTube videos can play inside the cards.
cd /d "%~dp0"
start "" http://localhost:8080
where python >nul 2>nul && (python -m http.server 8080) || (py -m http.server 8080)
