import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\index.html', encoding='utf-8').read()
idx = f.find('#controls {')
print(f[idx:idx+300])
idx2 = f.find('@media (min-width: 700px)')
# find controls in media query
idx3 = f.find('#controls', idx2)
print(f[idx3:idx3+200])
