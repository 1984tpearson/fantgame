import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8').read()

# The minimap dot check uses npcCells which includes ns.cellKey for dynamic NPCs
# ns.cellKey is exact, so dots should only appear on one square
# The issue is npcCells.has(key) where key includes layer prefix e.g. "frilar_town:0,14"
# but settlePosKey is just "0,14" - so both checks fire on the same cell
# Fix: for dynamic NPCs only add exact cellKey to npcCells, don't add the stripped version

# Actually the real fix: npcCells is built by adding ns.cellKey directly
# settlePosKey = "${cx},${cy}" (no prefix)  
# key = cellKey(cx,cy) = "frilar_town:0,14" (with prefix)
# ns.cellKey was stored as cellKey() so it has the prefix
# So npcCells.has(key) should match exactly one cell - that's correct

# The multi-square issue is from the ADJACENT tolerance in getNpcsAtCurrentLocation
# which makes them appear in Folk Nearby on adjacent squares
# But the map dots come from npcCells - let's check if npcCells could have duplicates

idx = f.find('for(const[id,ns]of Object.entries(state.npcs)){if(ns.cellKey)npcCells.add(ns.cellKey);}')
print("npcCells dynamic add:", idx != -1)
print(f[idx:idx+100] if idx != -1 else "NOT FOUND")

# The dot appears on 2 squares likely because the NPC was moved/re-spawned 
# and has a new cellKey but old entries remain
# Check if spawnNpc updates existing NPC cellKey
idx2 = f.find('function spawnNpc')
print(f[idx2:idx2+400])
