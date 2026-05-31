import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\index.html', encoding='utf-8').read()

# Find mobile scene text sizes (outside media query)
idx = f.find('.message.scene')
print(f[idx:idx+200])
idx2 = f.find('.message.situation')
print(f[idx2:idx2+200])
