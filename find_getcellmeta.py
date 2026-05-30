with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js','r',encoding='utf-8') as f:
    lines = f.readlines()
for i,l in enumerate(lines,1):
    if 'getCellMeta' in l:
        print(i, l[:120].strip())
