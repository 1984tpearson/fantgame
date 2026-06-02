import os, sys
sys.stdout.reconfigure(encoding='utf-8')
f = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\mapforge.js'
if os.path.exists(f):
    print('EXISTS:', os.path.getsize(f), 'bytes')
else:
    print('NOT FOUND')
