import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('map-editor.html', encoding='utf-8') as f:
    content = f.read()

script_start = content.find('\n<script>\n')
script_end = content.rfind('</script>')
js = content[script_start:script_end]

for m in re.finditer(r'</script', js, re.IGNORECASE):
    pos = m.start()
    line = js[:pos].count('\n') + 1
    print(f'line {line}: {js[max(0,pos-40):pos+20]!r}')
