import sys
sys.stdout.reconfigure(encoding='utf-8')
path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\map-editor.html'
with open(path, encoding='utf-8') as f:
    txt = f.read()

# 1. Increase viewport radius and default zoom
old = "const OW_VIEWPORT_R = 30; // 61x61 viewport"
new = "const OW_VIEWPORT_R = 50; // 101x101 viewport"
assert old in txt
txt = txt.replace(old, new, 1)
print("OK: viewport radius 50")

old = "  if(mode==='overworld'){tileSize=4;document.getElementById('zoom-select').value='4';}"
new = "  if(mode==='overworld'){tileSize=12;document.getElementById('zoom-select').value='12';}"
assert old in txt
txt = txt.replace(old, new, 1)
print("OK: default OW zoom 12x")

# 2. Replace the keyboard handler with one that doesn't need canvas focus
# and add drag panning
old = """// Overworld panning via arrow keys
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

new = """// Overworld panning
const OW_PAN_STEP = 15;
let owDragging=false, owDragStartX=0, owDragStartY=0, owDragCX=0, owDragCY=0;

function owPan(dx,dy){
  owCX=Math.max(OW_BOUNDS.minX+OW_VIEWPORT_R,Math.min(OW_BOUNDS.maxX-OW_VIEWPORT_R,owCX+dx));
  owCY=Math.max(OW_BOUNDS.minY+OW_VIEWPORT_R,Math.min(OW_BOUNDS.maxY-OW_VIEWPORT_R,owCY+dy));
  document.getElementById('ow-cx').value=owCX;
  document.getElementById('ow-cy').value=owCY;
  tileCache.clear(); loadLayer();
}

// Arrow key panning — attached to document so no focus needed
document.addEventListener('keydown', e => {
  if(editorMode!=='overworld')return;
  if(e.target.matches('input,select,textarea'))return;
  const k=e.key;
  if(k==='ArrowLeft') {e.preventDefault();owPan(-OW_PAN_STEP,0);}
  else if(k==='ArrowRight'){e.preventDefault();owPan(OW_PAN_STEP,0);}
  else if(k==='ArrowUp')  {e.preventDefault();owPan(0,-OW_PAN_STEP);}
  else if(k==='ArrowDown'){e.preventDefault();owPan(0, OW_PAN_STEP);}
});

// Middle-mouse or right-mouse drag to pan
canvas.addEventListener('mousedown', e => {
  if(editorMode==='overworld' && (e.button===1||e.button===2)){
    owDragging=true; owDragStartX=e.clientX; owDragStartY=e.clientY;
    owDragCX=owCX; owDragCY=owCY;
    e.preventDefault();
  }
});
canvas.addEventListener('mousemove', e => {
  if(!owDragging)return;
  const dx=Math.round((e.clientX-owDragStartX)/tileSize);
  const dy=Math.round((e.clientY-owDragStartY)/tileSize);
  owCX=Math.max(OW_BOUNDS.minX+OW_VIEWPORT_R,Math.min(OW_BOUNDS.maxX-OW_VIEWPORT_R,owDragCX-dx));
  owCY=Math.max(OW_BOUNDS.minY+OW_VIEWPORT_R,Math.min(OW_BOUNDS.maxY-OW_VIEWPORT_R,owDragCY-dy));
  document.getElementById('ow-cx').value=owCX;
  document.getElementById('ow-cy').value=owCY;
  tileCache.clear(); loadLayer();
});
canvas.addEventListener('mouseup', e=>{if(e.button===1||e.button===2)owDragging=false;});
canvas.addEventListener('contextmenu', e=>{if(editorMode==='overworld')e.preventDefault();});

// Pan buttons in topbar
document.getElementById('ow-pan-n').addEventListener('click',()=>owPan(0,-OW_PAN_STEP));
document.getElementById('ow-pan-s').addEventListener('click',()=>owPan(0, OW_PAN_STEP));
document.getElementById('ow-pan-w').addEventListener('click',()=>owPan(-OW_PAN_STEP,0));
document.getElementById('ow-pan-e').addEventListener('click',()=>owPan( OW_PAN_STEP,0));"""

assert old in txt
txt = txt.replace(old, new, 1)
print("OK: panning updated")

# 3. Add pan buttons to topbar ow-nav
old = """  <div id="ow-nav" style="display:none;gap:3px;align-items:center;">
    <span style="font-size:10px;color:#6a5030;">Centre:</span>
    <input id="ow-cx" type="text" style="width:45px;" value="346">
    <input id="ow-cy" type="text" style="width:45px;" value="556">
    <button id="ow-go">Go</button>
    <div class="sep"></div>
  </div>"""
new = """  <div id="ow-nav" style="display:none;gap:3px;align-items:center;">
    <button id="ow-pan-n" title="North">&#8593;</button>
    <button id="ow-pan-s" title="South">&#8595;</button>
    <button id="ow-pan-w" title="West">&#8592;</button>
    <button id="ow-pan-e" title="East">&#8594;</button>
    <div class="sep"></div>
    <span style="font-size:10px;color:#6a5030;">Jump:</span>
    <input id="ow-cx" type="text" style="width:40px;" value="346">
    <input id="ow-cy" type="text" style="width:40px;" value="556">
    <button id="ow-go">Go</button>
    <div class="sep"></div>
  </div>"""
assert old in txt
txt = txt.replace(old, new, 1)
print("OK: pan buttons in topbar")

with open(path, 'w', encoding='utf-8') as f:
    f.write(txt)
print("DONE")
