import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

base = r'C:/Users/1984t/OneDrive/Documents/GitHub/fantgame/worlds/settlements'

settlements = [
    'east_port', 'aethel_keep', 'weavers_deep', 'high_crown', 'briar_town',
    'gladehome', 'sylvanis_root', 'harvestfell', 'theatfields', 'dunesedge',
    'saltwell', 'wheatstone',
]

def flip_file(content, max_y):
    # ── rect(x1, y1, x2, y2, rest) — must go FIRST before t() ───────────────
    def replace_rect(m):
        x1 = m.group(1); y1 = int(m.group(2))
        x2 = m.group(3); y2 = int(m.group(4))
        rest = m.group(5)
        ny1, ny2 = max_y - y1, max_y - y2
        lo, hi = min(ny1, ny2), max(ny1, ny2)
        return f'rect({x1},{lo},{x2},{hi},{rest}'
    content = re.sub(
        r'rect\(([^,]+),\s*(-?\d+)\s*,([^,]+),\s*(-?\d+)\s*,([^;]+);',
        replace_rect, content)

    # ── sdef(x1, y1, x2, y2, rest) ───────────────────────────────────────────
    def replace_sdef(m):
        x1 = m.group(1); y1 = int(m.group(2))
        x2 = m.group(3); y2 = int(m.group(4))
        rest = m.group(5)
        ny1, ny2 = max_y - y1, max_y - y2
        lo, hi = min(ny1, ny2), max(ny1, ny2)
        return f'sdef({x1},{lo},{x2},{hi},{rest}'
    content = re.sub(
        r'sdef\(([^,]+),\s*(-?\d+)\s*,([^,]+),\s*(-?\d+)\s*,([^;]+);',
        replace_sdef, content)

    # ── t(anything, LITERAL_Y, rest) — use negative lookbehind to exclude rect/sdef ──
    # \bt( ensures we only match standalone t( not rect( or sdef(
    def replace_t(m):
        first = m.group(1)
        new_y = max_y - int(m.group(2))
        rest  = m.group(3)
        return f't({first},{new_y},{rest}'
    content = re.sub(r'\bt\(([^,]+),\s*(-?\d+)\s*,([^;]+);', replace_t, content)

    # ── for(let y=N;y<=M;y++) bounds ─────────────────────────────────────────
    def replace_for_y(m):
        lo, hi = int(m.group(1)), int(m.group(2))
        return f'for(let y={max_y-hi};y<={max_y-lo};y++)'
    content = re.sub(r'for\(let y=(\d+);y<=(\d+);y\+\+\)', replace_for_y, content)

    # ── Settlement-level entryPos only (NOT inside enter:{...} blocks) ────────
    # The settlement record entryPos appears as: entryPos: {x:N, y:M},
    # i.e. followed by a comma or newline+closing brace, not inside enter:{...}
    # Safest: only flip entryPos that appears in the SETTLEMENTS[...] = { ... } block
    # We'll flip ALL entryPos BUT then un-flip the ones inside enter:{...} by not flipping them:
    # Actually simplest: interior entryPos should stay {x:1,y:1} always.
    # The settlement record entryPos is typically {x:0,y:2} or similar small values.
    # Since we wrote them all as {x:1,y:1} for enter and {x:0,y:2} for settlement,
    # just DON'T flip entryPos at all — the settlement entryPos is in settlement coords
    # but the editor doesn't use it for display, and interior entryPos is interior coords.
    # We'll leave entryPos alone entirely.

    return content

for sid in settlements:
    path = os.path.join(base, sid, 'map.js')
    with open(path, encoding='utf-8') as f:
        content = f.read()

    t_ys = [int(m) for m in re.findall(r'\bt\([^,]+,\s*(-?\d+)\s*,', content)]
    for_ys = [int(v) for pair in re.findall(r'for\(let y=(\d+);y<=(\d+);y\+\+\)', content) for v in pair]
    all_ys = t_ys + for_ys
    if not all_ys:
        print(f'{sid}: skipped'); continue
    max_y = max(all_ys)

    new_content = flip_file(content, max_y)

    # Verify rect wasn't mangled — check harbour rect specifically for east_port
    if sid == 'east_port':
        harbour = re.search(r'rect\([^)]+Harbour[^)]+\)', new_content)
        print(f'  east_port harbour check: {harbour.group() if harbour else "NOT FOUND"}')

    sample_b = re.findall(r'\bt\([^,]+,\s*(-?\d+)\s*,', content)[:4]
    sample_a = re.findall(r'\bt\([^,]+,\s*(-?\d+)\s*,', new_content)[:4]
    print(f'{sid}: maxY={max_y}  y before={sample_b}  after={sample_a}')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)

print('\nDone.')
