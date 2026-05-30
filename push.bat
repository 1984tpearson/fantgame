@echo off
cd /d C:\Users\1984t\OneDrive\Documents\GitHub\fantgame
python patch_eastport_v4.py
python check_bounds.py
"C:\Program Files\Git\cmd\git.exe" add worlds/aerdorn.js
"C:\Program Files\Git\cmd\git.exe" commit -m "East-Port: back to 2x2 overworld, 1x2 docks, 28x28 interior"
"C:\Program Files\Git\cmd\git.exe" push
