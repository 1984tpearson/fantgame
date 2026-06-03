import sys
sys.stdout.reconfigure(encoding='utf-8')
path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\map-editor.html'
with open(path, encoding='utf-8') as f:
    txt = f.read()

# Add water and shallow_water to SETTLE_TERRAIN
old = "  {id:'yard',l:'Yard (grass)',mf:'grass'},\n];"
new = "  {id:'yard',l:'Yard (grass)',mf:'grass'},\n  {id:'water',l:'Water (deep)',mf:'water'},\n  {id:'shallow_water',l:'Water (shallow)',mf:'shallow_water'},\n];"
assert old in txt
txt = txt.replace(old, new, 1)

# Add to TERRAIN_TO_MF (already has ocean/river but not water/shallow_water as settlement types)
# They're already in the map via ocean/river, but add explicit entries
old = "  floor_h:'floor_h',"
new = "  water:'water', shallow_water:'shallow_water',\n  floor_h:'floor_h',"
assert old in txt
txt = txt.replace(old, new, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(txt)
print("OK")
