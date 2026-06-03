import sys, subprocess
sys.stdout.reconfigure(encoding='utf-8')
r = subprocess.run(['node','--check',r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js'],capture_output=True,text=True)
print('OK' if r.returncode==0 else r.stderr[:300])
