import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('map-editor.html', encoding='utf-8') as f:
    content = f.read()

fixed = content.replace('\\x3c/script>\n</body>', '</script>\n</body>')

if fixed == content:
    print('ERROR: still not found')
    # Show raw bytes around that area
    idx = content.find('init();\n')
    print(repr(content[idx:idx+40]))
else:
    with open('map-editor.html', 'w', encoding='utf-8') as f:
        f.write(fixed)
    print('Fixed.')
