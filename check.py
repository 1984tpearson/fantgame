import sys
sys.stdout.reconfigure(encoding='utf-8')
path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js'
with open(path, encoding='utf-8') as f:
    lines = f.readlines()
# Find where the messages array is built for callAI
for i, l in enumerate(lines):
    if "role:'user'" in l or 'role:"user"' in l or "role: 'user'" in l or 'messages =' in l and 'callAI' in lines[max(0,i-5):i+5]:
        print(f'{i+1}: {l}', end='')
