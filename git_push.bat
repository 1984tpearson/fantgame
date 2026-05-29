@echo off
cd /d "C:\Users\1984t\OneDrive\Documents\GitHub\fantgame"
"C:\Program Files\Git\cmd\git.exe" status > git_out.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" add -A >> git_out.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" commit -m "Rebuild world as Aerdorn: new map, terrain system, settlements" >> git_out.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" push >> git_out.txt 2>&1
echo DONE >> git_out.txt
