import sys
sys.stdout.reconfigure(encoding='utf-8')
path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js'
with open(path, encoding='utf-8') as f:
    lines = f.readlines()
for i, l in enumerate(lines):
    if 'async function callAI' in l or ('function buildSystemPrompt' in l):
        print(f'{i+1}: {l.strip()}')
print(f'\nTotal lines: {len(lines)}')
