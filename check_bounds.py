import re
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js','r',encoding='utf-8') as f:
    src = f.read()

start = src.find('// EAST-PORT')
end = src.find("makeSimpleTown('harvestfell'", start)
block = src[start:end]

xs, ys = [], []
for m in re.finditer(r'\bt\((-?\d+),(-?\d+),', block):
    xs.append(int(m.group(1))); ys.append(int(m.group(2)))
for m in re.finditer(r'\brect\((-?\d+),(-?\d+),(-?\d+),(-?\d+),', block):
    xs += [int(m.group(1)), int(m.group(3))]
    ys += [int(m.group(2)), int(m.group(4))]
for m in re.finditer(r'for\(let x=(-?\d+);x<=(-?\d+)', block):
    xs += [int(m.group(1)), int(m.group(2))]
for m in re.finditer(r'for\(let y=(-?\d+);y<=(-?\d+)', block):
    ys += [int(m.group(1)), int(m.group(2))]

print(f'X range: {min(xs)} to {max(xs)} (width={max(xs)-min(xs)+1})')
print(f'Y range: {min(ys)} to {max(ys)} (height={max(ys)-min(ys)+1})')
