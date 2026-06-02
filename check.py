import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8') as f:
    lines = f.readlines()
# Find buildSystemPrompt function
for i, l in enumerate(lines):
    if 'buildSystemPrompt' in l or 'function buildSystem' in l:
        print(f'{i+1}: {l}', end='')
