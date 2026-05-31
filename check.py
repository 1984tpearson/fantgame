import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8').read()

# Fix 1: Make npcSpawn more emphatic
old_spawn = """NPC SPAWN RULES:
- npcSpawn triggers when the player directs attention at a SPECIFIC individual not already in NPC_TEMPLATES. This includes: talking to, approaching, examining, or interacting with a named or described person or animal. Examples: "I approach the merchant", "I speak to the old woman", "I pet the dog", "I ask the guard a question", "I examine the beggar" — all trigger npcSpawn.
- Animals and creatures (dogs, horses, cats, rats etc.) that the player approaches or interacts with individually ALSO trigger npcSpawn with type:'creature' indicated in the role/emoji. Give them a name and brief personality."""

new_spawn = """NPC SPAWN RULES:
- MANDATORY: npcSpawn MUST be set whenever the player directs attention at a SPECIFIC individual. This includes ANY of: talking to, approaching, examining, greeting, or interacting with a named or described person or animal. If the player says "I approach X", "I talk to X", "I speak to X", "I ask X" — npcSpawn is REQUIRED. Never just narrate the interaction without spawning.
- Animals and creatures (dogs, horses, cats, rats, birds etc.) that the player approaches or interacts with individually ALSO require npcSpawn with type:'creature' in the role. Give them a name and brief personality."""

if old_spawn in f:
    f = f.replace(old_spawn, new_spawn)
    print("Fix 1: npcSpawn rules strengthened")
else:
    print("Fix 1: NOT FOUND")

# Fix 2: Guard force_move rules
old_guard = "GUARD BEHAVIOUR: block on approach → unblock if convinced → combat if attacked OR if player tries to flee/push past → force_move (hostile=true) if arresting."
new_guard = "GUARD BEHAVIOUR: block on approach → unblock if convinced → combat if attacked OR if player tries to flee/push past → force_move (hostile=true) ONLY after combat is resolved or player is subdued/unconscious. NEVER use force_move immediately — always give the player a chance to talk, bribe, or fight first."

if old_guard in f:
    f = f.replace(old_guard, new_guard)
    print("Fix 2: Guard force_move fixed")
else:
    print("Fix 2: NOT FOUND")

open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'w', encoding='utf-8').write(f)
print("Done.")
