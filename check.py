import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8') as f:
    content = f.read()
print('makeWell in engine:', 'makeWell' in content)
print('makeAnvil in engine:', 'makeAnvil' in content)
print('objectHint in engine:', 'objectHint' in content)
print('_getObjectTile lines:')
idx = content.find('function _getObjectTile')
print(content[idx:idx+200])
