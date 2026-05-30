path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# ── New factions to add ──────────────────────────────────────────────────────
old_factions = """  briar_citizens:{name:'Briar-Town Folk',color:'#b09060',rivals:[],allies:[]},
  weavers_citizens:{name:"Weaver's Deep Folk",color:'#70a0b8',rivals:[],allies:[]},
};"""

new_factions = """  briar_citizens:{name:'Briar-Town Folk',color:'#b09060',rivals:[],allies:[]},
  weavers_citizens:{name:"Weaver's Deep Folk",color:'#70a0b8',rivals:[],allies:[]},
  eastport_citizens:{name:'East-Port Folk',color:'#8ab0a0',rivals:[],allies:['eastport_guard']},
  eastport_guard:{name:'East-Port Watch',color:'#6080a0',rivals:['eastport_smugglers'],allies:['eastport_citizens']},
  eastport_smugglers:{name:'Fen Runners',color:'#507060',rivals:['eastport_guard'],allies:[]},
  eastport_church:{name:'Church of the Tides',color:'#a0a0c8',rivals:[],allies:['eastport_citizens']},
};"""

assert old_factions in content, "MISSING: factions block"
content = content.replace(old_factions, new_factions, 1)

# ── New NPCs to add ──────────────────────────────────────────────────────────
old_npcs = "  'hunter_sylvanis':{id:'hunter_sylvanis',"
new_npcs = """  // ── EAST-PORT NPCs ──────────────────────────────────────────────────────

  // Harbormaster
  'ep_harbormaster':{id:'ep_harbormaster',name:'Aldric Crane',role:'Harbormaster, East-Port',faction:'eastport_guard',emoji:'⚓',
    personality:'Weathered man in his 50s. Precise and formal. Keeps meticulous records. Quietly corrupt — takes a cut from incoming cargo but never skims enough to draw attention. Respects competence.',
    schedule:[{timeStart:7,timeEnd:19,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:10,14'},{timeStart:19,timeEnd:7,layer:'settlement',settlementId:'frilar_town',posKey:'10,14'}],
    relationships:{spouse:null,friends:['ep_guard_rona'],rivals:['ep_smuggler']}},

  // Salt & Sail Innkeeper
  'ep_innkeeper':{id:'ep_innkeeper',name:'Bess Oldwater',role:'Innkeeper, The Salt & Sail',faction:'eastport_citizens',emoji:'🍺',
    personality:'Round-faced woman, always warm, always listening. Knows every rumour in town before the person it concerns does. Charges fair but remembers debts. Widow — her husband drowned three winters ago.',
    schedule:[{timeStart:6,timeEnd:24,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-5,12'}],
    relationships:{spouse:null,friends:['ep_priest'],rivals:[]},
    trader:{stock:[{name:'Bed for the Night',basePriceCp:50,stock:99},{name:'Salt Fish Stew',basePriceCp:8,stock:99},{name:'Harbour Ale',basePriceCp:4,stock:99},{name:'Salted Biscuit',basePriceCp:2,stock:99},{name:'Healing Salve',basePriceCp:80,stock:2},{name:'Trail Rations (3 days)',basePriceCp:30,stock:4}],buyRate:0.25,sellMarkup:1.35}},

  // Blacksmith
  'ep_blacksmith':{id:'ep_blacksmith',name:'Tor Ashfen',role:'Blacksmith, East-Port',faction:'eastport_citizens',emoji:'🔨',
    personality:'Enormous man. Barely speaks. When he does, it matters. Lost two fingers on his left hand to a forge accident years ago and is oddly cheerful about it. Married to Mira.',
    schedule:[{timeStart:6,timeEnd:18,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:6,11'},{timeStart:18,timeEnd:6,layer:'settlement',settlementId:'frilar_town',posKey:'-9,7'}],
    relationships:{spouse:'ep_mira',friends:[],rivals:[]},
    trader:{stock:[{name:'Iron Knife',basePriceCp:120,stock:2},{name:'Hatchet',basePriceCp:200,stock:1},{name:'Iron-Tipped Spear',basePriceCp:380,stock:1},{name:'Leather Armour',basePriceCp:450,stock:1},{name:'Iron Shield',basePriceCp:300,stock:1},{name:'Horseshoe Nail (bundle)',basePriceCp:15,stock:8},{name:'Rope (10m)',basePriceCp:25,stock:3}],buyRate:0.35,sellMarkup:1.3}},

  // Blacksmith's wife — domestic, residential SW
  'ep_mira':{id:'ep_mira',name:'Mira Ashfen',role:'Resident, East-Port',faction:'eastport_citizens',emoji:'👩',
    personality:'Sharp-tongued but generous. Runs the household accounts with an iron grip. Keeps a kitchen garden and gives surplus vegetables to the chapel. Quietly worries about Tor\'s health.',
    schedule:[{timeStart:8,timeEnd:20,layer:'settlement',settlementId:'frilar_town',posKey:'-9,7'},{timeStart:20,timeEnd:8,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-9,7'}],
    relationships:{spouse:'ep_blacksmith',friends:['ep_priest'],rivals:[]}},

  // Watch guard — patrols streets
  'ep_guard_rona':{id:'ep_guard_rona',name:'Rona Stebbe',role:'Town Watch, East-Port',faction:'eastport_guard',emoji:'🛡',
    personality:'Young woman. Ambitious. Suspicious of strangers but not hostile — yet. Knows something is wrong with the cargo manifests but hasn\'t worked out who. Admires the harbormaster without realising he\'s part of the problem.',
    schedule:[{timeStart:6,timeEnd:20,layer:'settlement',settlementId:'frilar_town',posKey:'0,14'},{timeStart:20,timeEnd:6,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-6,3'}],
    relationships:{spouse:null,friends:['ep_harbormaster'],rivals:['ep_smuggler']}},

  // Second guard — older, lazier
  'ep_guard_peck':{id:'ep_guard_peck',name:'Oswin Peck',role:'Town Watch, East-Port',faction:'eastport_guard',emoji:'🛡',
    personality:'Fat, slow, and comfortable with it. Has been on the watch for twenty years without incident — largely because he avoids incidents. Knows about the smuggling. Has decided not to know about it.',
    schedule:[{timeStart:8,timeEnd:16,layer:'settlement',settlementId:'frilar_town',posKey:'0,6'},{timeStart:16,timeEnd:8,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-6,7'}],
    relationships:{spouse:null,friends:[],rivals:[]}},

  // Priest at chapel
  'ep_priest':{id:'ep_priest',name:'Sister Avane',role:'Keeper of the Chapel of the Tides',faction:'eastport_church',emoji:'✝',
    personality:'Calm and unhurried. Speaks slowly, as if choosing every word from a large and careful inventory. Tends the sick. Knows more about people\'s sins than anyone and judges none of them. Has a soft spot for strays — human or animal.',
    schedule:[{timeStart:6,timeEnd:22,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-6,10'},{timeStart:22,timeEnd:6,layer:'settlement',settlementId:'frilar_town',posKey:'-6,11'}],
    relationships:{spouse:null,friends:['ep_innkeeper','ep_mira'],rivals:[]}},

  // Smuggler — Fen Runners contact
  'ep_smuggler':{id:'ep_smuggler',name:'Dav Silt',role:'Fisherman (and other things)',faction:'eastport_smugglers',emoji:'🐟',
    personality:'Lean, quiet, smells of brine and something chemical. Officially a fisherman. Actually runs small cargoes through the fens at night for the Fen Runners. Not violent but will disappear if pressed. Has a tell — touches his left ear when lying.',
    schedule:[{timeStart:7,timeEnd:14,layer:'settlement',settlementId:'frilar_town',posKey:'10,22'},{timeStart:14,timeEnd:19,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:6,19'},{timeStart:19,timeEnd:7,layer:'settlement',settlementId:'frilar_town',posKey:'11,4'}],
    relationships:{spouse:null,friends:[],rivals:['ep_guard_rona']}},

  // Tanner
  'ep_tanner':{id:'ep_tanner',name:'Wulf Grent',role:'Tanner, East-Port',faction:'eastport_citizens',emoji:'🪣',
    personality:'Permanently stained, permanently cheerful. Talks constantly about the merits of different hides. Has opinions about everything and shares them freely. His wife left years ago and he still doesn\'t understand why.',
    schedule:[{timeStart:6,timeEnd:17,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:6,7'},{timeStart:17,timeEnd:6,layer:'settlement',settlementId:'frilar_town',posKey:'6,8'}],
    relationships:{spouse:null,friends:['ep_blacksmith'],rivals:[]}},

  // Merchant at market hall
  'ep_merchant':{id:'ep_merchant',name:'Serafin Holdt',role:'Merchant, Market Hall',faction:'eastport_citizens',emoji:'💰',
    personality:'Slick hair, ink-stained fingers. Trades in cloth, spices, and information. Deeply invested in appearing richer than he is. Owes money to someone in Aethel-Keep and is quietly desperate about it.',
    schedule:[{timeStart:8,timeEnd:18,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-5,16'},{timeStart:18,timeEnd:8,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-13,46'}],
    relationships:{spouse:null,friends:[],rivals:['ep_harbormaster']},
    trader:{stock:[{name:'Bolt of Cloth',basePriceCp:180,stock:3},{name:'Pepper (small pouch)',basePriceCp:60,stock:4},{name:'Candles (bundle of 6)',basePriceCp:20,stock:5},{name:'Ink & Quill',basePriceCp:35,stock:2},{name:'Rope (10m)',basePriceCp:22,stock:3},{name:'Lantern',basePriceCp:80,stock:2}],buyRate:0.3,sellMarkup:1.4}},

  // Beggar — no fixed home
  'ep_beggar':{id:'ep_beggar',name:'Old Fetch',role:'Beggar',faction:'eastport_citizens',emoji:'🧤',
    personality:'Ancient. Possibly mad. Calls everyone "captain." Has lived in East-Port longer than anyone can remember and knows things about the town\'s history that no one else does — but getting a straight answer out of him requires patience and food.',
    schedule:[{timeStart:0,timeEnd:24,layer:'settlement',settlementId:'frilar_town',posKey:'-3,14'}],
    relationships:{spouse:null,friends:['ep_priest'],rivals:[]}},

  // Fisher wife — residential
  'ep_fishwife':{id:'ep_fishwife',name:'Nance Cord',role:'Resident, Fishermen\'s Quarter',faction:'eastport_citizens',emoji:'👩',
    personality:'Practical, weather-beaten, completely unimpressed by anything. Repairs nets, salts fish, raises three children largely alone while her husband is at sea. Has a dry wit that catches people off guard.',
    schedule:[{timeStart:7,timeEnd:19,layer:'settlement',settlementId:'frilar_town',posKey:'7,19'},{timeStart:19,timeEnd:7,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:7,19'}],
    relationships:{spouse:'ep_fisher',friends:[],rivals:[]}},

  // Fisher — out at sea during day, home at night
  'ep_fisher':{id:'ep_fisher',name:'Cole Cord',role:'Fisherman, East-Port',faction:'eastport_citizens',emoji:'🎣',
    personality:'Sun-dark, quiet. At sea more than he\'s home. Loves his wife deeply and is bad at showing it. Knows the coastal waters better than anyone. Has seen things in the fens at night that he doesn\'t talk about.',
    schedule:[{timeStart:4,timeEnd:15,layer:'settlement',settlementId:'frilar_town',posKey:'11,4'},{timeStart:15,timeEnd:22,layer:'settlement',settlementId:'frilar_town',posKey:'7,19'},{timeStart:22,timeEnd:4,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:7,19'}],
    relationships:{spouse:'ep_fishwife',friends:[],rivals:[]}},

  // Carpenter
  'ep_carpenter':{id:'ep_carpenter',name:'Jenn Platt',role:'Carpenter, East-Port',faction:'eastport_citizens',emoji:'🪚',
    personality:'Methodical woman. Always has sawdust in her hair. Extraordinarily good at her craft and knows it. Does not like being rushed. Has a long-running disagreement with the tanner about whose work smell worse.',
    schedule:[{timeStart:6,timeEnd:17,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:9,7'},{timeStart:17,timeEnd:6,layer:'settlement',settlementId:'frilar_town',posKey:'9,8'}],
    relationships:{spouse:null,friends:[],rivals:['ep_tanner']}},

  // 'hunter_sylvanis' continues below...
  'hunter_sylvanis':{id:'hunter_sylvanis',"""

assert old_npcs in content, "MISSING: hunter_sylvanis NPC"
content = content.replace(old_npcs, new_npcs, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
