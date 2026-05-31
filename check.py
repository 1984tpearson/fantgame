f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8').read()
idx = f.find('buildNpcImagePrompt')
print(repr(f[idx:idx+600]))
