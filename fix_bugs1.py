
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'r', encoding='utf-8') as f:
    engine = f.read()

# Fix 1: Frilar-Town -> East-Port in system prompt
engine = engine.replace("Frilar-Town (far E ~2778,4447)", "East-Port (SE coast ~346,556)")
engine = engine.replace("Frilar-Town", "East-Port")

# Fix 3: Stricter notice instruction
engine = engine.replace(
    "NOTICE: ~1 in 5 squares. Omit if in doubt.",
    "NOTICE: Rare — only when something is genuinely surprising, hidden, or interactive (a strange figure lurking, a glimmer behind a bush, an unusual sound). Do NOT generate notice text on most squares. When in doubt, omit entirely."
)

# Fix 4a: No coordinates in narrative — add to coordinate system line
engine = engine.replace(
    "COORDINATE SYSTEM: Lower Y = north. Higher Y = south. Higher X = east. Lower X = west.",
    "COORDINATE SYSTEM: Lower Y = north. Higher Y = south. Higher X = east. Lower X = west.\nNEVER include coordinates, grid positions, axis references (x-axis, y-axis), cell numbers, or any numerical position in narrative text shown to the player."
)

# Fix 4b: No coordinates in NPC system prompt rules
engine = engine.replace(
    "- Stay in character. Short, vivid responses. 1-3 sentences per turn.",
    "- Stay in character. Short, vivid responses. 1-3 sentences per turn.\n- NEVER mention coordinates, grid positions, axis references, or cell numbers."
)

# Fix 2: Overworld NPC position check in getNpcsAtCurrentLocation
# Current code just does: present.push(id); break; for overworld
# Replace with a radius check using x,y on the slot
old_overworld_check = "      } else if (state.layer === 'overworld') {\n        present.push(id); break;\n      }"
new_overworld_check = """      } else if (state.layer === 'overworld') {
        // For overworld NPCs, only show if player is within 2 squares of their posKey coords
        if (slot.posKey) {
          const parts = slot.posKey.split(',');
          if (parts.length === 2) {
            const nx = parseInt(parts[0]), ny = parseInt(parts[1]);
            if (Math.abs(nx - state.pos.x) <= 2 && Math.abs(ny - state.pos.y) <= 2) {
              present.push(id); break;
            }
          }
        } else {
          present.push(id); break;
        }
      }"""

if old_overworld_check in engine:
    engine = engine.replace(old_overworld_check, new_overworld_check)
    print("Overworld NPC check patched.")
else:
    print("WARNING: overworld NPC check string not found — may need manual check.")

with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'w', encoding='utf-8') as f:
    f.write(engine)
print("engine.js done.")
