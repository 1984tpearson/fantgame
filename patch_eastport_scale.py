import re

path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '// EAST-PORT — full layout'
end_marker = '})();\nmakeSimpleTown(\'harvestfell\''

start = content.find(start_marker)
end = content.find(end_marker)
if start == -1 or end == -1:
    print(f"ERROR: markers not found. start={start} end={end}")
    exit(1)

# Walk back to find the opening (function(){
block_start = content.rfind('(function(){', 0, start)
block_end = end + len('})();')

block = content[block_start:block_end]
print(f"Found block: {len(block)} chars, lines: {block.count(chr(10))}")

def halve_num(s):
    return str(int(s) // 2)

def halve_coords_in_block(text):
    # t(x,y,...) - halve first two args
    def sub_t(m):
        return f"t({halve_num(m.group(1))},{halve_num(m.group(2))},"
    text = re.sub(r'\bt\((-?\d+),(-?\d+),', sub_t, text)

    # rect(x1,y1,x2,y2,...) - halve first four args
    def sub_rect(m):
        return f"rect({halve_num(m.group(1))},{halve_num(m.group(2))},{halve_num(m.group(3))},{halve_num(m.group(4))},"
    text = re.sub(r'\brect\((-?\d+),(-?\d+),(-?\d+),(-?\d+),', sub_rect, text)

    # for(let x=N;x<=M;x++) style bounds
    def sub_for_x(m):
        return f"for(let x={halve_num(m.group(1))};x<={halve_num(m.group(2))};x++)"
    text = re.sub(r'for\(let x=(-?\d+);x<=(-?\d+);x\+\+\)', sub_for_x, text)

    def sub_for_y(m):
        return f"for(let y={halve_num(m.group(1))};y<={halve_num(m.group(2))};y++)"
    text = re.sub(r'for\(let y=(-?\d+);y<=(-?\d+);y\+\+\)', sub_for_y, text)

    # entryPos
    def sub_entry(m):
        return f"entryPos:{{x:{halve_num(m.group(1))},y:{halve_num(m.group(2))}}}"
    text = re.sub(r'entryPos:\{x:(-?\d+),y:(-?\d+)\}', sub_entry, text)

    # Update scale comment
    text = text.replace(
        '// 50x60 tiles, 10m/tile (~500m x600m). No walls.',
        '// 25x30 tiles, 20m/tile (~500mx600m). No walls.'
    )
    text = text.replace(
        '// 50\xd760 tiles, 10m/tile (~500m\xd7600m). No walls.',
        '// 25\xd730 tiles, 20m/tile (~500m\xd7600m). No walls.'
    )
    return text

new_block = halve_coords_in_block(block)
new_content = content[:block_start] + new_block + content[block_end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Patched OK")
# Spot checks
for needle, label in [
    ("t(0,0,'road'", "south entry road"),
    ("t(0,15,'road'", "north entry road (was 30)"),
    ("entryPos:{x:0,y:1}", "entryPos halved"),
    ("for(let x=-12;x<=12;x++)", "wall loop halved"),
]:
    print(f"  {label}: {'FOUND' if needle in new_content else 'not found'}")
