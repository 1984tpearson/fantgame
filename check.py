import sys
sys.stdout.reconfigure(encoding='utf-8')

checks = {
    r'C:/Users/1984t/OneDrive/Documents/GitHub/fantgame/worlds/aerdorn.js': [
        ('SETTLEMENTS = window.SETTLEMENTS', 'aerdorn uses window.SETTLEMENTS'),
        ('makeSimpleTown', 'makeSimpleTown SHOULD NOT exist', True),
        ('OVERWORLD_TO_SETTLEMENT', 'OVERWORLD_TO_SETTLEMENT present'),
        ('NPC_TEMPLATES', 'NPC_TEMPLATES present'),
    ],
    r'C:/Users/1984t/OneDrive/Documents/GitHub/fantgame/worlds/settlements/east_port/map.js': [
        ("SETTLEMENTS['frilar_town']", 'east_port registers frilar_town'),
        ('salt_and_sail', 'inn interior id present'),
    ],
    r'C:/Users/1984t/OneDrive/Documents/GitHub/fantgame/worlds/settlements/gladehome/map.js': [
        ("SETTLEMENTS['gladehome']", 'gladehome registered'),
        ('gladehome_inn', 'inn id present'),
    ],
    r'C:/Users/1984t/OneDrive\Documents/GitHub/fantgame/index.html': [
        ('settlements/east_port/map.js', 'index loads east_port'),
        ('settlements/wheatstone/map.js', 'index loads wheatstone'),
        ('worlds/aerdorn.js', 'index loads aerdorn'),
    ],
    r'C:/Users/1984t/OneDrive/Documents/GitHub/fantgame/engine.js': [
        ("water:'water'", 'water terrain mapping present'),
        ('terrainStyle', '_getTile uses terrainStyle'),
        ('meta.terrainStyle', 'drawMapCanvas passes terrainStyle'),
        ('meta.variant', 'meta.variant SHOULD NOT be in _getTile call', True),
    ],
}

all_ok = True
for filepath, tests in checks.items():
    try:
        with open(filepath, encoding='utf-8') as f:
            content = f.read()
        for item in tests:
            search, label = item[0], item[1]
            expect_absent = len(item) > 2 and item[2]
            found = search in content
            if expect_absent:
                ok = not found
                status = 'OK (absent)' if ok else 'FAIL (found but should be absent)'
            else:
                ok = found
                status = 'OK' if ok else 'FAIL (not found)'
            if not ok:
                all_ok = False
            print(f'  [{status}] {label}')
    except Exception as e:
        print(f'  [ERROR] {filepath}: {e}')
        all_ok = False

print()
print('All checks passed.' if all_ok else 'SOME CHECKS FAILED.')
