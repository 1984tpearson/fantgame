import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('map-editor.html', encoding='utf-8') as f:
    content = f.read()

script_start = content.find('\n<script>\n\'use strict\';')
html_part = content[:script_start]
js_part   = content[script_start:]

lines = js_part.split('\n')
fixed_lines = []
for i, line in enumerate(lines):
    if i == 0:
        fixed_lines.append(line)  # the <script> tag itself
    else:
        fixed = line.replace('<script ', '\\x3cscript ')
        fixed = fixed.replace('</script>', '\\x3c/script>')
        fixed_lines.append(fixed)

js_fixed = '\n'.join(fixed_lines)
new_content = html_part + js_fixed

with open('map-editor.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

# Verify
remaining_open  = len(re.findall(r'<script ', new_content[script_start+10:]))
remaining_close = len(re.findall(r'</script>', new_content[script_start+10:]))
print(f'Done. Remaining <script  in JS: {remaining_open}')
print(f'Done. Remaining </script> in JS: {remaining_close}')
