import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('map-editor.html', encoding='utf-8') as f:
    content = f.read()

start = content.find("} else if (mode === 'settlement') {")
end = content.find("  } else {", start)

new_block = r"""} else if (mode === 'settlement') {
    prompt = `You are generating a settlement tile map for a gritty low-fantasy RPG. Follow these instructions EXACTLY and in ORDER.

LOCATION: ${type} in ${sname}. ${notes ? 'Atmosphere: ' + notes : ''}
GRID: ${w} columns (x: 0 to ${w-1}) x ${h} rows (y: 0 to ${h-1}). y=0=north/top, y=${h-1}=south/bottom.
TOTAL CELLS: exactly ${w*h} — every cell must appear once.

STEP 1 — PLAN YOUR ZONES (do this mentally before outputting):
Divide the grid into named rectangular zones. Example for a ${w}x${h} seaside town:
- North strip (y=0-2): wilderness/trees
- Main road (y=3, full width): road type
- West quarter (x=0-5, y=4-${h-1}): residential houses + gardens  
- Central area (x=6-9, y=4-10): market square + key buildings
- East quarter (x=10-${w-1}, y=4-${h-1}): harbour/waterfront
- South strip (y=${h-2}-${h-1}): beach/water edge

STEP 2 — PLACE ROADS FIRST:
- 1-2 "road" cells forming a main route crossing the grid (must span full width or height)
- 2-4 "street" cells as side paths branching off the main road

STEP 3 — PLACE BUILDINGS (10-20% of cells):
Use type "building" with real names. Vary sizes (1-3 cells for same building):
- Houses: "Fisherman's Cottage", "Miller's House", "Weaver's Home" etc. Add interiorType:"house"
- Inns: "The Salted Herring", "The Anchor Inn" etc. Add interiorType:"inn"  
- Shops: "Blacksmith", "Chandler", "Bakery" etc. Add interiorType:"shop"
- Special: chapel, market_hall, harbormaster etc. with matching interiorType

STEP 4 — FILL TERRAIN (50-60% of cells):
- grass: open ground, gardens, commons
- mud: unpaved areas near water/industry
- sand: beaches, market squares, desert areas
- water/shallow_water: sea, rivers, ponds
- cliff: rocky outcrops (impassable)

STEP 5 — ADD OBJECTS (25-35% of non-building, non-road cells):
NATURE on grass: tree_oak, tree_oak_lg, tree_pine, bush, bush_lg, flowers, mushroom, thicket
STREET clutter: stall, cart, barrels, trough, well, noticeboard, signpost, haystack  
WATERFRONT: boat, barrels, logpile, anchor
RESIDENTIAL: garden, coop, fence_h, fence_v, pond_sm

CRITICAL RULES:
- Cover ALL ${w*h} cells. Count as you go.
- No two cells share the same x,y coordinate.
- Vary terrain — avoid large uniform patches without objects.
- Group related cells (all house cells of one building share the same name).

VALID TERRAIN: ${validT}
ALL VALID OBJECTS: ${AI_OBJECTS_VALID.join(', ')}

Return ONLY a JSON array. Zero explanation. Zero markdown. Just the raw JSON array starting with [ and ending with ].
Format: [{"x":0,"y":0,"type":"grass","name":"Town Edge","object":"tree_oak_lg"},{"x":1,"y":0,"type":"grass","name":"Town Edge"},...]`;

  """

content = content[:start] + new_block + content[end:]

with open('map-editor.html', 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Done. {len(content.splitlines())} lines')
