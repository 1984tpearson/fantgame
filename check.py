import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('map-editor.html', encoding='utf-8') as f:
    content = f.read()

old = "3. CRITICAL: Each distinct room/area uses ONE consistent floor type throughout that room. Do NOT mix floor types within a room.\n   Choose from: interior, floor_h, floor_v, floor_stone, floor_parq, floor_hbone, floor_diag, dirt, mud, grass"

new = "3. FLOOR TYPES — CRITICAL RULE: Before placing any floor cells, mentally assign ONE floor type to each room and use it for EVERY cell in that room without exception. Do NOT vary floor types within a single room — a bedroom is ALL floor_v, a kitchen is ALL dirt, a common room is ALL floor_h, etc. Mixing floor types within one room is wrong.\n   Available floor types: interior, floor_h, floor_v, floor_stone, floor_parq, floor_hbone, floor_diag, dirt, mud, grass"

if old in content:
    content = content.replace(old, new)
    print('Replaced.')
else:
    print('Not found - trying partial match')
    idx = content.find('CRITICAL: Each distinct room')
    print(repr(content[idx:idx+200]))

with open('map-editor.html', 'w', encoding='utf-8') as f:
    f.write(content)
