import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('mapforge.js', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    if ('cave' in line.lower() or 'rocky' in line.lower()) and '[' in line and '255' in line and i > 2750 and i < 2790:
        print(f'{i}: {line.rstrip()[:100]}')
