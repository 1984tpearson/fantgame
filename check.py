import sys
sys.stdout.reconfigure(encoding='utf-8')
path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\map-editor.html'
with open(path, encoding='utf-8') as f:
    txt = f.read()

# Check what the terrain click handler looks like
import re
m = re.search(r"currentTerrainId=t\.id.*?;", txt)
if m:
    start = txt.rfind('\n', 0, m.start())
    print(txt[start:start+300])
