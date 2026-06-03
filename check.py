import sys, json, re
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js', encoding='utf-8') as f:
    txt = f.read()

# Simulate what the JS runtime builds for s.map by parsing all t() calls
# including those inside for loops - we need to evaluate the loops
# Let's count unique y values that appear in t() calls (direct) vs for loops

idx = txt.find("// EAST-PORT")
end = txt.find("SETTLEMENTS['frilar_town']")
block = txt[idx:end]

# Direct t() calls (not in for loops)
direct = re.findall(r"^t\((-?\d+),(-?\d+),", block, re.MULTILINE)
print(f"Direct t() calls: {len(direct)}")
ys_direct = sorted(set(int(y) for x,y in direct))
print(f"Y values in direct t(): {ys_direct}")

# rect() calls expand to many cells
rects = re.findall(r'rect\((-?\d+),(-?\d+),(-?\d+),(-?\d+),', block)
rect_ys = set()
for r in rects:
    for y in range(int(r[1]), int(r[3])+1):
        rect_ys.add(y)
print(f"Y values from rect(): {sorted(rect_ys)}")

# For-loop t() calls - parse the y ranges
for_loops = re.findall(r'for\(let y=(-?\d+);y<=(-?\d+);y\+\+\)t\(', block)
loop_ys = set()
for start_y, end_y in for_loops:
    for y in range(int(start_y), int(end_y)+1):
        loop_ys.add(y)
print(f"Y values from for-loops: {sorted(loop_ys)}")

# Combined
all_ys = set(int(y) for x,y in direct) | rect_ys | loop_ys
print(f"\nFull Y range: {min(all_ys)} to {max(all_ys)}")
print(f"Total unique y values: {len(all_ys)}")
