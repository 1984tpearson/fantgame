import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\index.html', encoding='utf-8').read()
print('equipped-list-mobile' in f)
print('mpanel-equip' in f)
idx = f.find('mpanel-equip')
print(f[idx:idx+300])
