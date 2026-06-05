import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('map-editor.html', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    if 'function buildSettlementList' in line:
        print(f'{i}: {line.rstrip()[:100]}')
