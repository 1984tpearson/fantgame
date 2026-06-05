import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('map-editor.html', encoding='utf-8') as f:
    content = f.read()

old = "document.getElementById('ai-cancel').addEventListener('click', () => {\n  document.getElementById('ai-modal').style.display = 'none';\n});"

new = """document.getElementById('ai-cancel').addEventListener('click', () => {
  document.getElementById('ai-modal').style.display = 'none';
});

document.getElementById('ai-mode').addEventListener('change', e => {
  const isWild = e.target.value === 'wilderness';
  const row = document.getElementById('ai-settlement').closest('div[style*="grid"]') || document.getElementById('ai-settlement').parentElement;
  // Hide settlement row for wilderness
  document.getElementById('ai-settlement-row').style.display = isWild ? 'none' : 'contents';
});"""

content = content.replace(old, new)
with open('map-editor.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done.')
