path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Strategy: strip ALL doors from every building tile, then re-add only the
# entrance tile for each building (one door per building, correct side).
# 
# Buildings and their single entrance tile + direction:
# Market District
# (-5,12) Salt & Sail Inn        -> east door (faces market square)
# (-5,16) Market Hall            -> east door
# (4,12)  Chandler & Rope        -> west door
# (4,16)  Spice Merchant         -> west door
# (-2,9)  Fletcher's Stall       -> south door (faces Quay Road y=6... actually faces market, north)
# (2,9)   Grain Exchange         -> south door
# (-2,19) Apothecary             -> north door
# (2,19)  Moneylender            -> north door
#
# Fishermen's Quarter
# net sheds: entrance on south side, first tile of each rect
# (6,23) net shed 1 south door
# (9,23) net shed 2 south door
# (6,19) cottage south door (single tile buildings, keep as is — one door each is fine)
# (7,19) cottage south
# (9,19) cottage south
# (11,19) cottage west (faces Pier Lane)
# (6,16) cottage south
# (7,16) cottage south
# (9,16) cottage south
# (6,15) Smokehouse west (faces Tanner's Lane x=5)
#
# Merchant Quarter
# (-6,23) through (-13,23): south doors on the south-facing row
# (-6,26) through (-13,26): east doors (face Chapel Lane x=-5 or Salt Lane x=-3)
# (-6,19) Notary east (faces Salt Lane)
# Merchant houses on rows 19,26,36 keep one door each
#
# Residential
# Chapel: entrance on east side at (-6,10) 
# Houses on y=7: east doors
# Houses on y=3: north or east doors
#
# Tradesmen's Row  
# Blacksmith (6,10)-(7,10)-(6,11)-(7,11): one door at (6,11) west (faces Rope Lane)
# Bathhouse (9,10)-(9,11): one door at (9,11) west
# Tannery (6,7): west door
# Carpenter (9,7): west door
# Houses: keep single door
#
# Harbormaster (10,14)-(11,14)-(10,15)-(11,15): one door at (10,14) west (faces Pier Lane)

# First: strip ALL existing doors from all t() calls in East-Port block
# We'll rebuild just the entrance doors

start = content.find('// EAST-PORT')
block_start = content.rfind('(function(){', 0, start)
end_marker = "makeSimpleTown('harvestfell'"
end = content.find(end_marker)
block_end = content.rfind('})();\n', 0, end) + len('})();\n')

block = content[block_start:block_end]

# Remove doors from ALL t() calls
block = re.sub(r",\{interiorType:'([^']*)',doors:\[[^\]]*\]\}", r",{interiorType:'\1'}", block)
# Also remove standalone doors:[] 
block = re.sub(r",\{doors:\[[^\]]*\]\}", "", block)

# Now add single entrance doors to specific tiles
# Format: find exact t(x,y,'building','Name',{interiorType:'X'}) and add doors

def add_door(blk, x, y, doors_list):
    """Add doors to a specific tile."""
    doors_str = str(doors_list).replace('"', "'").replace(" ", "")
    # Match t(x,y,'building',...,{interiorType:'...'}) 
    old = f"t({x},{y},'building',"
    # Find the full line
    idx = blk.find(old)
    if idx == -1:
        print(f"  WARNING: tile not found: t({x},{y})")
        return blk
    # Find the closing }) of this t() call
    line_end = blk.find('\n', idx)
    line = blk[idx:line_end]
    # Add doors to the extra object
    if '{interiorType:' in line:
        new_line = line.replace("})}", f",doors:{doors_str}}})")
        blk = blk[:idx] + new_line + blk[line_end:]
    return blk

# Market District - single entrance tiles
block = add_door(block, -5, 12, ['east'])   # Salt & Sail Inn
block = add_door(block, -5, 16, ['east'])   # Market Hall
block = add_door(block, 4, 12, ['west'])    # Chandler & Rope
block = add_door(block, 4, 16, ['west'])    # Spice Merchant
block = add_door(block, -2, 9, ['north'])   # Fletcher's Stall
block = add_door(block, 2, 9, ['north'])    # Grain Exchange
block = add_door(block, -2, 19, ['south'])  # Apothecary
block = add_door(block, 2, 19, ['south'])   # Moneylender

# Fishermen's Quarter - net sheds (first tile of each rect = entrance)
block = add_door(block, 6, 23, ['south'])   # Net Shed 1
block = add_door(block, 9, 23, ['south'])   # Net Shed 2
# Cottages - single tile each, face south or west
block = add_door(block, 6, 19, ['south'])
block = add_door(block, 7, 19, ['south'])
block = add_door(block, 9, 19, ['south'])
block = add_door(block, 11, 19, ['west'])
block = add_door(block, 6, 16, ['south'])
block = add_door(block, 7, 16, ['south'])
block = add_door(block, 9, 16, ['south'])
block = add_door(block, 6, 15, ['west'])    # Smokehouse

# Merchant Quarter - south-facing row entrances
block = add_door(block, -6, 23, ['south'])
block = add_door(block, -9, 23, ['south'])
block = add_door(block, -11, 23, ['south'])
block = add_door(block, -13, 23, ['south'])
# Upper rows face east (toward Chapel Lane / Salt Lane)
block = add_door(block, -6, 26, ['east'])
block = add_door(block, -9, 26, ['east'])
block = add_door(block, -11, 26, ['east'])
block = add_door(block, -13, 26, ['east'])
block = add_door(block, -6, 19, ['east'])   # Notary & Scribe
block = add_door(block, -9, 19, ['east'])
block = add_door(block, -11, 19, ['east'])
block = add_door(block, -13, 19, ['east'])

# Residential
block = add_door(block, -6, 10, ['east'])   # Chapel of the Tides entrance
block = add_door(block, -6, 7, ['east'])
block = add_door(block, -7, 7, ['east'])
block = add_door(block, -9, 7, ['east'])
block = add_door(block, -11, 7, ['east'])
block = add_door(block, -13, 7, ['east'])
block = add_door(block, -6, 3, ['east'])
block = add_door(block, -7, 3, ['east'])
block = add_door(block, -9, 3, ['north'])
block = add_door(block, -11, 3, ['north'])
block = add_door(block, -13, 3, ['north'])

# Tradesmen's Row
block = add_door(block, 6, 11, ['west'])    # Blacksmith entrance
block = add_door(block, 9, 11, ['west'])    # Bathhouse entrance
block = add_door(block, 6, 7, ['west'])     # Tannery
block = add_door(block, 9, 7, ['west'])     # Carpenter
block = add_door(block, 6, 3, ['west'])
block = add_door(block, 7, 3, ['west'])
block = add_door(block, 9, 3, ['west'])
block = add_door(block, 11, 3, ['west'])
block = add_door(block, 13, 3, ['west'])
block = add_door(block, 6, 8, ['west'])
block = add_door(block, 9, 8, ['west'])
block = add_door(block, 11, 8, ['west'])
block = add_door(block, 13, 8, ['west'])

# Harbormaster - west entrance facing Pier Lane
block = add_door(block, 10, 14, ['west'])

content = content[:block_start] + block + content[block_end:]
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Door sweep done")
