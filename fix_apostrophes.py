path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# All the apostrophes in NPC personality strings that break JS single-quoted strings
fixes = [
    ("Quietly worries about Tor's health.", "Quietly worries about Tor\\'s health."),
    ("hasn't worked out who.", "hasn\\'t worked out who."),
    ("doesn't know about it.", "doesn\\'t know about it."),
    ("doesn't understand why.", "doesn\\'t understand why."),
    ("people's sins", "people\\'s sins"),
    ("everyone's sins", "everyone\\'s sins"),
    ("Fisherman's Quarter", "Fisherman\\'s Quarter"),
    ("husband's health", "husband\\'s health"),
    ("town's history", "town\\'s history"),
    ("Cole's", "Cole\\'s"),
    ("Tor's", "Tor\\'s"),
]

for old, new in fixes:
    if old in content:
        content = content.replace(old, new)
        print(f"Fixed: {old[:40]}")

# Also do a broader scan for unescaped apostrophes inside single-quoted personality strings
import re

# Find all personality strings and escape apostrophes within them
def escape_personality(m):
    inner = m.group(1)
    # Escape any unescaped single quotes
    inner = re.sub(r"(?<!\\)'", "\\'", inner)
    return f"personality:'{inner}'"

content = re.sub(r"personality:'((?:[^'\\]|\\.)*)'", escape_personality, content)
print("Broad apostrophe escape done")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
