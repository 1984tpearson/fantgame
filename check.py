import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('map-editor.html', encoding='utf-8') as f:
    content = f.read()

# Rename the inner split function to bspSplit
old = """  function split(x, y, w, h, depth) {
    if (depth === 0 || (w < minRoom*2+3 && h < minRoom*2+3)) {
      // Leaf — carve a room
      const rw = minRoom + Math.floor(Math.random() * Math.max(1, w - minRoom - 2));
      const rh = minRoom + Math.floor(Math.random() * Math.max(1, h - minRoom - 2));
      const rx = x + 1 + Math.floor(Math.random() * Math.max(1, w - rw - 1));
      const ry = y + 1 + Math.floor(Math.random() * Math.max(1, h - rh - 1));
      for (let cx = rx; cx < rx+rw; cx++) for (let cy = ry; cy < ry+rh; cy++) tile(cx, cy, floorType, 'Room');
      rooms.push({cx: Math.floor(rx+rw/2), cy: Math.floor(ry+rh/2)});
      return {cx: Math.floor(rx+rw/2), cy: Math.floor(ry+rh/2)};
    }
    let a, b;
    const horiz = w < minRoom*2+3 ? true : h < minRoom*2+3 ? false : Math.random() < 0.5;
    if (horiz) {
      const split = Math.floor(minRoom + Math.random() * (h - minRoom*2));
      a = split(x, y, w, split, depth-1);
      b = split(x, y+split, w, h-split, depth-1);
    } else {
      const split = Math.floor(minRoom + Math.random() * (w - minRoom*2));
      a = split(x, y, split, h, depth-1);
      b = split(x+split, y, w-split, h, depth-1);
    }
    // Connect centers with corridor
    let cx = a.cx, cy = a.cy;
    while (cx !== b.cx) { tile(cx, cy, floorType, 'Corridor'); cx += Math.sign(b.cx - cx); }
    while (cy !== b.cy) { tile(cx, cy, floorType, 'Corridor'); cy += Math.sign(b.cy - cy); }
    tile(cx, cy, floorType, 'Corridor');
    return {cx: Math.floor((a.cx+b.cx)/2), cy: Math.floor((a.cy+b.cy)/2)};
  }

  split(0, 0, W, H, 4);"""

new = """  function bspSplit(x, y, w, h, depth) {
    if (depth === 0 || (w < minRoom*2+3 && h < minRoom*2+3)) {
      // Leaf — carve a room
      const rw = minRoom + Math.floor(Math.random() * Math.max(1, w - minRoom - 2));
      const rh = minRoom + Math.floor(Math.random() * Math.max(1, h - minRoom - 2));
      const rx = x + 1 + Math.floor(Math.random() * Math.max(1, w - rw - 1));
      const ry = y + 1 + Math.floor(Math.random() * Math.max(1, h - rh - 1));
      for (let cx = rx; cx < rx+rw; cx++) for (let cy = ry; cy < ry+rh; cy++) tile(cx, cy, floorType, 'Room');
      rooms.push({cx: Math.floor(rx+rw/2), cy: Math.floor(ry+rh/2)});
      return {cx: Math.floor(rx+rw/2), cy: Math.floor(ry+rh/2)};
    }
    let a, b;
    const horiz = w < minRoom*2+3 ? true : h < minRoom*2+3 ? false : Math.random() < 0.5;
    if (horiz) {
      const sp = Math.floor(minRoom + Math.random() * (h - minRoom*2));
      a = bspSplit(x, y, w, sp, depth-1);
      b = bspSplit(x, y+sp, w, h-sp, depth-1);
    } else {
      const sp = Math.floor(minRoom + Math.random() * (w - minRoom*2));
      a = bspSplit(x, y, sp, h, depth-1);
      b = bspSplit(x+sp, y, w-sp, h, depth-1);
    }
    // Connect centers with corridor
    let cx = a.cx, cy = a.cy;
    while (cx !== b.cx) { tile(cx, cy, floorType, 'Corridor'); cx += Math.sign(b.cx - cx); }
    while (cy !== b.cy) { tile(cx, cy, floorType, 'Corridor'); cy += Math.sign(b.cy - cy); }
    tile(cx, cy, floorType, 'Corridor');
    return {cx: Math.floor((a.cx+b.cx)/2), cy: Math.floor((a.cy+b.cy)/2)};
  }

  bspSplit(0, 0, W, H, 4);"""

if old in content:
    content = content.replace(old, new)
    print('Fixed.')
else:
    print('ERROR: not found')

with open('map-editor.html', 'w', encoding='utf-8') as f:
    f.write(content)
