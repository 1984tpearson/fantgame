import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8').read()
idx = f.find('for (const [id, ns] of Object.entries(state.npcs))')
# find the one in getNpcsAtCurrentLocation
idx2 = f.find('for (const [id, ns] of Object.entries(state.npcs))', idx+1)
print(f[idx:idx+300])
print('---')
print(f[idx2:idx2+300])
