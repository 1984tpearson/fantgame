import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\mapforge.js', encoding='utf-8') as f:
    txt = f.read()
# Check renderGridToCanvas for alpha handling
idx = txt.find('function renderGridToCanvas')
print(txt[idx:idx+400])
print('---')
# Check how null pixels are handled
idx2 = txt.find('globalCompositeOperation')
if idx2 >= 0:
    print(txt[idx2-50:idx2+100])
else:
    print('No globalCompositeOperation found')
# Check gridToDataURL
idx3 = txt.find('function gridToDataURL')
print(txt[idx3:idx3+200])
