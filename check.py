import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('mapforge.js', encoding='utf-8') as f:
    mf = f.read()
# Find what terrain types mapforge can render
types = re.findall(r"case '([^']+)'", mf)
# Also check for shallow_water specifically
print('shallow_water in mapforge:', 'shallow_water' in mf)
print('makeShallowWater in mapforge:', 'makeShallowWater' in mf or 'shallow' in mf.lower())
# Find the main tile dispatch
for i, line in enumerate(mf.split('\n'), 1):
    if 'shallow' in line.lower():
        print(f'  line {i}: {line.strip()[:100]}')
