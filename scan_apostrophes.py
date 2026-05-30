path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

problems = []
for i, line in enumerate(lines, 1):
    # Look for single-quoted strings containing unescaped apostrophes
    # Pattern: 's (apostrophe followed by s inside a single-quoted string)
    import re
    # Find single-quoted values with apostrophes: 'word's or similar
    matches = re.findall(r"'[^']*'s\s+[^']*'", line)
    if matches:
        problems.append((i, line.strip()[:100], matches))

if problems:
    print(f"Found {len(problems)} problem lines:")
    for lineno, text, matches in problems:
        print(f"  Line {lineno}: {text}")
else:
    print("No unescaped apostrophe-s patterns found")
