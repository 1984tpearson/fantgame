import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('map-editor.html', encoding='utf-8') as f:
    content = f.read()

# Add ids to the labels that need hiding in proc mode
replacements = [
    ('      <label style="padding-top:2px;">Model</label>\n      <select id="ai-gen-model"',
     '      <label id="ai-gen-model-label" style="padding-top:2px;">Model</label>\n      <select id="ai-gen-model"'),
    ('      <label style="padding-top:2px;">Type / Name</label>',
     '      <label id="ai-type-label" style="padding-top:2px;">Type / Name</label>'),
    ('      <label style="padding-top:2px;">Size</label>',
     '      <label id="ai-size-label" style="padding-top:2px;">Size</label>'),
    ('      <label style="padding-top:2px;">Atmosphere</label>',
     '      <label id="ai-notes-label" style="padding-top:2px;">Atmosphere</label>'),
]

for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        print(f'Replaced: {old[:40]}...')
    else:
        print(f'NOT FOUND: {old[:40]}...')

# Update the mode listener to also hide/show these labels
old_ids = """  ['ai-gen-model','ai-type','ai-size','ai-notes','ai-settlement','ai-settlement-label',
   'ai-custom-size','ai-generate-btn'].forEach(id => {"""

new_ids = """  ['ai-gen-model','ai-gen-model-label','ai-type','ai-type-label','ai-size','ai-size-label',
   'ai-notes','ai-notes-label','ai-settlement','ai-settlement-label',
   'ai-custom-size','ai-generate-btn'].forEach(id => {"""

content = content.replace(old_ids, new_ids)

with open('map-editor.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done.')
