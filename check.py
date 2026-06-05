import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('worlds/aerdorn.js', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    if 'NPC_TEMPLATES' in line or 'FACTIONS' in line or ('}' in line and ';' in line and i > 100):
        print(f'{i}: {line.rstrip()[:80]}')
