import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('map-editor.html', encoding='utf-8') as f:
    lines = f.readlines()
# Check last 5 lines
print('Last 5 lines:')
for i, line in enumerate(lines[-5:], len(lines)-4):
    print(f'  {i}: {repr(line.rstrip())}')
# Check for escaped closing tag anywhere after line 266
for i, line in enumerate(lines[266:], 267):
    if '\\x3c/script>' in line or r'\x3c/script>' in line:
        print(f'ESCAPED CLOSE TAG at line {i}: {line.rstrip()[:80]}')
