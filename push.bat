@echo off
cd /d C:\Users\1984t\OneDrive\Documents\GitHub\fantgame
python fix_apostrophes2.py
"C:\Program Files\Git\cmd\git.exe" add worlds/aerdorn.js
"C:\Program Files\Git\cmd\git.exe" commit -m "Fix all remaining unescaped apostrophes in NPC strings"
"C:\Program Files\Git\cmd\git.exe" push
