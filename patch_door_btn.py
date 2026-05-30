path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0
def patch(old, new, label):
    global content, changes
    if old in content:
        content = content.replace(old, new, 1)
        print(f"  patched: {label}")
        changes += 1
    elif new in content:
        print(f"  already done: {label}")
    else:
        print(f"  MISSING: {label}")

# 1. In move(), skip the prompt and just enter directly
patch(
    """    const doorNeeded = dx===1?'west':dx===-1?'east':dy===1?'north':dy===-1?'south':null;
    if (doorNeeded && meta.doors.includes(doorNeeded)) {
      showDoorPrompt(nx, ny, doorNeeded, meta);
      return;
    }""",
    """    const doorNeeded = dx===1?'west':dx===-1?'east':dy===1?'north':dy===-1?'south':null;
    if (doorNeeded && meta.doors.includes(doorNeeded)) {
      await enterBuilding(nx, ny);
      return;
    }""",
    "move() enter directly"
)

# 2. In updateMoveButtons(), enable button if target has a door on the correct face
patch(
    """const dirs={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0],ne:[1,-1],nw:[-1,-1],se:[1,1],sw:[-1,1]};for(const[d,[dx,dy]]of Object.entries(dirs)){const btn=document.getElementById(`btn-${d}`);if(!btn)continue;const nx=x+dx,ny=y+dy;const wm=getCellMeta(nx,ny);btn.disabled=!isTraversable(wm.type)||state.inCombat||isBlocked;""",
    """const dirs={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0],ne:[1,-1],nw:[-1,-1],se:[1,1],sw:[-1,1]};for(const[d,[dx,dy]]of Object.entries(dirs)){const btn=document.getElementById(`btn-${d}`);if(!btn)continue;const nx=x+dx,ny=y+dy;const wm=getCellMeta(nx,ny);const doorFace=dx===1?'west':dx===-1?'east':dy===1?'north':dy===-1?'south':null;const hasDoor=wm.type===T.BUILDING&&wm.doors&&doorFace&&wm.doors.includes(doorFace);btn.disabled=(!isTraversable(wm.type)&&!hasDoor)||state.inCombat||isBlocked;btn.style.outline=hasDoor?'2px solid rgba(201,148,58,0.7)':'';""",
    "updateMoveButtons door enable"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"\nDone. {changes} changes applied.")
