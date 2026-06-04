import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'worlds/aerdorn.js', encoding='utf-8') as f:
    lines = f.readlines()

# Lines 75-134 (0-indexed 74-133) are the WORLD_META + defCell/defLine/defRect + data block
before = lines[:74]   # up to but not including const WORLD_META
after  = lines[134:]  # after the last defRect line (blank line at 133)

replacement = [
    '// Overworld cells are loaded from worlds/overworld.js before this file.\n',
    'const WORLD_META = window.WORLD_META || {};\n',
    '\n',
]

new_lines = before + replacement + after

with open(r'worlds/aerdorn.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f'Done. {len(lines)} -> {len(new_lines)} lines')
# Verify
for i, line in enumerate(new_lines, 1):
    if 'WORLD_META' in line or 'defCell' in line:
        print(f'  {i}: {line.rstrip()[:80]}')
