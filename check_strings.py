path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js'
with open(path,'r',encoding='utf-8') as f: c=f.read()
checks = [
    ("addMessage(`You pass through the gates of ${s.name}.`,'transition');", 'enterSettlement gate'),
    ("else if(state.layer==='settlement')addMessage(`You pass back through the gates of ${SETTLEMENTS[state.settlementId]?.name||'the settlement'}.`,'transition');", 'exitLayer gate'),
    ("if(state.layer==='settlement')addMessage(`You pass back through the gates of ${SETTLEMENTS[state.settlementId]?.name||'the settlement'}.`,'transition');", 'doLayerMove gate'),
    ("async function move(dx, dy) {", 'move fn'),
    ("if(meta.type===T.DOOR||meta.type===T.GATE){ctx.globalAlpha=0.8", 'door canvas render'),
    ("if(revealed&&(meta.type===T.DOOR||meta.type===T.GATE)){const dot=document.createElement", 'minimap door dot'),
    ("if(visited)return`Player returns to", 'buildCellPrompt visited'),
    ("return`First visit to", 'buildCellPrompt first'),
]
for needle, label in checks:
    print(f"{label}: {'FOUND' if needle in c else 'MISSING'}")
