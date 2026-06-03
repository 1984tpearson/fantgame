import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\mapforge.js', encoding='utf-8') as f:
    txt = f.read()

# Find all terrain type keys inside makeTerrain
import re
idx = txt.find('function makeTerrain')
block = txt[idx:idx+12000]
# Find the terrains object keys
keys = re.findall(r'^\s{4}(\w+):\s*\(\)', block, re.MULTILINE)
print("Terrain types in makeTerrain:", keys)
