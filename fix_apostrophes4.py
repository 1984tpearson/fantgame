path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find all \' that appear outside of backtick strings (i.e. in regular JS object keys/values)
# These should NOT be escaped outside of single-quoted strings
# Strategy: find \' followed by a word char (these are broken keys like \'ep_mira or \'sylvanis)
bad = re.findall(r"\\'[a-z]", content)
if bad:
    print(f"Found {len(bad)} bad escaped apostrophes: {bad[:10]}")
    # Fix them
    content = re.sub(r"\\'([a-z])", r"'\1", content)
    print("Fixed")
else:
    print("No bad escaped apostrophes found outside strings")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
