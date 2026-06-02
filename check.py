import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8') as f:
    content = f.read()

old = "if(visited)return`Player returns to (${x},${y}). Terrain: ${meta.type}${meta.name?`, ${meta.name}`:''].Previously: \"${cell.locationName}\". ${dirContext}${notesLine}${npcHint}\\nBriefly acknowledge return.`;return`First visit to (${x},${y}). Terrain: ${meta.type}${meta.name?`, part of ${meta.name}`:''].${dirContext} Day ${Math.floor(state.player.day)}.${notesLine}${npcHint}\\nDescribe what the player sees, smells, hears.`;"

new = "const objectHint=meta.object?` There is a ${meta.object} here.`:'';if(visited)return`Player returns to (${x},${y}). Terrain: ${meta.type}${meta.name?`, ${meta.name}`:''].Previously: \"${cell.locationName}\".${objectHint} ${dirContext}${notesLine}${npcHint}\\nBriefly acknowledge return.`;return`First visit to (${x},${y}). Terrain: ${meta.type}${meta.name?`, part of ${meta.name}`:''].${objectHint} ${dirContext} Day ${Math.floor(state.player.day)}.${notesLine}${npcHint}\\nDescribe what the player sees, smells, hears.`;"

# Use repr to get exact match
old_repr = old.replace("'']", "''\\]")

# Find using index
idx = content.find("if(visited)return`Player returns to")
end_marker = "Describe what the player sees, smells, hears.`;"
end_idx = content.find(end_marker, idx) + len(end_marker)
found = content[idx:end_idx]
print("Found length:", len(found))
print("First 100:", repr(found[:100]))

replacement = "const objectHint=meta.object?` There is a ${meta.object} here.`:'';if(visited)return`Player returns to (${x},${y}). Terrain: ${meta.type}${meta.name?`, ${meta.name}`:''].Previously: \"${cell.locationName}\".${objectHint} ${dirContext}${notesLine}${npcHint}\\nBriefly acknowledge return.`;return`First visit to (${x},${y}). Terrain: ${meta.type}${meta.name?`, part of ${meta.name}`:''].${objectHint} ${dirContext} Day ${Math.floor(state.player.day)}.${notesLine}${npcHint}\\nDescribe what the player sees, smells, hears.`;"

new_content = content[:idx] + replacement + content[end_idx:]
print("Length diff:", len(new_content) - len(content))

with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Done")
