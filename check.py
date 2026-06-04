import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

files = []
for root, dirs, fs in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', 'images', 'suprabase']]
    for f in fs:
        if f.endswith(('.js', '.html', '.ts')):
            files.append(os.path.join(root, f))

for path in sorted(files):
    with open(path, encoding='utf-8', errors='ignore') as f:
        content = f.read()
    if 'courtyard' not in content:
        continue
    new_content = content.replace('courtyard', 'grass')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    count = content.count('courtyard')
    print(f'Replaced {count}x in {path}')

print('Done.')
