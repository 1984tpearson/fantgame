path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and remove the duplicate old drag-only mousemove handler
# The new combined one already exists - just remove the old separate one
old = "canvas.addEventListener('mousemove',e=>{if(!mapDrag.active)return;const dx=e.clientX-mapDrag.startX,dy=e.clientY-mapDrag.startY;if(Math.abs(dx)>3||Math.abs(dy)>3)mapDrag.moved=true;mapView.x=mapDrag.startMapX+dx;mapView.y=mapDrag.startMapY+dy;drawMapCanvas();});"

if old in content:
    content = content.replace(old, '', 1)
    print("Removed duplicate drag handler")
else:
    print("Already clean or pattern changed")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
