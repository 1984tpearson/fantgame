import re

path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('// EAST-PORT')
block_start = content.rfind('(function(){', 0, start)
end_marker = "makeSimpleTown('harvestfell'"
end = content.find(end_marker)
block_end = content.rfind('})();\n', 0, end) + len('})();\n')
block = content[block_start:block_end]

def add_door(blk, x, y, dirs):
    """Add doors array to the interiorType object on tile t(x,y,...)."""
    needle = f"t({x},{y},'building',"
    idx = blk.find(needle)
    if idx == -1:
        print(f"  WARNING: not found t({x},{y})")
        return blk
    # Find the closing ); of this line
    end_idx = blk.find(');', idx)
    segment = blk[idx:end_idx]
    # Replace {interiorType:'X'} with {interiorType:'X',doors:['d']}
    new_seg = re.sub(
        r"\{interiorType:'([^']*)'\}",
        lambda m: "{interiorType:'" + m.group(1) + "',doors:" + str(dirs).replace('"',"'") + "}",
        segment
    )
    if new_seg == segment:
        print(f"  WARNING: no interiorType found on t({x},{y})")
        return blk
    return blk[:idx] + new_seg + blk[idx+len(segment):]

# Market District
block = add_door(block, -5, 12, ['east'])
block = add_door(block, -5, 16, ['east'])
block = add_door(block, 4, 12, ['west'])
block = add_door(block, 4, 16, ['west'])
block = add_door(block, -2, 9, ['north'])
block = add_door(block, 2, 9, ['north'])
block = add_door(block, -2, 19, ['south'])
block = add_door(block, 2, 19, ['south'])

# Fishermen's Quarter
block = add_door(block, 6, 19, ['south'])
block = add_door(block, 7, 19, ['south'])
block = add_door(block, 9, 19, ['south'])
block = add_door(block, 11, 19, ['west'])
block = add_door(block, 6, 16, ['south'])
block = add_door(block, 7, 16, ['south'])
block = add_door(block, 9, 16, ['south'])
block = add_door(block, 6, 15, ['west'])

# Fishermen's net sheds - use rect tiles, patch manually
block = block.replace(
    "rect(6,23,8,27,'building','Net Shed',{interiorType:'house'})",
    "rect(6,23,8,27,'building','Net Shed',{interiorType:'house'});\nt(6,23,'building','Net Shed',{interiorType:'house',doors:['south']})"
)
block = block.replace(
    "rect(9,23,11,27,'building','Net Shed',{interiorType:'house'})",
    "rect(9,23,11,27,'building','Net Shed',{interiorType:'house'});\nt(9,23,'building','Net Shed',{interiorType:'house',doors:['south']})"
)

# Merchant Quarter
block = add_door(block, -6, 23, ['south'])
block = add_door(block, -7, 23, ['south'])
block = add_door(block, -9, 23, ['south'])
block = add_door(block, -11, 23, ['south'])
block = add_door(block, -13, 23, ['south'])
block = add_door(block, -6, 26, ['east'])
block = add_door(block, -9, 26, ['east'])
block = add_door(block, -11, 26, ['east'])
block = add_door(block, -13, 26, ['east'])
block = add_door(block, -6, 19, ['east'])
block = add_door(block, -9, 19, ['east'])
block = add_door(block, -11, 19, ['east'])
block = add_door(block, -13, 19, ['east'])

# Residential
block = add_door(block, -6, 10, ['east'])
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
block = add_door(block, 6, 11, ['west'])
block = add_door(block, 9, 11, ['west'])
block = add_door(block, 6, 7, ['west'])
block = add_door(block, 9, 7, ['west'])
block = add_door(block, 6, 3, ['west'])
block = add_door(block, 7, 3, ['west'])
block = add_door(block, 9, 3, ['west'])
block = add_door(block, 11, 3, ['west'])
block = add_door(block, 13, 3, ['west'])
block = add_door(block, 6, 8, ['west'])
block = add_door(block, 9, 8, ['west'])
block = add_door(block, 11, 8, ['west'])
block = add_door(block, 13, 8, ['west'])

# Harbormaster
block = add_door(block, 10, 14, ['west'])

# Verify
import re as re2
doors = re2.findall(r"doors:\[[^\]]+\]", block)
print(f"Doors added: {len(doors)}")

content = content[:block_start] + block + content[block_end:]
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
