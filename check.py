import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\mapforge.js', encoding='utf-8') as f:
    txt = f.read()

# Find makeYard and composeWithYard
for fn in ['makeYard', 'composeWithYard', 'makeIrregularRoof', 'makeIrregularThatch']:
    idx = txt.find(f'function {fn}(')
    if idx >= 0:
        print(f"=== {fn} ===")
        print(txt[idx:idx+200])
        print()

# Also check TILE_PATTERNS in mapforge
idx2 = txt.find('TILE_PATTERNS')
if idx2 >= 0:
    print("TILE_PATTERNS:", txt[idx2:idx2+200])

# Check how makeRoofByShape uses the pattern param
idx3 = txt.find('function makeRoofByShape(')
print("\nmakeRoofByShape start:")
print(txt[idx3:idx3+300])
