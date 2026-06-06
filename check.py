import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('map-editor.html', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    if 'southRoom' in line or 'Entrance' in line or ('H-1' in line and 'door' in line):
        print(f'{i}: {line.rstrip()[:100]}')
