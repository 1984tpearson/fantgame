import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('engine.js', encoding='utf-8') as f:
    content = f.read()
for i, line in enumerate(content.split('\n'), 1):
    if 'TERRAIN_TO_MF' in line and 'const' in line:
        print(f'{i}: {line[:100]}')
