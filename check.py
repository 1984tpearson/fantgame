import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('map-editor.html', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    if any(k in line for k in ['function selectCell','function applyCell','function applyProps','btn-apply']):
        print(f'{i}: {line.rstrip()[:100]}')
