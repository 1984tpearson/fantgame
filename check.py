import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8') as f:
    txt = f.read()

idx = txt.find('_drawObjSprite(ctx,tile')
print(txt[idx-200:idx+130])
