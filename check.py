import sys
sys.stdout.reconfigure(encoding='utf-8')
path_n = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js'
with open(path_n, encoding='utf-8') as f:
    txt = f.read()
idx = txt.find('stall:{')
old = txt[idx:idx+40].split('\n')[0]
print(repr(old))
new = old.replace("snap:'south'}", "snap:'south',cells:[1,1]}")
txt = txt.replace(old, new, 1)
with open(path_n, 'w', encoding='utf-8') as f:
    f.write(txt)
print("OK: engine")
