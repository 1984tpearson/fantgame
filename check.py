import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8') as f:
    lines = f.readlines()
# Line 1796 - find cell.className
l = lines[1795]
idx = l.find('cell.className')
print(repr(l[idx:idx+100]))
idx2 = l.find('cell=document')
print(repr(l[idx2:idx2+150]))
