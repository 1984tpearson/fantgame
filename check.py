import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8').read()

# List of animal keywords to detect
old_greeting_start = """async function generateNpcGreeting(npcId, forcedOpen = false) {
  const ns = getNpcState(npcId);
  const firstMeet = !ns.met;
  const memSummary = ns.memory.length ? ns.memory.slice(-3).join('; ') : 'no prior history';
  // Mark as met immediately so repeat visits are handled correctly
  ns.met = true;
  saveState();
  addNpcTyping();
  try {
    const res = await fetch(CONFIG.AI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        model: CONFIG.TEXT_MODEL,
        max_tokens: 150,
        messages: [
          { role:'system', content: buildNpcSystemPrompt(npcId) },
          { role:'user', content: firstMeet
            ? `You are meeting this player for the FIRST TIME. You have NEVER seen them before. Do NOT act like you know them. Greet them as a complete stranger — cold, neutral, suspicious, or friendly depending on your role and disposition. 1-2 sentences.${forcedOpen ? ' You have stopped them and initiated this conversation.' : ''}`
            : `The player approaches again. Your memory of them: ${memSummary}. Acknowledge based on that history. 1-2 sentences.${forcedOpen ? ' You have stopped them and initiated this conversation.' : ''}`
          }
        ]
      })
    });"""

new_greeting_start = """async function generateNpcGreeting(npcId, forcedOpen = false) {
  const ns = getNpcState(npcId);
  const firstMeet = !ns.met;
  const memSummary = ns.memory.length ? ns.memory.slice(-3).join('; ') : 'no prior history';
  ns.met = true;
  saveState();

  // Animals and creatures don't talk — describe behaviour instead
  const tmpl = NPC_TEMPLATES[npcId];
  const isAnimal = tmpl && /dog|cat|rat|horse|bird|wolf|fox|rabbit|pig|cow|sheep|goat|hen|chicken|crow|raven|snake|fish|bear|deer|boar|creature|beast|animal/i.test(tmpl.role + ' ' + tmpl.name);
  if (isAnimal) {
    const animalPrompt = firstMeet
      ? `Describe in 1 sentence how a ${tmpl.role || 'animal'} called ${tmpl.name} reacts to a stranger approaching. Purely behavioural — no speech. e.g. "It eyes you warily, tail low, then sniffs the air in your direction."`
      : `Describe in 1 sentence how ${tmpl.name} the ${tmpl.role || 'animal'} reacts to someone it has met before. Memory: ${memSummary}. Purely behavioural — no speech.`;
    addNpcTyping();
    try {
      const res = await fetch(CONFIG.AI_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': CONFIG.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ model: CONFIG.TEXT_MODEL, max_tokens: 80, messages: [{ role:'user', content: animalPrompt }] })
      });
      const data = await res.json();
      const rawFull3 = data.choices?.[0]?.message?.content || '...';
      const raw = rawFull3.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      removeNpcTyping();
      addNpcConvoLine(raw, 'npc');
      npcSession.history = [{ role:'user', content: animalPrompt }, { role:'assistant', content: raw }];
      ns.lastSeen = state.player.day;
    } catch(e) { removeNpcTyping(); addNpcConvoLine('...', 'npc'); }
    return;
  }

  addNpcTyping();
  try {
    const res = await fetch(CONFIG.AI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        model: CONFIG.TEXT_MODEL,
        max_tokens: 150,
        messages: [
          { role:'system', content: buildNpcSystemPrompt(npcId) },
          { role:'user', content: firstMeet
            ? `You are meeting this player for the FIRST TIME. You have NEVER seen them before. Do NOT act like you know them. Greet them as a complete stranger — cold, neutral, suspicious, or friendly depending on your role and disposition. 1-2 sentences.${forcedOpen ? ' You have stopped them and initiated this conversation.' : ''}`
            : `The player approaches again. Your memory of them: ${memSummary}. Acknowledge based on that history. 1-2 sentences.${forcedOpen ? ' You have stopped them and initiated this conversation.' : ''}`
          }
        ]
      })
    });"""

if old_greeting_start in f:
    f = f.replace(old_greeting_start, new_greeting_start)
    open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'w', encoding='utf-8').write(f)
    print('Done.')
else:
    print('NOT FOUND')
