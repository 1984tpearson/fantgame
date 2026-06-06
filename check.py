import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('mapforge.js', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    if 'rocky' in line and '255' in line:
        print(f'{i}: {line.rstrip()[:80]}')
