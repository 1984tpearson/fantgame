import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8').read()

old_legend = '`<div class="leg-item"><div style="width:7px;height:7px;border-radius:50%;background:#888880;flex-shrink:0;"></div>NPC</div>`'
new_legend = '`<div class="leg-item"><div style="width:7px;height:7px;border-radius:50%;background:#4ab8f0;flex-shrink:0;"></div>NPC</div><div class="leg-item"><div style="width:7px;height:7px;border-radius:50%;background:#888880;flex-shrink:0;"></div>Encountered</div>`'

count = f.count(old_legend)
print(f'Found {count} legend instances')
f = f.replace(old_legend, new_legend)

open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'w', encoding='utf-8').write(f)
print('Done.')
