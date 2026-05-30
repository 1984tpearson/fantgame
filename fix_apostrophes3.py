path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# First undo the damage from the previous script - restore \'ep_ back to 'ep_
content = re.sub(r"\\'(ep_)", r"'\1", content)

# Also fix any other incorrectly escaped object keys (starting with \' at line start)
content = re.sub(r"  \\'([a-z])", r"  '\1", content)

# Now convert ALL personality:'...' to personality:`...` (backtick)
# This handles apostrophes naturally
def to_backtick(m):
    inner = m.group(1)
    # Unescape any previously escaped apostrophes since backticks don't need escaping
    inner = inner.replace("\\'", "'")
    # Escape any backticks in the inner string (unlikely but safe)
    inner = inner.replace('`', '\\`')
    return f'personality:`{inner}`'

content = re.sub(r"personality:'((?:[^'\\]|\\.)*)'", to_backtick, content)

# Verify no syntax issues - check NPC keys are correct
keys = re.findall(r"'(ep_[a-z_]+)':", content)
print(f"NPC keys found: {keys}")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
