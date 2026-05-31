import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8').read()

# Add npcSpawn reminder to user message when approach/talk keywords detected
old_handle = """  addMessage(text, 'player');
  const messages = [...state.history, { role:'user', content: text }];
  const { location, situation, notice, imageSubject, meta } = await callAI(messages, true);"""

new_handle = """  addMessage(text, 'player');
  // If player is approaching/talking to someone not yet spawned, remind AI to spawn
  const _spawnHint = /\\b(approach|talk to|speak to|ask|greet|address|go to|walk up to|look at|examine|pet|stroke|touch)\\b/i.test(text)
    ? '\\n[REMINDER: If the player is interacting with a specific individual not already in the NPC list, you MUST set npcSpawn in the JSON. This is mandatory.]'
    : '';
  const messages = [...state.history, { role:'user', content: text + _spawnHint }];
  const { location, situation, notice, imageSubject, meta } = await callAI(messages, true);"""

if old_handle in f:
    f = f.replace(old_handle, new_handle)
    open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'w', encoding='utf-8').write(f)
    print('Done.')
else:
    print('NOT FOUND')
