import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

base = r'C:/Users/1984t/OneDrive/Documents/GitHub/fantgame/worlds/settlements'
targets = ['dunesedge', 'gladehome', 'harvestfell', 'sylvanis_root', 'theatfields', 'wheatstone', 'saltwell']

for sid in targets:
    path = os.path.join(base, sid, 'map.js')
    with open(path, encoding='utf-8') as f:
        content = f.read()
    # Add semicolon to any t(...) line that doesn't already end with one
    fixed = re.sub(r"(  t\([^)]+\))$", r"\1;", content, flags=re.MULTILINE)
    changed = content.count('\n') - fixed.count('\n') == 0
    added = fixed.count(';') - content.count(';')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(fixed)
    print(f'{sid}: added {added} semicolons')

print('Done.')
