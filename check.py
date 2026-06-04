import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('engine.js', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    if 'WORLD_META' in line and ('object' in line or 'render' in line.lower() or 'getObject' in line):
        print(f'{i}: {line.rstrip()[:100]}')
