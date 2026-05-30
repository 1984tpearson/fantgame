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

# 1. Disable diagonal door detection - only cardinal directions
patch(
    "const doorFace=dx===1?'west':dx===-1?'east':dy===1?'north':dy===-1?'south':null;const hasDoor=wm.type===T.BUILDING&&wm.doors&&doorFace&&wm.doors.includes(doorFace);",
    "const isDiag=dx!==0&&dy!==0;const doorFace=!isDiag?(dx===1?'west':dx===-1?'east':dy===1?'north':dy===-1?'south':null):null;const hasDoor=wm.type===T.BUILDING&&wm.doors&&doorFace&&wm.doors.includes(doorFace);",
    "disable diagonal doors"
)

# 2. Change door line colour from gold to dark brown
patch(
    "ctx.strokeStyle='#e8b84b';ctx.lineWidth=Math.max(2,cs*0.14);ctx.lineCap='round';const dm=cs*0.28",
    "ctx.strokeStyle='#7a4a20';ctx.lineWidth=Math.max(2,cs*0.16);ctx.lineCap='round';const dm=cs*0.28",
    "door line colour dark brown"
)

# 3. Add gold outline on door buttons AND replace arrow text with "Enter"
# The button innerHTML currently shows arrow characters - we need to override it
patch(
    "btn.style.outline=hasDoor?'2px solid rgba(201,148,58,0.7)':'';",
    """btn.style.outline=hasDoor?'2px solid rgba(160,100,40,0.6)':'';
      if(hasDoor){const prev=btn.getAttribute('data-orig-html')||btn.innerHTML;btn.setAttribute('data-orig-html',prev);btn.innerHTML='<span style="font-size:0.6rem;font-family:\\'Cinzel Decorative\\',serif;letter-spacing:0.05em;color:rgba(201,148,58,0.9);">enter</span>';}else{const orig=btn.getAttribute('data-orig-html');if(orig){btn.innerHTML=orig;btn.removeAttribute('data-orig-html');}}""",
    "door button enter text"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"\nDone. {changes} changes applied.")
