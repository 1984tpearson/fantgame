import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\mapforge.js', encoding='utf-8') as f:
    txt = f.read()

import re

# Full floorboard pattern list
idx = txt.find('function makeFloorboard')
block = txt[idx:idx+3000]
print("=== makeFloorboard ===")
print(block[:2000])
