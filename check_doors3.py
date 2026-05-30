with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js','r',encoding='utf-8') as f:
    src = f.read()
start = src.find('// EAST-PORT')
end = src.find("makeSimpleTown('harvestfell'", start)
block = src[start:end]
# Print all lines with 'doors'
for line in block.split('\n'):
    if 'doors' in line:
        print(repr(line[:100]))
