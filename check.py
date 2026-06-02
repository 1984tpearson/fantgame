import os, sys
sys.stdout.reconfigure(encoding='utf-8')
f = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\mapforge.js'
print('EXISTS:', os.path.exists(f))
if os.path.exists(f):
    print('SIZE:', os.path.getsize(f))
