import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('map-editor.html', encoding='utf-8') as f:
    content = f.read()

start = content.find("} else if (mode === 'settlement') {")
end = content.find("  } else {", start)
old_block = content[start:end]
print(f'Block length: {len(old_block)} chars')

new_block = r"""} else if (mode === 'settlement') {
    prompt = `You are generating an outdoor settlement tile map for a gritty low-fantasy RPG. Design a dense, lived-in space.

LOCATION: ${type} in ${sname}. ${notes ? 'Atmosphere: ' + notes : ''}
GRID: ${w} wide x ${h} tall. x=0=west, x=${w-1}=east, y=0=north (top), y=${h-1}=south (bottom).

MANDATORY DESIGN RULES:
1. PATHS FIRST: Lay out 1-2 main streets ("road" type) and 2-4 side streets ("street" type) connecting areas. Paths must reach grid edges.
2. BUILDINGS: Place 3-8 named buildings ("building" type, 1-4 cells each). Real names e.g. "The Rusty Anchor Inn", "Grain Store", "Cooper's Workshop". Add interiorType: house, inn, shop, blacksmith, chapel, market_hall, bathhouse, harbormaster.
3. NATURE: Scatter trees (tree_oak, tree_oak_lg, tree_pine, tree_pine_lg), bushes (bush, bush_lg), flowers, mushrooms, thicket on grass cells. At least 15% of grass cells must have a nature object.
4. OBJECT DENSITY: ~40% of non-building, non-path cells should have objects. Use the full object list.
5. VARIED TERRAIN: Mix grass, mud, sand, shallow_water, water. No large uniform zones without objects.
6. STREET OBJECTS: Place stalls, carts, barrels, signposts, troughs, wells, noticeboards on/near streets.
7. Name every cell descriptively.
8. Cover ALL ${w*h} cells exactly once.

VALID TERRAIN: ${validT}
ALL VALID OBJECTS: ${AI_OBJECTS_VALID.join(', ')}
BUILDING INTERIOR TYPES: house, inn, shop, blacksmith, chapel, market_hall, bathhouse, harbormaster

Return ONLY a JSON array of ${w*h} objects. Zero explanation, zero markdown.
[{"x":0,"y":0,"type":"grass","name":"Town Common","object":"tree_oak"},{"x":3,"y":2,"type":"building","name":"The Rusty Anchor Inn","interiorType":"inn"},{"x":2,"y":4,"type":"street","name":"Market Lane","object":"stall"},...]`;

  """

content = content[:start] + new_block + content[end:]

with open('map-editor.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done.')
