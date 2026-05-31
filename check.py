import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8').read()

# 1. When combat ends and enemy is dead, mark NPC as dead
# Find setCombatMode(false) handling for named NPCs
old_combat_end = """    if(state.activeCombat && !state.activeCombat.isEphemeral && state.activeCombat.npcId){
      const ns=getNpcState(state.activeCombat.npcId);
      ns.hp=Math.max(0,state.activeCombat.hp);
      ns.memory.push(`Day ${Math.floor(state.player.day)}: Fought player, ${ns.hp<=0?'defeated':'survived'}.`);
    }"""

new_combat_end = """    if(state.activeCombat && !state.activeCombat.isEphemeral && state.activeCombat.npcId){
      const ns=getNpcState(state.activeCombat.npcId);
      ns.hp=Math.max(0,state.activeCombat.hp);
      ns.memory.push(`Day ${Math.floor(state.player.day)}: Fought player, ${ns.hp<=0?'defeated':'survived'}.`);
      if(ns.hp<=0){
        ns.dead=true;
        ns.deathDay=state.player.day;
        ns.lootable=true;
        // Open loot immediately
        const tmpl=NPC_TEMPLATES[state.activeCombat.npcId];
        if(tmpl){
          addMessage(`${tmpl.name} is dead. You can search the body.`,'notice');
          // Add any trader stock as lootable
          if(tmpl.trader&&tmpl.trader.stock){
            tmpl.trader.stock.slice(0,3).forEach(item=>{
              if(item.name&&!item.name.toLowerCase().includes('bed')&&!item.name.toLowerCase().includes('night')){
                state.inventory.push({name:item.name,valueCp:Math.round(item.basePriceCp*0.5)});
              }
            });
            renderInventory();
            addMessage(`You find some items on the body.`,'system');
          }
        }
      }
    }"""

if old_combat_end in f:
    f = f.replace(old_combat_end, new_combat_end)
    print('Combat death handling fixed')
else:
    print('NOT FOUND: combat end')

# 2. In getNpcsAtCurrentLocation, skip dead NPCs whose death was > 1 day ago
old_npc_loop = "  for (const [id, tmpl] of Object.entries(NPC_TEMPLATES)) {\n    if (tmpl.dynamic) continue;"
new_npc_loop = """  // Clean up bodies older than 1 day
  for (const [id, ns] of Object.entries(state.npcs)) {
    if (ns.dead && (state.player.day - ns.deathDay) >= 1) {
      ns.bodyGone = true;
    }
  }
  for (const [id, tmpl] of Object.entries(NPC_TEMPLATES)) {
    if (tmpl.dynamic) continue;
    const ns = state.npcs[id];
    if (ns?.dead && ns?.bodyGone) continue; // body removed"""

if old_npc_loop in f:
    f = f.replace(old_npc_loop, new_npc_loop)
    print('NPC loop dead skip fixed')
else:
    print('NOT FOUND: npc loop')

# 3. When approaching a dead NPC, show body description instead of dialogue
old_open_drawer = """function openNpcDrawer(npcId, forced = false) {
  const tmpl = NPC_TEMPLATES[npcId];
  if (!tmpl) return;
  // Route creature-type NPCs to the creature drawer
  if (tmpl.type === 'creature') { openCreatureDrawer(npcId, forced); return; }"""

new_open_drawer = """function openNpcDrawer(npcId, forced = false) {
  const tmpl = NPC_TEMPLATES[npcId];
  if (!tmpl) return;
  // Handle dead NPCs - show body instead
  const ns = getNpcState(npcId);
  if (ns.dead && !ns.bodyGone) {
    const daysSince = (state.player.day - ns.deathDay).toFixed(1);
    addMessage(`${tmpl.name} lies dead here. The body is cold.`, 'notice');
    if (ns.lootable) {
      addMessage(`You search the body but find nothing more of value.`, 'system');
      ns.lootable = false;
    }
    return;
  }
  // Route creature-type NPCs to the creature drawer
  if (tmpl.type === 'creature') { openCreatureDrawer(npcId, forced); return; }"""

if old_open_drawer in f:
    f = f.replace(old_open_drawer, new_open_drawer)
    print('Dead NPC drawer fixed')
else:
    print('NOT FOUND: open drawer')

# 4. Map dot colour for dead NPCs - dark red
# In minimap dot rendering, check if dead
old_dot_color = "const _isDynNpc=Object.entries(state.npcs).some(([id,ns])=>(ns.cellKey===key||ns.cellKey===settlePosKey)&&NPC_TEMPLATES[id]?.dynamic&&!Object.values(NPC_TEMPLATES[id].schedule||[]).length);const ndot=document.createElement('div');const _nc=_isDynNpc?'#888880':'#4ab8f0';"
new_dot_color = "const _npcEntry=Object.entries(state.npcs).find(([id,ns])=>ns.cellKey===key||ns.cellKey===settlePosKey);const _isDead=_npcEntry&&state.npcs[_npcEntry[0]]?.dead;const _isDynNpc=_npcEntry&&NPC_TEMPLATES[_npcEntry[0]]?.dynamic&&!Object.values(NPC_TEMPLATES[_npcEntry[0]].schedule||[]).length;const ndot=document.createElement('div');const _nc=_isDead?'#8b2020':_isDynNpc?'#888880':'#4ab8f0';"

if old_dot_color in f:
    f = f.replace(old_dot_color, new_dot_color)
    print('Dead NPC dot colour fixed')
else:
    print('NOT FOUND: dot color')

open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'w', encoding='utf-8').write(f)
print('Done.')
