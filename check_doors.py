import re
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js','r',encoding='utf-8') as f: src=f.read()
start=src.find('// EAST-PORT')
end=src.find("makeSimpleTown('harvestfell'",start)
block=src[start:end]
doors=[m.group(0) for m in re.finditer(r"doors:\[[^\]]+\]",block)]
print(f'Doors found: {len(doors)}')
for d in doors[:10]: print(' ',d)
# Also check a specific tile
idx = block.find("t(-5,12,")
if idx != -1:
    print("Sample tile:", block[idx:idx+80])
else:
    print("t(-5,12) not found")
