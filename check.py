import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('map-editor.html', encoding='utf-8') as f:
    content = f.read()

# Find the main <script> block (line 266 onwards)
# We need to escape <script inside JS string literals only
# Strategy: find the main script block, then replace <script within string contexts

# Split at the main script block start
script_start = content.find('\n<script>\n\'use strict\';')
if script_start == -1:
    print('ERROR: could not find script block')
    sys.exit(1)

html_part = content[:script_start]
js_part   = content[script_start:]

# In the JS part, replace <script that appears inside string literals
# These are in template literals like: `<script src="...">`
# Replace with escaped version: \x3cscript
# But only when inside a string (preceded by backtick or quote context)
# Simpler: replace all <script (case insensitive) that are followed by a space or >
# within the JS, EXCEPT the actual opening <script> tag itself

# The actual opening tag is just '<script>\n' at the very start
# Everything else is inside JS strings

lines = js_part.split('\n')
fixed_lines = []
for i, line in enumerate(lines):
    if i == 0:
        # This is the <script> opening tag line — keep as is
        fixed_lines.append(line)
    else:
        # Escape <script inside JS
        fixed = line.replace('<script ', '\\x3cscript ')
        fixed_lines.append(fixed)

js_fixed = '\n'.join(fixed_lines)
new_content = html_part + js_fixed

with open('map-editor.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

# Verify
remaining = len(re.findall(r'<script ', new_content[script_start+10:]))
print(f'Done. Remaining <script in JS body: {remaining}')
