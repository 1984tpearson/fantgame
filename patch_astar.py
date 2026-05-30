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

# ── 1. A* pathfinding + fix handleMapTap + fix startQuickTravel ─────────────

# Add A* function before handleMapTap
patch(
    "function handleMapTap(cx,cy){",
    r"""function aStarPath(sx,sy,dx,dy,layerOverride){
  const layer=layerOverride||state.layer;
  function key(x,y){return x+','+y;}
  function meta(x,y){if(layer==='settlement'){const s=SETTLEMENTS[state.settlementId];if(!s)return{type:T.WALL};return s.map[key(x,y)]||{type:T.COURTYARD};}return WORLD_META[key(x,y)]||(WORLD_DATA.inferTerrain?WORLD_DATA.inferTerrain(x,y):null)||{type:T.PLAINS};}
  function h(x,y){return Math.abs(x-dx)+Math.abs(y-dy);}
  const open=new Map();const closed=new Set();const gScore=new Map();const parent=new Map();
  const startKey=key(sx,sy);open.set(startKey,{x:sx,y:sy,f:h(sx,sy),g:0});gScore.set(startKey,0);
  let iterations=0;
  while(open.size>0&&iterations++<2000){
    let best=null,bestF=Infinity;
    for(const[k,v]of open){if(v.f<bestF){bestF=v.f;best=k;}}
    const cur=open.get(best);open.delete(best);closed.add(best);
    if(cur.x===dx&&cur.y===dy){
      const path=[];let k=best;
      while(parent.has(k)){path.unshift({x:parseInt(k),y:parseInt(k.split(',')[1])});k=parent.get(k);}
      // Fix: properly parse coords
      const result=[];let pk=best;
      while(parent.has(pk)){const parts=pk.split(',');result.unshift({x:parseInt(parts[0]),y:parseInt(parts[1])});pk=parent.get(pk);}
      return result;
    }
    for(const[nx2,ny2]of[[cur.x,cur.y-1],[cur.x,cur.y+1],[cur.x-1,cur.y],[cur.x+1,cur.y]]){
      const nk=key(nx2,ny2);if(closed.has(nk))continue;
      const nm=meta(nx2,ny2);if(!isTraversable(nm.type)&&!(nx2===dx&&ny2===dy))continue;
      const ng=gScore.get(best)+1;
      if(ng<(gScore.get(nk)??Infinity)){
        gScore.set(nk,ng);parent.set(nk,best);
        open.set(nk,{x:nx2,y:ny2,f:ng+h(nx2,ny2),g:ng});
      }
    }
  }
  return null;
}

function handleMapTap(cx,cy){""",
    "A* pathfinding"
)

# Fix handleMapTap - remove overworld-only guard, use A* step count for settlements
patch(
    "if(!isTraversable(meta.type))return;if(state.layer!=='overworld')return;const steps=Math.abs(x-px)+Math.abs(y-py);const ec=Math.round((1-Math.pow(0.995,steps))*100);mapView.travelTarget={x,y};drawMapCanvas();document.getElementById('map-travel-dest').textContent=state.cells[key]?.locationName||meta.name||terrainLabel(meta.type);document.getElementById('map-travel-info').textContent=`~${steps} steps · ${ec}% chance of encounter`;document.getElementById('map-travel-go').onclick=()=>startQuickTravel(x,y);document.getElementById('map-travel-confirm').classList.add('visible');}",
    r"""if(!isTraversable(meta.type))return;
  // For settlements, verify A* can find a path
  if(state.layer==='settlement'){const testPath=aStarPath(px,py,x,y);if(!testPath){return;}const steps=testPath.length;mapView.travelTarget={x,y};drawMapCanvas();document.getElementById('map-travel-dest').textContent=state.cells[key]?.locationName||meta.name||terrainLabel(meta.type);document.getElementById('map-travel-info').textContent=`~${steps} steps`;document.getElementById('map-travel-go').onclick=()=>startQuickTravel(x,y);document.getElementById('map-travel-confirm').classList.add('visible');return;}
  const steps=Math.abs(x-px)+Math.abs(y-py);const ec=Math.round((1-Math.pow(0.995,steps))*100);mapView.travelTarget={x,y};drawMapCanvas();document.getElementById('map-travel-dest').textContent=state.cells[key]?.locationName||meta.name||terrainLabel(meta.type);document.getElementById('map-travel-info').textContent=`~${steps} steps · ${ec}% chance of encounter`;document.getElementById('map-travel-go').onclick=()=>startQuickTravel(x,y);document.getElementById('map-travel-confirm').classList.add('visible');}""",
    "handleMapTap settlement support"
)

# Fix startQuickTravel - use A* for settlements
patch(
    r"""async function startQuickTravel(dx,dy){document.getElementById('map-travel-confirm').classList.remove('visible');toggleMap();const{x:sx,y:sy}=state.pos;mapView.travelTarget=null;const path=[];let cx=sx,cy=sy;while(cx!==dx||cy!==dy){if(cx!==dx)cx+=cx<dx?1:-1;else if(cy!==dy)cy+=cy<dy?1:-1;path.push({x:cx,y:cy});}""",
    r"""async function startQuickTravel(dx,dy){document.getElementById('map-travel-confirm').classList.remove('visible');toggleMap();const{x:sx,y:sy}=state.pos;mapView.travelTarget=null;
  // Use A* for settlements, straight-line for overworld
  let path=[];
  if(state.layer==='settlement'){const apath=aStarPath(sx,sy,dx,dy);if(!apath||apath.length===0){addMessage('No path found.','system');return;}path=apath;}
  else{let cx=sx,cy=sy;while(cx!==dx||cy!==dy){if(cx!==dx)cx+=cx<dx?1:-1;else if(cy!==dy)cy+=cy<dy?1:-1;path.push({x:cx,y:cy});}}""",
    "startQuickTravel A*"
)

# ── 2. Building labels in map view ───────────────────────────────────────────
patch(
    "if(mapView.travelTarget&&mapView.travelTarget.x===cx&&mapView.travelTarget.y===cy){ctx.strokeStyle='#e8b84b';ctx.lineWidth=2;ctx.strokeRect(sx+1,sy+1,cs-3,cs-3);}",
    r"""if(meta.type===T.BUILDING&&meta.name&&cs>=10){ctx.globalAlpha=0.75;ctx.fillStyle='#e8c87a';ctx.font=`${Math.max(7,Math.min(10,cs*0.35))}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';const label=meta.name.length>12?meta.name.slice(0,11)+'\u2026':meta.name;ctx.fillText(label,sx+cs/2,sy+cs/2);ctx.globalAlpha=1;}
if(mapView.travelTarget&&mapView.travelTarget.x===cx&&mapView.travelTarget.y===cy){ctx.strokeStyle='#e8b84b';ctx.lineWidth=2;ctx.strokeRect(sx+1,sy+1,cs-3,cs-3);}""",
    "building labels in map"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"\nDone. {changes} changes applied.")
