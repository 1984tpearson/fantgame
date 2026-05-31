import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\index.html', encoding='utf-8').read()
idx = f.find('#dpanel-equip')
print(f[idx:idx+200])
