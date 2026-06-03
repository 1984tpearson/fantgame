import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\mapforge.js', encoding='utf-8') as f:
    txt = f.read()

# Full ROOF_STYLES list
idx = txt.find('ROOF_STYLES')
end = txt.find('];', idx)
print("=== ROOF_STYLES ===")
print(txt[idx:end+2])

print()
# makeRoofByShape signature
idx2 = txt.find('function makeRoofByShape(')
print("=== makeRoofByShape ===")
print(txt[idx2:idx2+200])

print()
# makeThatchRoof signature  
idx3 = txt.find('function makeThatchRoof(')
print("=== makeThatchRoof ===")
print(txt[idx3:idx3+200])

print()
# autoChimneys
idx4 = txt.find('function autoChimneys(')
print("=== autoChimneys ===")
print(txt[idx4:idx4+150])
