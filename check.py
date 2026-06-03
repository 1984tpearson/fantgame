import sys
sys.stdout.reconfigure(encoding='utf-8')
# Check aerdorn.js for example trader objects
path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js'
with open(path, encoding='utf-8') as f:
    lines = f.readlines()
for i, l in enumerate(lines):
    if 'trader' in l or 'buyRate' in l or 'basePriceCp' in l:
        print(f'{i+1}: {l}', end='')
