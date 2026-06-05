import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('map-editor.html', encoding='utf-8') as f:
    content = f.read()

# Find the settlement prompt template
start = content.find("} else if (mode === 'settlement') {")
end = content.find("  } else {", start)
block = content[start:end]
print(f'Settlement prompt block: {len(block)} chars')

# Find the objects list
import re
m = re.search(r"const AI_OBJECTS_VALID = \[([^\]]+)\]", content)
if m:
    objs = m.group(1).replace("'","").split(',')
    obj_str = ','.join(o.strip() for o in objs)
    print(f'Objects list expanded: ~{len(obj_str)} chars, {len(objs)} items')
