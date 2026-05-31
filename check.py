import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8').read()
idx = f.find('if (row.npcs) state.npcs = row.npcs;')
print(f[idx-100:idx+150])
