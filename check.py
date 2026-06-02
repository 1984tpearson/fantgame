import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\index.html', encoding='utf-8') as f:
    lines = f.readlines()
print('Total lines:', len(lines))
for i, l in enumerate(lines):
    if any(k in l for k in ['<script', '</script>', '</body>', '</head>', 'src=']):
        print(f'{i+1}: {l}', end='')
