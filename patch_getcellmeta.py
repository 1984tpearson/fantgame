path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the entire getCellMeta function - it's currently mangled
old = """function getCellMeta(x,y){
  if(state.layer==='interior'){
    const s=SETTLEMENTS[state.interiorId];
    if(s&&s.map){
      if(s.map[`${x},${y}`])return s.map[`${x},${y}`];
      if(!s._bounds){const ks=Object.keys(s.map);const xs=ks.map(k=>parseInt(k.split(',')[0])),ys=ks.map(k=>parseInt(k.split(',')[1]));s._bounds={minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)};}
      const b=s._bounds;return(x>=b.minX&&x<=b.maxX&&y>=b.minY&&y<=b.maxY)?{type:T.INTERIOR,name:''}:{type:T.WALL,name:''};
    }
    return{type:T.INTERIOR,name:''};
  if(state.layer==='settlement'){const s=SETTLEMENTS[state.settlementId];if(!s)return{type:T.WALL,name:''};if(s.map[`${x},${y}`])return s.map[`${x},${y}`];if(!s._bounds){const ks=Object.keys(s.map);const xs=ks.map(k=>parseInt(k.split(',')[0])),ys=ks.map(k=>parseInt(k.split(',')[1]));s._bounds={minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)};}const b=s._bounds;return(x>=b.minX&&x<=b.maxX&&y>=b.minY&&y<=b.maxY)?{type:T.COURTYARD,name:''}:{type:T.WALL,name:''};}
  return WORLD_META[`${x},${y}`]||(WORLD_DATA.inferTerrain?WORLD_DATA.inferTerrain(x,y):null)||{type:T.PLAINS,name:''};
}"""

new = "function getCellMeta(x,y){if(state.layer==='interior'){const si=SETTLEMENTS[state.interiorId];if(si&&si.map){if(si.map[`${x},${y}`])return si.map[`${x},${y}`];if(!si._bounds){const ks=Object.keys(si.map);const xs=ks.map(k=>parseInt(k.split(',')[0])),ys=ks.map(k=>parseInt(k.split(',')[1]));si._bounds={minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)};}const b=si._bounds;return(x>=b.minX&&x<=b.maxX&&y>=b.minY&&y<=b.maxY)?{type:T.INTERIOR,name:''}:{type:T.WALL,name:''};} return{type:T.INTERIOR,name:''};} if(state.layer==='settlement'){const s=SETTLEMENTS[state.settlementId];if(!s)return{type:T.WALL,name:''};if(s.map[`${x},${y}`])return s.map[`${x},${y}`];if(!s._bounds){const ks=Object.keys(s.map);const xs=ks.map(k=>parseInt(k.split(',')[0])),ys=ks.map(k=>parseInt(k.split(',')[1]));s._bounds={minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)};}const b=s._bounds;return(x>=b.minX&&x<=b.maxX&&y>=b.minY&&y<=b.maxY)?{type:T.COURTYARD,name:''}:{type:T.WALL,name:''};}return WORLD_META[`${x},${y}`]||(WORLD_DATA.inferTerrain?WORLD_DATA.inferTerrain(x,y):null)||{type:T.PLAINS,name:''};}"

if old in content:
    content = content.replace(old, new, 1)
    print("getCellMeta patched OK")
else:
    print("ERROR: getCellMeta pattern not found")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
