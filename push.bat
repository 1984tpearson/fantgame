@echo off
cd /d C:\Users\1984t\OneDrive\Documents\GitHub\fantgame
python patch_mousemove.py
"C:\Program Files\Git\cmd\git.exe" add engine.js
"C:\Program Files\Git\cmd\git.exe" commit -m "Map tooltip on hover, labels only at zoom>=18, fix duplicate mousemove"
"C:\Program Files\Git\cmd\git.exe" push
