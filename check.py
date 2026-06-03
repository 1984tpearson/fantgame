import sys
sys.stdout.reconfigure(encoding='utf-8')
path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\map-editor.html'
with open(path, encoding='utf-8') as f:
    txt = f.read()

# Fix cellToCanvas to not flip y for overworld
old = "function cellToCanvas(x,y){return{px:(x-bounds.minX)*tileSize,py:(gridH()-1-(y-bounds.minY))*tileSize};}"
new = """function cellToCanvas(x,y){
  const px=(x-bounds.minX)*tileSize;
  // Overworld: y increases downward (no flip). Settlement/interior: y=0=south=bottom (flip)
  const py=editorMode==='overworld'
    ? (y-bounds.minY)*tileSize
    : (gridH()-1-(y-bounds.minY))*tileSize;
  return{px,py};
}"""
assert old in txt
txt = txt.replace(old, new, 1)
print("OK: cellToCanvas y-flip fix")

# Fix canvasToCell to match
old = "function canvasToCell(px,py){return{x:Math.floor(px/tileSize)+bounds.minX,y:(gridH()-1-Math.floor(py/tileSize))+bounds.minY};}"
new = """function canvasToCell(px,py){
  const x=Math.floor(px/tileSize)+bounds.minX;
  const y=editorMode==='overworld'
    ? Math.floor(py/tileSize)+bounds.minY
    : (gridH()-1-Math.floor(py/tileSize))+bounds.minY;
  return{x,y};
}"""
assert old in txt
txt = txt.replace(old, new, 1)
print("OK: canvasToCell y-flip fix")

# Add pan step and keyboard panning for overworld
old = "document.getElementById('btn-undo').addEventListener('click',undo);"
new = """document.getElementById('btn-undo').addEventListener('click',undo);

// Overworld panning via arrow keys
const OW_PAN_STEP = 20; // cells per keypress
document.addEventListener('keydown', e => {
  if(editorMode!=='overworld')return;
  if(e.target.matches('input,select,textarea'))return;
  let moved=false;
  if(e.key==='ArrowLeft'||e.key==='a'){owCX-=OW_PAN_STEP;moved=true;}
  if(e.key==='ArrowRight'||e.key==='d'){owCX+=OW_PAN_STEP;moved=true;}
  if(e.key==='ArrowUp'||e.key==='w'){owCY-=OW_PAN_STEP;moved=true;}
  if(e.key==='ArrowDown'||e.key==='s'){owCY+=OW_PAN_STEP;moved=true;}
  if(moved){
    e.preventDefault();
    owCX=Math.max(OW_BOUNDS.minX+OW_VIEWPORT_R,Math.min(OW_BOUNDS.maxX-OW_VIEWPORT_R,owCX));
    owCY=Math.max(OW_BOUNDS.minY+OW_VIEWPORT_R,Math.min(OW_BOUNDS.maxY-OW_VIEWPORT_R,owCY));
    document.getElementById('ow-cx').value=owCX;
    document.getElementById('ow-cy').value=owCY;
    tileCache.clear();loadLayer();
  }
});"""
assert old in txt
txt = txt.replace(old, new, 1)
print("OK: arrow key panning")

# Also update ow-cx/ow-cy inputs to show current centre on load
old = "  document.getElementById('ow-nav').style.display=mode==='overworld'?'flex':'none';"
new = """  document.getElementById('ow-nav').style.display=mode==='overworld'?'flex':'none';
  if(mode==='overworld'){
    document.getElementById('ow-cx').value=owCX;
    document.getElementById('ow-cy').value=owCY;
  }"""
assert old in txt
txt = txt.replace(old, new, 1)
print("OK: ow inputs show current centre")

with open(path, 'w', encoding='utf-8') as f:
    f.write(txt)
print("DONE")
