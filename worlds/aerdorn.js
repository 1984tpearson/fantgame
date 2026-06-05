(function(){
// ═══════════════════════════════════════════════════
// AERDORN — WORLD DATA
// Grid: 500 x 888 squares (scaled down 8x from original)
// SCALE:
//   Overworld:   1 cell = ~280m
//   Settlement:  1 cell = 20m  (14 settlement cells per overworld cell)
//   Interior:    1 cell = 2m   (10 interior cells per settlement cell)
// North=low Y, South=high Y, East=high X, West=low X
//
// IMAGE ALIGNMENT:
//   Map content: pixel (8,38) to (561,1012) = 553x974px
//   px = 8  + gx * (553/500)
//   py = 38 + gy * (974/888)
// ═══════════════════════════════════════════════════

const WORLD_ID   = 'aerdorn';
const WORLD_NAME = 'The Kingdom of Aerdorn';

window.WORLD_MAP_IMAGE     = '';
window.WORLD_MAP_IMG_X0    = 8;
window.WORLD_MAP_IMG_Y0    = 38;
window.WORLD_MAP_IMG_W     = 553;
window.WORLD_MAP_IMG_H     = 974;
window.WORLD_MAP_GRID_W    = 500;
window.WORLD_MAP_GRID_H    = 888;
window.WORLD_MAP_IMG_ALPHA = 0.60;

function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];
    if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi)) inside=!inside;
  }
  return inside;
}

const ISLAND_OUTLINE = [
  [246,118],[275,120],[306,128],[338,138],[362,152],[388,172],[406,190],
  [422,212],[431,238],[434,262],[431,300],[425,338],[419,362],[412,388],
  [406,412],[402,441],[398,462],[388,488],[375,512],[362,531],[350,550],
  [347,562],[338,581],[325,600],[306,619],[288,631],[262,644],[238,662],
  [225,688],[219,712],[219,744],[206,738],[188,725],[169,706],[150,688],
  [138,669],[131,650],[125,631],[119,612],[112,588],[106,562],[100,538],
  [94,512],[88,488],[81,462],[75,438],[69,412],[62,388],[60,362],[61,338],
  [62,312],[65,288],[70,262],[78,238],[88,212],[100,194],[115,175],
  [131,160],[150,148],[175,135],[200,125],[225,120],[246,118],
];
const ISLE_OF_KNOWLEDGE_POLY=[[45,124],[70,124],[75,144],[70,160],[50,162],[40,148],[45,124]];
const ISLE_OF_LORE_POLY=[[394,581],[422,581],[429,603],[422,625],[394,625],[387,603],[394,581]];

const TERRAIN_REGIONS = [
  {poly:[[61,275],[94,200],[113,206],[119,250],[112,288],[106,325],[100,438],[88,450],[70,438],[64,362],[61,275]],type:'peaks',name:'The Sunset Peaks'},
  {poly:[[119,250],[150,225],[188,219],[213,225],[238,238],[244,262],[238,300],[225,338],[213,375],[188,400],[163,412],[138,412],[119,388],[113,350],[113,300],[119,250]],type:'forest',name:'The Verdant Heart'},
  {x1:119,y1:238,x2:169,y2:312,type:'plains',name:'Aethel Plains'},
  {poly:[[288,150],[362,162],[400,200],[419,238],[412,288],[400,325],[388,362],[362,388],[338,400],[312,388],[300,362],[294,325],[288,288],[281,250],[275,212],[288,150]],type:'wilds',name:'The Eldritch Wilds'},
  {poly:[[213,412],[250,400],[288,412],[312,438],[325,462],[325,500],[312,525],[288,538],[250,538],[225,525],[200,500],[194,462],[200,438],[213,412]],type:'bog',name:'The Great Bog'},
  {poly:[[325,438],[362,425],[388,438],[400,462],[400,500],[388,525],[362,550],[338,562],[325,538],[325,500],[325,462],[325,438]],type:'fens',name:'The Shadow Fens'},
  {poly:[[138,600],[188,588],[225,588],[250,600],[262,625],[262,650],[250,675],[225,700],[200,700],[175,688],[150,662],[131,638],[125,619],[138,600]],type:'shore',name:'The Azure Shore'},
  {poly:[[238,262],[262,250],[275,275],[269,312],[256,350],[250,388],[247,425],[246,500],[244,575],[238,550],[231,512],[231,475],[234,438],[235,400],[234,325],[231,288],[238,262]],type:'mountain',name:"The Wyvern's Spine"},
  {x1:213,y1:118,x2:312,y2:225,type:'plains',name:'Northern Plains'},
  {x1:163,y1:575,x2:250,y2:625,type:'farmland',name:'Southern Farmlands'},
];

const _ic=new Map();
function isOnIsland(x,y){const k=`${x},${y}`;if(_ic.has(k))return _ic.get(k);const r=pointInPoly(x,y,ISLAND_OUTLINE)||pointInPoly(x,y,ISLE_OF_KNOWLEDGE_POLY)||pointInPoly(x,y,ISLE_OF_LORE_POLY);_ic.set(k,r);return r;}

function inferTerrain(x,y){
  if(!isOnIsland(x,y))return{type:'ocean',name:''};
  if(pointInPoly(x,y,ISLE_OF_KNOWLEDGE_POLY))return{type:'forest',name:'Isle of Knowledge'};
  if(pointInPoly(x,y,ISLE_OF_LORE_POLY))return{type:'forest',name:'Isle of Lore'};
  for(const r of TERRAIN_REGIONS){
    const hit=r.poly?pointInPoly(x,y,r.poly):(x>=r.x1&&x<=r.x2&&y>=r.y1&&y<=r.y2);
    if(hit)return{type:r.type,name:r.name};
  }
  return{type:'plains',name:''};
}

// Overworld cells are loaded from worlds/overworld.js before this file.
const WORLD_META = window.WORLD_META || {};

// Settlements are loaded from worlds/settlements/*/map.js before this file.
// Interiors are loaded from worlds/settlements/*/interiors/*.js
const SETTLEMENTS = window.SETTLEMENTS || {};

const OVERWORLD_TO_SETTLEMENT={};
(function(){
  // Map every footprint cell to its settlement id
  const fp=[
    ['aethel_keep',  136,258,142,266],
    ['weavers_deep', 258,145,262,151],
    ['high_crown',   251,393,255,399],
    ['gladehome',    310,208,312,212],
    ['sylvanis_root',337,412,339,416],
    ['briar_town',   400,439,401,440],
    ['frilar_town',  346,556,347,557],
    ['harvestfell',  188,642,192,646],
    ['theatfields',  249,543,251,545],
    ['dunesedge',    165,415,167,417],
    ['saltwell',     138,461,140,463],
    ['wheatstone',   168,288,170,290],
  ];
  for(const[id,x1,y1,x2,y2]of fp)
    for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)
      OVERWORLD_TO_SETTLEMENT[`${x},${y}`]=id;
})();

const NPC_TEMPLATES={
  'innkeeper_aethel':{id:'innkeeper_aethel',name:'Dara Fenn',role:'Innkeeper, The Aethel Arms',faction:'aethel_citizens',emoji:'🏠',race:'human',age:48,gender:'female',appearance:'stocky broad-shouldered woman, iron-grey hair pulled back tight, ruddy wind-burned face, thick forearms, apron stained with ale',traits:['blunt','sharp-eyed','no-nonsense'],personality:`Sturdy northern woman. Blunt but fair. Knows every face that passes through. Keeps secrets for coin.`,schedule:[{timeStart:6,timeEnd:24,layer:'interior',settlementId:'aethel_keep',posKey:'aethel_inn'}],trader:{stock:[{name:'Bed for the Night',basePriceCp:60,stock:99},{name:'Hot Stew',basePriceCp:10,stock:99},{name:'Aethel Ale',basePriceCp:5,stock:99},{name:'Healing Salve',basePriceCp:90,stock:3},{name:'Trail Rations (3 days)',basePriceCp:35,stock:5}],buyRate:0.3,sellMarkup:1.4}},
  'gate_captain_aethel':{id:'gate_captain_aethel',name:'Cort Vane',role:'Gate Captain, South Gate',faction:'aethel_guard',emoji:'⚔',race:'human',age:51,gender:'male',appearance:'tall lean man, close-cropped silver hair, square jaw, deep-set eyes, old scar running jaw to left ear, worn but well-kept guard armour',traits:['guarded','disciplined','weathered'],personality:`Veteran soldier. Seen too much. Trusts no one from the east. Fair to honest travellers. Rigid about the law.`,schedule:[{timeStart:6,timeEnd:20,layer:'settlement',settlementId:'aethel_keep',posKey:'0,2'},{timeStart:20,timeEnd:6,layer:'interior',settlementId:'aethel_keep',posKey:'aethel_barracks'}]},
  'archivist_ruins':{id:'archivist_ruins',name:'Mael the Pale',role:'Wandering Scholar',faction:'scholars',emoji:'📜',race:'human',age:63,gender:'male',appearance:'gaunt hollow-cheeked man, waxy pale skin, lank white hair to shoulders, ink-stained fingers, hunched posture, patched grey robes, eyes too bright for a sane man',traits:['obsessive','muttering','unsettling'],personality:`Obsessive. Mutters to himself. Knows things about the Old Kingdom that should be forgotten. Not dangerous. Probably.`,schedule:[{timeStart:0,timeEnd:24,layer:'overworld',posKey:'275,254'}]},
  'innkeeper_harvestfell':{id:'innkeeper_harvestfell',name:'Tomas Brent',role:'Innkeeper, The Golden Sheaf',faction:'harvestfell_citizens',emoji:'🌾',race:'human',age:41,gender:'male',appearance:'round-faced man with a warm smile, thinning sandy hair, slight paunch, sun-browned skin, perpetually flour-dusted apron, calloused hands',traits:['cheerful','optimistic','devout'],personality:`Cheerful. Optimistic despite hard times. Deeply religious.`,schedule:[{timeStart:7,timeEnd:23,layer:'interior',settlementId:'harvestfell',posKey:'harvestfell_inn'}],trader:{stock:[{name:'Bed for the Night',basePriceCp:40,stock:99},{name:'Fish Stew',basePriceCp:8,stock:99},{name:'Southern Rum',basePriceCp:6,stock:99},{name:'Salt (pouch)',basePriceCp:20,stock:5}],buyRate:0.25,sellMarkup:1.3}},
  // ── EAST-PORT NPCs ──────────────────────────────────────────────────────

  // Harbormaster
  'ep_harbormaster':{id:'ep_harbormaster',name:'Aldric Crane',role:'Harbormaster, East-Port',faction:'eastport_guard',emoji:'⚓',
    race:'human', age:52, gender:'male', appearance:'lean grey-bearded man, deep-set watchful eyes, neat dark coat with brass buttons, ink-stained cuffs, thin-lipped mouth', traits:['weathered','precise','quietly corrupt'],
    personality:`Weathered man in his 50s. Precise and formal. Keeps meticulous records. Quietly corrupt — takes a cut from incoming cargo but never skims enough to draw attention. Respects competence.`,
    schedule:[{timeStart:7,timeEnd:19,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:10,14'},{timeStart:19,timeEnd:7,layer:'settlement',settlementId:'frilar_town',posKey:'10,14'}],
    relationships:{spouse:null,friends:['ep_guard_rona'],rivals:['ep_smuggler']}},

  // Salt & Sail Innkeeper
  'ep_innkeeper':{id:'ep_innkeeper',name:'Bess Oldwater',role:'Innkeeper, The Salt & Sail',faction:'eastport_citizens',emoji:'🍺',
    race:'human', age:44, gender:'female', appearance:'plump rosy-cheeked woman, curly auburn hair going grey at the temples, warm brown eyes, sturdy build, always in a food-stained apron', traits:['warm','sharp-eared','perceptive'],
    personality:`Round-faced woman, always warm, always listening. Knows every rumour in town before the person it concerns does. Charges fair but remembers debts. Widow — her husband drowned three winters ago.`,
    schedule:[{timeStart:6,timeEnd:24,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-5,12'}],
    relationships:{spouse:null,friends:['ep_priest'],rivals:[]},
    trader:{stock:[{name:'Bed for the Night',basePriceCp:50,stock:99},{name:'Salt Fish Stew',basePriceCp:8,stock:99},{name:'Harbour Ale',basePriceCp:4,stock:99},{name:'Salted Biscuit',basePriceCp:2,stock:99},{name:'Healing Salve',basePriceCp:80,stock:2},{name:'Trail Rations (3 days)',basePriceCp:30,stock:4}],buyRate:0.25,sellMarkup:1.35}},

  // Blacksmith
  'ep_blacksmith':{id:'ep_blacksmith',name:'Tor Ashfen',role:'Blacksmith, East-Port',faction:'eastport_citizens',emoji:'🔨',
    race:'human', age:38, gender:'male', appearance:'barrel-chested man with massive arms, shaved head, heavy brow, burn scars across both forearms, missing two fingers on left hand, perpetually soot-stained leather apron', traits:['enormous','taciturn','scarred'],
    personality:`Enormous man. Barely speaks. When he does, it matters. Lost two fingers on his left hand to a forge accident years ago and is oddly cheerful about it. Married to Mira.`,
    schedule:[{timeStart:6,timeEnd:18,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:6,11'},{timeStart:18,timeEnd:6,layer:'settlement',settlementId:'frilar_town',posKey:'-9,7'}],
    relationships:{spouse:'ep_mira',friends:[],rivals:[]},
    trader:{stock:[{name:'Iron Knife',basePriceCp:120,stock:2},{name:'Hatchet',basePriceCp:200,stock:1},{name:'Iron-Tipped Spear',basePriceCp:380,stock:1},{name:'Leather Armour',basePriceCp:450,stock:1},{name:'Iron Shield',basePriceCp:300,stock:1},{name:'Horseshoe Nail (bundle)',basePriceCp:15,stock:8},{name:'Rope (10m)',basePriceCp:25,stock:3}],buyRate:0.35,sellMarkup:1.3}},

  // Blacksmith's wife — domestic, residential SW
  'ep_mira':{id:'ep_mira',name:'Mira Ashfen',role:'Resident, East-Port',faction:'eastport_citizens',emoji:'👩',
    race:'human', age:35, gender:'female', appearance:'slight wiry woman, dark hair in a practical braid, sharp cheekbones, quick brown eyes, always flour or soil on her hands, plain homespun dress', traits:['sharp-tongued','capable','worried'],
    personality:`Sharp-tongued but generous. Runs the household accounts with an iron grip. Keeps a kitchen garden and gives surplus vegetables to the chapel. Quietly worries about Tor's health.`,
    schedule:[{timeStart:8,timeEnd:20,layer:'settlement',settlementId:'frilar_town',posKey:'-9,7'},{timeStart:20,timeEnd:8,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-9,7'}],
    relationships:{spouse:'ep_blacksmith',friends:['ep_priest'],rivals:[]}},

  // Watch guard — patrols streets
  'ep_guard_rona':{id:'ep_guard_rona',name:'Rona Stebbe',role:'Town Watch, East-Port',faction:'eastport_guard',emoji:'🛡',
    race:'human', age:24, gender:'female', appearance:'young lean woman, dark cropped hair, sharp jaw, watchful grey eyes, ill-fitting town watch tabard over leather armour, hand never far from her short sword', traits:['ambitious','suspicious','sharp-eyed'],
    personality:`Young woman. Ambitious. Suspicious of strangers but not hostile — yet. Knows something is wrong with the cargo manifests but hasn't worked out who. Admires the harbormaster without realising he's part of the problem.`,
    schedule:[{timeStart:6,timeEnd:20,layer:'settlement',settlementId:'frilar_town',posKey:'0,14'},{timeStart:20,timeEnd:6,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-6,3'}],
    relationships:{spouse:null,friends:['ep_harbormaster'],rivals:['ep_smuggler']}},

  // Second guard — older, lazier
  'ep_guard_peck':{id:'ep_guard_peck',name:'Oswin Peck',role:'Town Watch, East-Port',faction:'eastport_guard',emoji:'🛡',
    race:'human', age:48, gender:'male', appearance:'heavyset balding man, florid face, small piggy eyes, gut straining against a too-tight watch tabard, moves slowly and breathes loudly', traits:['lazy','comfortable','deliberately blind'],
    personality:`Fat, slow, and comfortable with it. Has been on the watch for twenty years without incident — largely because he avoids incidents. Knows about the smuggling. Has decided not to know about it.`,
    schedule:[{timeStart:8,timeEnd:16,layer:'settlement',settlementId:'frilar_town',posKey:'0,6'},{timeStart:16,timeEnd:8,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-6,7'}],
    relationships:{spouse:null,friends:[],rivals:[]}},

  // Priest at chapel
  'ep_priest':{id:'ep_priest',name:'Sister Avane',role:'Keeper of the Chapel of the Tides',faction:'eastport_church',emoji:'✝',
    race:'human', age:58, gender:'female', appearance:'small elderly woman, silver hair under a plain grey veil, deep-set kind eyes, hands gnarled with age, simple undyed robes with a tidal-wave symbol stitched at the collar', traits:['calm','unhurried','compassionate'],
    personality:`Calm and unhurried. Speaks slowly, as if choosing every word from a large and careful inventory. Tends the sick. Knows more about people's sins than anyone and judges none of them. Has a soft spot for strays — human or animal.`,
    schedule:[{timeStart:6,timeEnd:22,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-6,10'},{timeStart:22,timeEnd:6,layer:'settlement',settlementId:'frilar_town',posKey:'-6,11'}],
    relationships:{spouse:null,friends:['ep_innkeeper','ep_mira'],rivals:[]}},

  // Smuggler — Fen Runners contact
  'ep_smuggler':{id:'ep_smuggler',name:'Dav Silt',role:'Fisherman (and other things)',faction:'eastport_smugglers',emoji:'🐟',
    race:'human', age:33, gender:'male', appearance:'lean sun-darkened man, lank brown hair, narrow shifty eyes, always smells of salt and something chemical, rough fisherman\'s clothes, habitually touches his left ear',traits:['furtive','quiet','deceptive'],
    personality:`Lean, quiet, smells of brine and something chemical. Officially a fisherman. Actually runs small cargoes through the fens at night for the Fen Runners. Not violent but will disappear if pressed. Has a tell — touches his left ear when lying.`,
    schedule:[{timeStart:7,timeEnd:14,layer:'settlement',settlementId:'frilar_town',posKey:'10,22'},{timeStart:14,timeEnd:19,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:6,19'},{timeStart:19,timeEnd:7,layer:'settlement',settlementId:'frilar_town',posKey:'11,4'}],
    relationships:{spouse:null,friends:[],rivals:['ep_guard_rona']}},

  // Tanner
  'ep_tanner':{id:'ep_tanner',name:'Wulf Grent',role:'Tanner, East-Port',faction:'eastport_citizens',emoji:'🪣',
    race:'human', age:45, gender:'male', appearance:'stocky man with permanently stained brown hands and forearms, patchy beard, cheerful ruddy face, leather apron that has seen better decades, perpetually strong smell',traits:['talkative','cheerful','oblivious'],
    personality:`Permanently stained, permanently cheerful. Talks constantly about the merits of different hides. Has opinions about everything and shares them freely. His wife left years ago and he still doesn't understand why.`,
    schedule:[{timeStart:6,timeEnd:17,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:6,7'},{timeStart:17,timeEnd:6,layer:'settlement',settlementId:'frilar_town',posKey:'6,8'}],
    relationships:{spouse:null,friends:['ep_blacksmith'],rivals:[]}},

  // Merchant at market hall
  'ep_merchant':{id:'ep_merchant',name:'Serafin Holdt',role:'Merchant, Market Hall',faction:'eastport_citizens',emoji:'💰',
    race:'human', age:37, gender:'male', appearance:'slick dark hair oiled back, ink-stained fingers, thin neat moustache, fine but slightly worn coat a size too large, always clutching a ledger', traits:['slick','anxious','status-conscious'],
    personality:`Slick hair, ink-stained fingers. Trades in cloth, spices, and information. Deeply invested in appearing richer than he is. Owes money to someone in Aethel-Keep and is quietly desperate about it.`,
    schedule:[{timeStart:8,timeEnd:18,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-5,16'},{timeStart:18,timeEnd:8,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-13,46'}],
    relationships:{spouse:null,friends:[],rivals:['ep_harbormaster']},
    trader:{stock:[{name:'Bolt of Cloth',basePriceCp:180,stock:3},{name:'Pepper (small pouch)',basePriceCp:60,stock:4},{name:'Candles (bundle of 6)',basePriceCp:20,stock:5},{name:'Ink & Quill',basePriceCp:35,stock:2},{name:'Rope (10m)',basePriceCp:22,stock:3},{name:'Lantern',basePriceCp:80,stock:2}],buyRate:0.3,sellMarkup:1.4}},

  // Beggar — no fixed home
  'ep_beggar':{id:'ep_beggar',name:'Old Fetch',role:'Beggar',faction:'eastport_citizens',emoji:'🧤',
    race:'human', age:72, gender:'male', appearance:'ancient hunched man, wild white beard, milky left eye, layered rags of indeterminate colour, gnarled walking stick, surprisingly sharp right eye', traits:['ancient','rambling','unexpectedly perceptive'],
    personality:`Ancient. Possibly mad. Calls everyone "captain." Has lived in East-Port longer than anyone can remember and knows things about the town's history that no one else does — but getting a straight answer out of him requires patience and food.`,
    schedule:[{timeStart:0,timeEnd:24,layer:'settlement',settlementId:'frilar_town',posKey:'-3,14'}],
    relationships:{spouse:null,friends:['ep_priest'],rivals:[]}},

  // Fisher wife — residential
  'ep_fishwife':{id:'ep_fishwife',name:'Nance Cord',role:"Resident, Fishermen's Quarter",faction:'eastport_citizens',emoji:'👩',
    race:'human', age:31, gender:'female', appearance:'weather-beaten young woman, sun-bleached brown hair tied back, strong forearms from net work, sharp no-nonsense face, always has salt-smell and fish scales on her clothes', traits:['practical','dry-witted','unimpressed'],
    personality:`Practical, weather-beaten, completely unimpressed by anything. Repairs nets, salts fish, raises three children largely alone while her husband is at sea. Has a dry wit that catches people off guard.`,
    schedule:[{timeStart:7,timeEnd:19,layer:'settlement',settlementId:'frilar_town',posKey:'7,19'},{timeStart:19,timeEnd:7,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:7,19'}],
    relationships:{spouse:'ep_fisher',friends:[],rivals:[]}},

  // Fisher — out at sea during day, home at night
  'ep_fisher':{id:'ep_fisher',name:'Cole Cord',role:'Fisherman, East-Port',faction:'eastport_citizens',emoji:'🎣',
    race:'human', age:34, gender:'male', appearance:'lean sun-darkened man, deep tan, squinting eyes from years on water, rough calloused hands, simple fisherman clothes perpetually damp, quiet measured movements', traits:['quiet','stoic','sea-wise'],
    personality:`Sun-dark, quiet. At sea more than he's home. Loves his wife deeply and is bad at showing it. Knows the coastal waters better than anyone. Has seen things in the fens at night that he doesn't talk about.`,
    schedule:[{timeStart:4,timeEnd:15,layer:'settlement',settlementId:'frilar_town',posKey:'11,4'},{timeStart:15,timeEnd:22,layer:'settlement',settlementId:'frilar_town',posKey:'7,19'},{timeStart:22,timeEnd:4,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:7,19'}],
    relationships:{spouse:'ep_fishwife',friends:[],rivals:[]}},

  // Carpenter
  'ep_carpenter':{id:'ep_carpenter',name:'Jenn Platt',role:'Carpenter, East-Port',faction:'eastport_citizens',emoji:'🪚',
    race:'human', age:39, gender:'female', appearance:'tall angular woman, sawdust perpetually in her short dark hair, strong capable hands with old cut scars, no-nonsense plain work clothes, measuring tape at her belt', traits:['methodical','proud','unhurried'],
    personality:`Methodical woman. Always has sawdust in her hair. Extraordinarily good at her craft and knows it. Does not like being rushed. Has a long-running disagreement with the tanner about whose work smell worse.`,
    schedule:[{timeStart:6,timeEnd:17,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:9,7'},{timeStart:17,timeEnd:6,layer:'settlement',settlementId:'frilar_town',posKey:'9,8'}],
    relationships:{spouse:null,friends:[],rivals:['ep_tanner']}},

  // 'hunter_sylvanis' continues below...
  'hunter_sylvanis':{id:'hunter_sylvanis',name:'Bryn of the Root',role:"Hunter, Hunters' Hall",faction:'sylvanis_citizens',emoji:'🏹',race:'human',age:29,gender:'male',appearance:'wiry compact man, dark skin, close-cropped hair, sharp amber eyes, rough forest-green hunting clothes, quiver always on his back, moves with animal quiet',traits:['quiet','watchful','distrustful of outsiders'],personality:`Quiet and watchful. Short precise sentences. Suspicious of city folk. Respects those who know the wild.`,schedule:[{timeStart:8,timeEnd:18,layer:'interior',settlementId:'sylvanis_root',posKey:'sylvanis_hunters'}],trader:{stock:[{name:"Hunter's Shortbow",basePriceCp:450,stock:1},{name:'Arrow Bundle (24)',basePriceCp:36,stock:8},{name:'Skinning Knife',basePriceCp:120,stock:2},{name:'Dried Venison (3 days)',basePriceCp:28,stock:4},{name:'Wilds Salve',basePriceCp:70,stock:2}],buyRate:0.4,sellMarkup:1.2}},
};

const FACTIONS={
  aethel_guard:{name:'Aethel City Guard',color:'#7a9abf',rivals:['shadow_compact'],allies:['royal_court']},
  aethel_citizens:{name:'Aethel Folk',color:'#a0c878',rivals:[],allies:[]},
  royal_court:{name:'Royal Court',color:'#c9943a',rivals:['old_blood'],allies:['aethel_guard']},
  old_blood:{name:'Old Blood (nobles)',color:'#9a70c0',rivals:['royal_court'],allies:[]},
  shadow_compact:{name:'Shadow Compact',color:'#606080',rivals:['aethel_guard'],allies:[]},
  scholars:{name:'The Scholars',color:'#a0b8c8',rivals:[],allies:[]},
  sylvanis_citizens:{name:'Sylvanis Folk',color:'#70b870',rivals:[],allies:[]},
  harvestfell_citizens:{name:'Harvestfell Folk',color:'#c8b060',rivals:[],allies:[]},
  briar_citizens:{name:'Briar-Town Folk',color:'#b09060',rivals:[],allies:[]},
  weavers_citizens:{name:"Weaver's Deep Folk",color:'#70a0b8',rivals:[],allies:[]},
  eastport_citizens:{name:'East-Port Folk',color:'#8ab0a0',rivals:[],allies:['eastport_guard']},
  eastport_guard:{name:'East-Port Watch',color:'#6080a0',rivals:['eastport_smugglers'],allies:['eastport_citizens']},
  eastport_smugglers:{name:'Fen Runners',color:'#507060',rivals:['eastport_guard'],allies:[]},
  eastport_church:{name:'Church of the Tides',color:'#a0a0c8',rivals:[],allies:['eastport_citizens']},
};

window.WORLD_DATA={
  id:WORLD_ID,name:WORLD_NAME,
  meta:WORLD_META,
  inferTerrain,
  settlements:SETTLEMENTS,
  overworldToSettlement:OVERWORLD_TO_SETTLEMENT,
  npcTemplates:NPC_TEMPLATES,
  factions:FACTIONS,
};
})();
