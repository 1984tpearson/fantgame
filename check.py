import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('map-editor.html', encoding='utf-8') as f:
    content = f.read()

start = content.find("} else if (mode === 'settlement') {")
end = content.find("  } else {", start)

new_block = r"""} else if (mode === 'settlement') {
    prompt = `Generate a ${w}x${h} settlement tile map for a gritty low-fantasy RPG.
LOCATION: ${type} in ${sname}. ${notes ? 'Atmosphere: ' + notes : ''}
GRID: x=0 to ${w-1} (west to east), y=0 to ${h-1} (north=top to south=bottom).
OUTPUT: JSON array of exactly ${w*h} objects, one per cell. Raw JSON only — no markdown, no explanation.

FOLLOW THESE STEPS IN ORDER:

STEP 1 — PLACE BUILDINGS (15-25% of cells):
Place 6-12 named buildings FIRST before anything else. Buildings are 1-4 cells each with the same name.
Spread them across the grid — do not cluster all buildings in one corner.
Building cell format: {"x":N,"y":N,"type":"building","name":"The Salted Herring Inn","interiorType":"inn"}
Use varied interiorType values: house, inn, shop, blacksmith, chapel, market_hall, harbormaster, bathhouse
House names: "Fisherman's Cottage", "Cooper's House", "Miller's Home", "Weaver's Cottage", "Tanner's House"
Shop names: "Blacksmith", "Chandler & Rope", "Grain Store", "Bakery", "Apothecary", "Fletcher"
Inn names: "The Salted Herring", "The Anchor Inn", "The Crossed Keys", "The Sailor's Rest"

STEP 2 — PLACE MAIN ROADS (3-6% of cells):
Add 1-2 main roads ("road" type) running through the settlement, connecting to grid edges.
Roads must pass near building clusters so buildings front onto them.

STEP 3 — PLACE PATHS TO BUILDING DOORS (2-5% of cells):
For every building that does NOT already face a road, add 1-2 "street" cells immediately adjacent to it.
Use path objects on street cells near buildings: path_h, path_v, path_cross, path_cne, path_cnw, path_cse, path_csw, path_te, path_tn, path_ts, path_tw
Choose the correct path variant based on direction (h=horizontal, v=vertical, corners=cne/cnw/cse/csw, tees=te/tn/ts/tw).

STEP 4 — FILL TERRAIN (remaining ~60-70% of cells):
Fill all remaining cells with appropriate terrain. NO large empty grass patches.
- grass: general ground between buildings
- mud: near water, back alleys, unpaved service areas
- sand: beaches, market squares, desert areas  
- water/shallow_water: harbour, river, pond
- cliff: rocky outcrops (impassable, use sparingly on edges)
Mix terrain types — vary them naturally.

STEP 5 — ADD NATURE AND DECORATION (objects on 30-40% of terrain cells):
NATURE on grass: tree_oak, tree_oak_lg, tree_pine, tree_pine_lg, bush, bush_lg, flowers, mushroom, thicket, garden
STREET LIFE on/near roads: stall, cart, barrels, trough, well, noticeboard, signpost, haystack, logpile
RESIDENTIAL near houses: coop, fence_h, fence_v, pond_sm, flowers, bush
WATERFRONT: boat, barrels, logpile
Do NOT leave large areas of plain terrain with no objects.

VALID TERRAIN: ${validT}
ALL OBJECTS: ${AI_OBJECTS_VALID.join(', ')}

JSON format — every cell must have x, y, type, name. Add object field only when placing one.
[{"x":0,"y":0,"type":"grass","name":"Town Edge","object":"tree_oak_lg"},{"x":3,"y":2,"type":"building","name":"The Salted Herring Inn","interiorType":"inn"},{"x":3,"y":3,"type":"street","name":"Harbour Road","object":"path_v"},...]`;

  """

content = content[:start] + new_block + content[end:]

with open('map-editor.html', 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Done. {len(content.splitlines())} lines')
