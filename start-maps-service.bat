@echo off
echo Starting Google Maps Backend Service...
echo.
echo This service helps extract coordinates from Google Maps URLs.
echo The service will run on http://localhost:3001
echo.
echo Press Ctrl+C to stop the service when done.
echo.

cd maps-expander
npm install
node index.js

pause 