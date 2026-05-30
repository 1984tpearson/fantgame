path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

def patch(old, new, label):
    global content, changes
    if old in content:
        content = content.replace(old, new, 1)
        print(f"  patched: {label}")
        changes += 1
    elif new in content:
        print(f"  already done: {label}")
    else:
        print(f"  MISSING: {label}")

# 1. Fix enterSettlement gate message
patch(
    "addMessage(`You pass through the gates of ${s.name}.`,'transition');",
    "const _hasWalls=s.hasWalls!==false;addMessage(_hasWalls?`You pass through the gates of ${s.name}.`:`You arrive in ${s.name}.`,'transition');",
    "enterSettlement gate"
)

# 2. Fix exitLayer gate message
patch(
    "else if(state.layer==='settlement')addMessage(`You pass back through the gates of ${SETTLEMENTS[state.settlementId]?.name||'the settlement'}.`,'transition');",
    "else if(state.layer==='settlement'){const _es=SETTLEMENTS[state.settlementId];const _hw=_es?.hasWalls!==false;addMessage(_hw?`You pass back through the gates of ${_es?.name||'the settlement'}.`:`You leave ${_es?.name||'the settlement'}.`,'transition');}",
    "exitLayer gate"
)

# 3. Fix doLayerMove gate message
patch(
    "if(state.layer==='settlement')addMessage(`You pass back through the gates of ${SETTLEMENTS[state.settlementId]?.name||'the settlement'}.`,'transition');",
    "if(state.layer==='settlement'){const _dms=SETTLEMENTS[state.settlementId];const _dmw=_dms?.hasWalls!==false;addMessage(_dmw?`You pass back through the gates of ${_dms?.name||'the settlement'}.`:`You leave ${_dms?.name||'the settlement'}.`,'transition');}",
    "doLayerMove gate"
)

# 4. Add door detection in move()
patch(
    """async function move(dx, dy) {
  if (state.inCombat) return;
  const nx = state.pos.x + dx, ny = state.pos.y + dy;
  const meta = getCellMeta(nx, ny);
  if (!isTraversable(meta.type)) return;""",
    """async function move(dx, dy) {
  if (state.inCombat) return;
  const nx = state.pos.x + dx, ny = state.pos.y + dy;
  const meta = getCellMeta(nx, ny);
  if (meta.type === T.BUILDING && meta.doors && Array.isArray(meta.doors)) {
    const approach = dx===1?'west':dx===-1?'east':dy===1?'south':dy===-1?'north':null;
    if (approach && meta.doors.includes(approach)) {
      showDoorPrompt(nx, ny, approach, meta);
      return;
    }
  }
  if (!isTraversable(meta.type)) return;""",
    "move() door detection"
)

# 5. Add showDoorPrompt and enterBuilding before move()
DOOR_FNS = """// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// DOOR EDGE SYSTEM
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function showDoorPrompt(bx, by, side, meta) {
  document.getElementById('door-prompt')?.remove();
  const box = document.getElementById('scene-box');
  const div = document.createElement('div');
  div.id = 'door-prompt';
  div.style.cssText = 'margin:8px 0;padding:8px 12px;background:rgba(201,148,58,0.08);border:1px solid rgba(201,148,58,0.3);border-radius:3px;display:flex;align-items:center;gap:10px;animation:fadeIn 0.25s ease;';
  const sideLabel = side||'nearby';
  div.innerHTML = `<span style="font-size:0.85rem;color:var(--parchment);flex:1;font-style:italic;">There is a door on the ${sideLabel} side of the ${meta.name||'building'}.</span><button onclick="enterBuilding(${bx},${by})" style="background:rgba(201,148,58,0.15);border:1px solid rgba(201,148,58,0.5);color:var(--gold);font-size:0.75rem;font-family:'Cinzel Decorative',serif;padding:4px 10px;border-radius:2px;cursor:pointer;letter-spacing:0.05em;white-space:nowrap;">Enter</button>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

async function enterBuilding(bx, by) {
  document.getElementById('door-prompt')?.remove();
  const meta = getCellMeta(bx, by);
  const itype = meta.interiorType || 'house';
  const bname = meta.name || 'building';
  const interiorId = `${state.settlementId}:bld:${bx},${by}`;
  if (SETTLEMENTS[interiorId]) {
    await enterInterior(interiorId, {x:1,y:1});
  } else {
    const bkey = `${state.settlementId}:${bx},${by}`;
    if (!state.cells[bkey]) state.cells[bkey] = {};
    state.cells[bkey].buildingType = itype;
    state.cells[bkey].buildingName = bname;
    await enterInterior(interiorId, {x:1,y:1});
  }
}

"""
patch(
    "async function move(dx, dy) {",
    DOOR_FNS + "async function move(dx, dy) {",
    "insert door functions"
)

# 6. Door line rendering in drawMapCanvas
patch(
    "if(meta.type===T.DOOR||meta.type===T.GATE){ctx.globalAlpha=0.8;ctx.fillStyle='#e8b84b';ctx.fillRect(sx+cs*0.35,sy+cs*0.35,cs*0.3,cs*0.3);ctx.globalAlpha=1;}",
    """if(meta.type===T.DOOR||meta.type===T.GATE){ctx.globalAlpha=0.8;ctx.fillStyle='#e8b84b';ctx.fillRect(sx+cs*0.35,sy+cs*0.35,cs*0.3,cs*0.3);ctx.globalAlpha=1;}
if(meta.type===T.BUILDING&&meta.doors&&meta.doors.length){ctx.globalAlpha=0.85;ctx.strokeStyle='#e8b84b';ctx.lineWidth=Math.max(1.5,cs*0.12);ctx.lineCap='round';const dm=cs*0.25,dc=cs/2;meta.doors.forEach(d=>{ctx.beginPath();if(d==='north'){ctx.moveTo(sx+dc-dm,sy);ctx.lineTo(sx+dc+dm,sy);}else if(d==='south'){ctx.moveTo(sx+dc-dm,sy+cs-1);ctx.lineTo(sx+dc+dm,sy+cs-1);}else if(d==='west'){ctx.moveTo(sx,sy+dc-dm);ctx.lineTo(sx,sy+dc+dm);}else if(d==='east'){ctx.moveTo(sx+cs-1,sy+dc-dm);ctx.lineTo(sx+cs-1,sy+dc+dm);}ctx.stroke();});ctx.globalAlpha=1;}""",
    "door line canvas render"
)

# 7. Door line rendering in minimap
patch(
    "if(revealed&&(meta.type===T.DOOR||meta.type===T.GATE)){const dot=document.createElement('div');dot.style.cssText='position:absolute;inset:3px;background:rgba(232,184,75,0.7);border-radius:50%;';cell.appendChild(dot);}",
    """if(revealed&&(meta.type===T.DOOR||meta.type===T.GATE)){const dot=document.createElement('div');dot.style.cssText='position:absolute;inset:3px;background:rgba(232,184,75,0.7);border-radius:50%;';cell.appendChild(dot);}
if(revealed&&meta.type===T.BUILDING&&meta.doors&&meta.doors.length){const ds=document.createElementNS('http://www.w3.org/2000/svg','svg');ds.setAttribute('viewBox','0 0 13 13');ds.setAttribute('style','position:absolute;inset:0;width:100%;height:100%;');meta.doors.forEach(d=>{const ln=document.createElementNS('http://www.w3.org/2000/svg','line');ln.setAttribute('stroke','#e8b84b');ln.setAttribute('stroke-width','2');ln.setAttribute('stroke-linecap','round');if(d==='north'){ln.setAttribute('x1','3');ln.setAttribute('y1','0.5');ln.setAttribute('x2','10');ln.setAttribute('y2','0.5');}else if(d==='south'){ln.setAttribute('x1','3');ln.setAttribute('y1','12.5');ln.setAttribute('x2','10');ln.setAttribute('y2','12.5');}else if(d==='west'){ln.setAttribute('x1','0.5');ln.setAttribute('y1','3');ln.setAttribute('x2','0.5');ln.setAttribute('y2','10');}else if(d==='east'){ln.setAttribute('x1','12.5');ln.setAttribute('y1','3');ln.setAttribute('x2','12.5');ln.setAttribute('y2','10');}ds.appendChild(ln);});cell.appendChild(ds);}""",
    "door line minimap render"
)

# 8. Update buildCellPrompt with building type hint
patch(
    "if(visited)return`Player returns to (${x},${y}). Terrain: ${meta.type}${meta.name?`, ${meta.name}`:''}.Previously: \"${cell.locationName}\". ${dirContext}${notesLine}${npcHint}\nBriefly acknowledge return. Do not invent new signposts or waymarkers.`;return`First visit to (${x},${y}). Terrain: ${meta.type}${meta.name?`, part of ${meta.name}`:''}.${dirContext} Day ${Math.floor(state.player.day)}.${notesLine}${npcHint}\nDescribe what the player sees, smells, hears. Do NOT mention signposts, waymarkers, or written directions unless a road or gate cell is explicitly adjacent.`;}",
    "const bldHint=state.layer==='interior'&&state.interiorId?.includes(':bld:')?(()=>{const parts=state.interiorId.split(':bld:');const sid=parts[0];const[_bx,_by]=parts[1].split(',').map(Number);const bmeta=SETTLEMENTS[sid]?.map[`${_bx},${_by}`];return bmeta?`\\nBuilding type: ${bmeta.interiorType||'house'}. Building name: ${bmeta.name||'unknown'}. Interior scale: 2m per cell. Describe the interior: furniture, light, smells, what this type of building would contain.`:''})():'';if(visited)return`Player returns to (${x},${y}). Terrain: ${meta.type}${meta.name?`, ${meta.name}`:''}.Previously: \"${cell.locationName}\". ${dirContext}${notesLine}${npcHint}${bldHint}\\nBriefly acknowledge return. Do not invent new signposts or waymarkers.`;return`First visit to (${x},${y}). Terrain: ${meta.type}${meta.name?`, part of ${meta.name}`:''}.${dirContext} Day ${Math.floor(state.player.day)}.${notesLine}${npcHint}${bldHint}\\nDescribe what the player sees, smells, hears. Do NOT mention signposts, waymarkers, or written directions unless a road or gate cell is explicitly adjacent.`;}",
    "buildCellPrompt building hint"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"\nDone. {changes} changes applied.")
