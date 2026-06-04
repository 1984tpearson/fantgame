import sys
sys.stdout.reconfigure(encoding='utf-8')
content = open('worlds/settlements/east_port/map.js', encoding='utf-8').read()
for i, line in enumerate(content.split('\n'), 1):
    if 'for(' in line:
        print(f'line {i}: {line}')
