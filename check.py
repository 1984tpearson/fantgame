import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('worlds/overworld.js', encoding='utf-8') as f:
    content = f.read()
fixed = content.replace(
    'window.WORLD_START = {x:346, y:558};',
    'window.WORLD_START = {x:378, y:539};'
)
if fixed == content:
    print('Not found - trying alternate')
    # Try any variant
    import re
    fixed = re.sub(r'window\.WORLD_START\s*=\s*[^;]+;', 'window.WORLD_START = {x:378, y:539};', content)
    if fixed == content:
        print('Still not found')
    else:
        with open('worlds/overworld.js', 'w', encoding='utf-8') as f:
            f.write(fixed)
        print('Fixed via regex.')
else:
    with open('worlds/overworld.js', 'w', encoding='utf-8') as f:
        f.write(fixed)
    print('Fixed.')
