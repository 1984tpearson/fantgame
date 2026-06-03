import sys
sys.stdout.reconfigure(encoding='utf-8')
path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js'
with open(path, encoding='utf-8') as f:
    txt = f.read()

old = """function _drawObjSprite(ctx, srcCanvas, sx, sy, cs, nativeW, nativeH, snap, rotation) {
  // cs = cell size in screen pixels, nativeW/H in mapforge pixels (20px per cell)
  const sprW = (nativeW / 20) * cs;
  const sprH = (nativeH / 20) * cs;"""

new = """function _drawObjSprite(ctx, srcCanvas, sx, sy, cs, nativeW, nativeH, snap, rotation) {
  // cs = cell size in screen pixels, nativeW/H in mapforge pixels (20px per cell)
  let sprW = (nativeW / 20) * cs;
  let sprH = (nativeH / 20) * cs;
  // Single-cell objects: scale to fit with up to 15% overlap
  const maxD = cs * 1.15;
  if(sprW > maxD || sprH > maxD){
    const scale = Math.min(maxD/sprW, maxD/sprH);
    sprW *= scale; sprH *= scale;
  }"""

assert old in txt, "not found"
txt = txt.replace(old, new, 1)
print("OK")

with open(path, 'w', encoding='utf-8') as f:
    f.write(txt)
print("DONE")
