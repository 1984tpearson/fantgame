import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('map-editor.html', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    if 'prop-doors' in line or 'door-north' in line or 'door-east' in line:
        print(f'{i}: {line.rstrip()[:100]}')
