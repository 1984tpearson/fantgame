import sys, subprocess
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8') as f:
    lines = f.readlines()
print(f'Lines: {len(lines)}')
result = subprocess.run(['node', '--check', r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js'], capture_output=True, text=True)
print('Syntax:', 'OK' if result.returncode == 0 else result.stderr[:200])
