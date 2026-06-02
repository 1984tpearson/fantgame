import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8') as f:
    content = f.read()
checks = [
    ('WORLD_MAP_IMAGE', 'background image reference (should be gone)'),
    ('tAlpha', 'tAlpha (should be gone)'),
    ('_getTile', 'tile getter function (should exist)'),
    ('TERRAIN_TO_MF', 'terrain mapping (should exist)'),
    ('_tileCache', 'tile cache (should exist)'),
    ('gridToDataURL', 'minimap CSS injection (should exist)'),
    ('mapforge.js', 'mapforge script tag'),
]
for term, desc in checks:
    count = content.count(term)
    print(f"{desc}: {count} occurrence(s)")
