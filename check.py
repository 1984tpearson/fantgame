import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8') as f:
    eng = f.read()

# Find the minimap rendering to understand how empty settlement cells are handled
idx = eng.find('renderMinimap')
print(eng[idx:idx+800])
print('---')
# Find what fallback terrain settlement uses
idx2 = eng.find('settlement')
# Look for something like default terrain or background type
idx3 = eng.find('hasWalls')
print(eng[idx3:idx3+200])
