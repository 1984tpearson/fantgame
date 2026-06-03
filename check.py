import sys
sys.stdout.reconfigure(encoding='utf-8')
path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\map-editor.html'
with open(path, encoding='utf-8') as f:
    txt = f.read()

idx = txt.find('// Editor-placed building')
print(txt[idx:idx+200])
