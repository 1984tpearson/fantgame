import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\index.html', encoding='utf-8') as f:
    lines = f.readlines()
for i, l in enumerate(lines):
    if 'minimap' in l.lower() and ('grid' in l or 'gap' in l or 'template' in l):
        print(f'{i+1}: {l.strip()}')
    if '.mmc' in l:
        print(f'{i+1}: {l.strip()}')
