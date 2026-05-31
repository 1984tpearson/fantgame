
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'r', encoding='utf-8') as f:
    content = f.read()

old = 'await enterCell(346, 556);'
new = 'await enterCell(346, 558);'

if old in content:
    content = content.replace(old, new)
    with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Done.')
else:
    print('String not found.')
