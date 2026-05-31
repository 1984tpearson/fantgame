import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8').read()

# Fix NPC dot colour - change blue to grey in both minimap and canvas map
f = f.replace("ctx.fillStyle='#4ab8f0';ctx.shadowColor='#4ab8f0';ctx.shadowBlur=r*2;ctx.fill();ctx.shadowBlur=0;", 
               "ctx.fillStyle='#888880';ctx.shadowColor='#888880';ctx.shadowBlur=r*1;ctx.fill();ctx.shadowBlur=0;")
f = f.replace("'background:#4ab8f0;box-shadow:0 0 4px #4ab8f0;", 
               "'background:#888880;box-shadow:0 0 2px #888880;")
f = f.replace("ctx.fillStyle='rgba(74,184,240,0.85)'", 
               "ctx.fillStyle='rgba(136,136,128,0.85)'")

# Fix legend colour too
f = f.replace("style=\"width:7px;height:7px;border-radius:50%;background:#4ab8f0;flex-shrink:0;\"", 
               "style=\"width:7px;height:7px;border-radius:50%;background:#888880;flex-shrink:0;\"")

# Fix dynamic NPC persistence - save templates to state and restore on load
# In spawnNpc, also save the template to state.npcs
old_spawn = """  state.npcs[id] = {
    disposition: spawnData.initialDisposition || 0,
    memory: [`Day ${Math.floor(state.player.day)}: First encountered by player.`],
    lastSeen: state.player.day, tradeStock: null, cellKey: cellKeyStr,
    template: NPC_TEMPLATES[id]
  };"""

new_spawn = """  state.npcs[id] = {
    disposition: spawnData.initialDisposition || 0,
    memory: [`Day ${Math.floor(state.player.day)}: First encountered by player.`],
    lastSeen: state.player.day, tradeStock: null, cellKey: cellKeyStr,
    template: NPC_TEMPLATES[id],
    _dynamicTemplate: { ...NPC_TEMPLATES[id] }
  };"""

if old_spawn in f:
    f = f.replace(old_spawn, new_spawn)
    print('spawnNpc persistence fix applied')
else:
    print('NOT FOUND: spawnNpc')

# In loadState, restore dynamic NPC templates
old_load = "  if (row.meta?.npcs) state.npcs = row.meta.npcs;\n      else if (row.npcs) state.npcs = row.npcs;"
new_load = """  if (row.meta?.npcs) state.npcs = row.meta.npcs;
      else if (row.npcs) state.npcs = row.npcs;
      // Restore dynamic NPC templates
      for (const [id, ns] of Object.entries(state.npcs)) {
        if (ns._dynamicTemplate && !NPC_TEMPLATES[id]) {
          NPC_TEMPLATES[id] = ns._dynamicTemplate;
        }
      }"""

if old_load in f:
    f = f.replace(old_load, new_load)
    print('loadState dynamic NPC restore applied')
else:
    print('NOT FOUND: loadState')

# Same fix for localStorage fallback
old_local = "      state.npcs = s.npcs || {};"
new_local = """      state.npcs = s.npcs || {};
      // Restore dynamic NPC templates
      for (const [id, ns] of Object.entries(state.npcs)) {
        if (ns._dynamicTemplate && !NPC_TEMPLATES[id]) {
          NPC_TEMPLATES[id] = ns._dynamicTemplate;
        }
      }"""

if old_local in f:
    f = f.replace(old_local, new_local)
    print('localStorage dynamic NPC restore applied')
else:
    print('NOT FOUND: localStorage')

open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'w', encoding='utf-8').write(f)
print('Done.')
