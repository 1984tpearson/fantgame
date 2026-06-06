import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('map-editor.html', encoding='utf-8') as f:
    content = f.read()
script_start = content.find('\n<script>\n')
script_end = content.rfind('</script>')
js = content[script_start:script_end]
hits = list(re.finditer(r'</script', js, re.IGNORECASE))
print(f'Closing script tags in JS: {len(hits)}')
last5 = content.split('\n')[-5:]
for l in last5: print(repr(l))
