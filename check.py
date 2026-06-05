import sys, re
sys.stdout.reconfigure(encoding='utf-8')

files = ['engine.js', 'map-editor.html', 'worlds/aerdorn.js', 'config.js']
patterns = ['280m','20m','5m','1m per','2m per','m per cell','SCALE','scale.*cell','cell.*scale','280','OW_SCALE','CELL_SIZE']

for path in files:
    try:
        with open(path, encoding='utf-8') as f:
            lines = f.readlines()
        for i, line in enumerate(lines, 1):
            if any(p.lower() in line.lower() for p in patterns):
                print(f'{path}:{i}: {line.rstrip()[:100]}')
    except FileNotFoundError:
        print(f'{path}: not found')
