import sys, subprocess
sys.stdout.reconfigure(encoding='utf-8')
result = subprocess.run(['node', '--check', r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js'], capture_output=True, text=True)
print('Return code:', result.returncode)
if result.stderr: print('STDERR:', result.stderr[:300])
else: print('OK - no syntax errors')
