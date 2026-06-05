import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('map-editor.html', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    if 'makeTerrain' in line or ('getTile' in line and 'editor' in lines[i-2].lower() if i>2 else False):
        print(f'{i}: {line.rstrip()[:100]}')
