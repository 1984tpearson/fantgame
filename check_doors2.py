import re
with open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js','r',encoding='utf-8') as f: src=f.read()
# Find the t() helper function in East-Port
idx = src.find("function t(x,y,type,name,extra={}){m[`${x},${y}`]=Object.assign({type,name},extra);}")
print("t() helper found:", idx != -1)
# Check a specific door tile
idx2 = src.find("t(9,7,'building','Carpenter',{interiorType:'shop',doors:['west']})")
print("Carpenter door tile:", idx2 != -1)
if idx2 != -1:
    print("  Sample:", src[idx2:idx2+70])
# Check what t() does with the extra object
idx3 = src.find("t(-5,12,'building','The Salt & Sail Inn',{interiorType:'inn',doors:")
print("Salt & Sail door:", idx3 != -1)
if idx3 != -1:
    print("  Sample:", src[idx3:idx3+80])
