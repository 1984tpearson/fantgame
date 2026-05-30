path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the NPC_TEMPLATES block
start = content.find('const NPC_TEMPLATES={')
end = content.find('\nconst FACTIONS=', start)
block = content[start:end]

# Fix ALL unescaped apostrophes in single-quoted string values
# Strategy: go char by char through the block, track if we're inside a single-quoted string
result = []
i = 0
in_string = False
while i < len(block):
    ch = block[i]
    if ch == '\\' and i+1 < len(block):
        # Already escaped - keep both chars
        result.append(ch)
        result.append(block[i+1])
        i += 2
        continue
    if ch == "'" and in_string:
        # Check if this is actually closing the string or a mid-string apostrophe
        # Look ahead: if next non-space char is : , } ) ] then it's closing
        j = i + 1
        while j < len(block) and block[j] == ' ':
            j += 1
        next_ch = block[j] if j < len(block) else ''
        if next_ch in ':,})\];\n':
            # Closing quote
            in_string = False
            result.append(ch)
        else:
            # Mid-string apostrophe - escape it
            result.append("\\'")
    elif ch == "'" and not in_string:
        in_string = True
        result.append(ch)
    else:
        result.append(ch)
    i += 1

fixed_block = ''.join(result)
content = content[:start] + fixed_block + content[end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# Verify no unescaped apostrophes remain in personality strings
import re
problems = re.findall(r"personality:'[^']*(?<!\\)'[^':,}\])\n]", content)
if problems:
    print(f"WARNING: {len(problems)} possible remaining issues")
    for p in problems[:3]: print(' ', p[:80])
else:
    print("All apostrophes appear clean")
print("Done")
