f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8').read()

old = "    if (notice.toLowerCase() === 'null' || notice.toLowerCase() === 'none') notice = '';"
new = """    if (notice.toLowerCase() === 'null' || notice.toLowerCase() === 'none') notice = '';
    // Only show notice if it suggests something genuinely interactive or hidden
    const noticeKeywords = /hidden|concealed|abandoned|body|lurk|watch|glimmer|strange|unusual|secret|half-buried|discarded|tucked|crouching|slumped|peering|suspicious|peculiar|buried|crawl|crevice|shadowed|figure/i;
    if (notice && !noticeKeywords.test(notice)) notice = '';"""

if old in f:
    f = f.replace(old, new)
    open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'w', encoding='utf-8').write(f)
    print('Done.')
else:
    print('Not found - looking for actual string...')
    idx = f.find("notice.toLowerCase() === 'null'")
    print(repr(f[idx:idx+200]))
