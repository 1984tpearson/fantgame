import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('worlds/overworld.js', encoding='utf-8') as f:
    content = f.read()
fixed = content.replace(
    'window.WORLD_START = window.WORLD_START || {x:346, y:558};',
    'window.WORLD_START = {x:346, y:558};'
)
if fixed == content:
    print('Not found')
else:
    with open('worlds/overworld.js', 'w', encoding='utf-8') as f:
        f.write(fixed)
    print('Fixed.')
