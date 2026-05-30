import re

path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix overworld footprint
content = content.replace("['frilar_town',  346,556,349,559,'town'],", "['frilar_town',  346,556,347,557,'town'],")
content = content.replace("['frilar_town',  346,556,349,559],", "['frilar_town',  346,556,347,557],")

# Fix docks
content = content.replace(
    "// East-Port harbour \u2014 1x2 docks immediately east of town (x=350, y=556-557)\ndefRect(350,556,350,557,'docks','East-Port Harbour');",
    "// East-Port harbour \u2014 1 wide, 2 tall, immediately east of 2x2 town (x=348, y=556-557)\ndefRect(348,556,348,557,'docks','East-Port Harbour');"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Overworld fixed")

# Now find and replace the East-Port interior block
start = content.find('// EAST-PORT')
block_start = content.rfind('(function(){', 0, start)
end_marker = "makeSimpleTown('harvestfell'"
end = content.find(end_marker)
block_end = content.rfind('})();\n', 0, end) + len('})();\n')
print(f"Block: {block_start} to {block_end}")

NEW = """(function(){
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// EAST-PORT \u2014 full layout
// 28\xd728 tiles, 20m/tile (~560m\xd7560m). No walls.
// x: -14(west) to +14(east/harbour). y: 0(south) to 28(north).
//
// Districts:
//   Fishermen's Quarter  \u2014 NE  (x:5..13, y:16..26)
//   Market District      \u2014 centre (x:-4..4, y:10..18)
//   Merchant Quarter     \u2014 NW  (x:-13..-5, y:16..26)
//   Residential          \u2014 SW  (x:-13..-5, y:2..12)
//   Tradesmen's Row      \u2014 SE  (x:5..13, y:2..12)
//   Harbour / Docks      \u2014 E edge (x:12..13, y:4..24)
//
// Streets:
//   Harbour Street  \u2014 E-W spine, y=14
//   Fisher's Way    \u2014 N-S spine, x=0
//   Tanner's Lane   \u2014 N-S east,  x=5
//   Chapel Lane     \u2014 N-S west,  x=-5
//   Quay Road       \u2014 E-W south, y=6
//   Chandler's Walk \u2014 E-W north, y=22
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
const m={};
function t(x,y,type,name,extra={}){m[`${x},${y}`]=Object.assign({type,name},extra);}
function rect(x1,y1,x2,y2,type,name,extra={}){
  for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)t(x,y,type,name,extra);
}

// \u2500\u2500 STREETS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
for(let x=-14;x<=12;x++)t(x,14,'street','Harbour Street');
for(let y=0;y<=28;y++)t(0,y,'street',"Fisher's Way");
for(let y=0;y<=28;y++)t(5,y,'street',"Tanner's Lane");
for(let y=0;y<=28;y++)t(-5,y,'street',"Chapel Lane");
for(let x=-14;x<=12;x++)t(x,6,'street','Quay Road');
for(let x=-14;x<=12;x++)t(x,22,'street',"Chandler's Walk");
for(let y=6;y<=14;y++)t(3,y,'street','Rope Lane');
for(let y=14;y<=22;y++)t(-3,y,'street','Salt Lane');
for(let y=6;y<=14;y++)t(8,y,'street','Smoker Lane');
for(let y=14;y<=22;y++)t(10,y,'street','Pier Lane');

// \u2500\u2500 ROAD ENTRIES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
t(0,0,'road',"Fisher's Way");
t(0,28,'road',"Fisher's Way");
t(-14,14,'road','Harbour Street');

// \u2500\u2500 HARBOUR (east edge) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
rect(12,4,13,24,'docks','East-Port Harbour');
t(12,14,'street','Harbour Street');

// \u2500\u2500 MARKET DISTRICT (centre) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
rect(-4,10,3,13,'market','Market Square');
rect(-4,15,3,18,'market','Market Square');
t(-5,12,'building','The Salt & Sail Inn',{interiorType:'inn',doors:['east']});
t(-5,16,'building','Market Hall',{interiorType:'market_hall',doors:['east']});
t(4,12,'building','Chandler & Rope',{interiorType:'shop',doors:['west']});
t(4,16,'building','Spice Merchant',{interiorType:'shop',doors:['west']});
t(-2,9,'building',"Fletcher's Stall",{interiorType:'shop',doors:['north']});
t(2,9,'building','Grain Exchange',{interiorType:'shop',doors:['north']});
t(-2,19,'building','Apothecary',{interiorType:'shop',doors:['south']});
t(2,19,'building','Moneylender',{interiorType:'shop',doors:['south']});

// \u2500\u2500 FISHERMEN'S QUARTER (NE) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
rect(6,23,8,27,'building','Net Shed',{interiorType:'house',doors:['south']});
rect(9,23,11,27,'building','Net Shed',{interiorType:'house',doors:['south']});
t(6,19,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(7,19,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(9,19,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(11,19,'building',"Fisher's Cottage",{interiorType:'house',doors:['west']});
t(6,16,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(7,16,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(9,16,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(6,15,'building','Smokehouse',{interiorType:'shop',doors:['west']});

// \u2500\u2500 MERCHANT QUARTER (NW) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
t(-6,23,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-7,23,'building','Merchant House',{interiorType:'house',doors:['south']});
t(-9,23,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-11,23,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-13,23,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-6,26,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-9,26,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-11,26,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-13,26,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-6,19,'building','Notary & Scribe',{interiorType:'shop',doors:['east']});
t(-9,19,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-11,19,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-13,19,'building','Merchant House',{interiorType:'house',doors:['east']});

// \u2500\u2500 RESIDENTIAL (SW) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
t(-6,11,'building','Chapel of the Tides',{interiorType:'chapel',doors:['east','south']});
t(-7,11,'building','Chapel of the Tides',{interiorType:'chapel',doors:['south']});
t(-6,10,'building','Chapel of the Tides',{interiorType:'chapel',doors:['east']});
t(-7,10,'building','Chapel of the Tides',{interiorType:'chapel',doors:['east']});
t(-6,7,'building','House',{interiorType:'house',doors:['east']});
t(-7,7,'building','House',{interiorType:'house',doors:['east']});
t(-9,7,'building','House',{interiorType:'house',doors:['east']});
t(-11,7,'building','House',{interiorType:'house',doors:['east']});
t(-13,7,'building','House',{interiorType:'house',doors:['east']});
t(-6,3,'building','House',{interiorType:'house',doors:['east']});
t(-7,3,'building','House',{interiorType:'house',doors:['east']});
t(-9,3,'building','House',{interiorType:'house',doors:['north']});
t(-11,3,'building','House',{interiorType:'house',doors:['north']});
t(-13,3,'building','House',{interiorType:'house',doors:['north']});

// \u2500\u2500 TRADESMEN'S ROW (SE) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
t(6,11,'building','Blacksmith',{interiorType:'blacksmith',doors:['west','south']});
t(7,11,'building','Blacksmith',{interiorType:'blacksmith',doors:['south']});
t(6,10,'building','Blacksmith',{interiorType:'blacksmith',doors:['west']});
t(7,10,'building','Blacksmith',{interiorType:'blacksmith',doors:['west']});
t(9,11,'building','Bathhouse',{interiorType:'bathhouse',doors:['west']});
t(9,10,'building','Bathhouse',{interiorType:'bathhouse',doors:['west']});
t(6,7,'building','Tannery',{interiorType:'shop',doors:['west']});
t(9,7,'building','Carpenter',{interiorType:'shop',doors:['west']});
t(6,3,'building','House',{interiorType:'house',doors:['west']});
t(7,3,'building','House',{interiorType:'house',doors:['west']});
t(9,3,'building','House',{interiorType:'house',doors:['west']});
t(11,3,'building','House',{interiorType:'house',doors:['west']});
t(13,3,'building','House',{interiorType:'house',doors:['west']});
t(6,8,'building','House',{interiorType:'house',doors:['west']});
t(9,8,'building','House',{interiorType:'house',doors:['west']});
t(11,8,'building','House',{interiorType:'house',doors:['west']});
t(13,8,'building','House',{interiorType:'house',doors:['west']});

// \u2500\u2500 HARBORMASTER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
t(10,14,'building','Harbormaster',{interiorType:'harbormaster',doors:['west','south']});
t(11,14,'building','Harbormaster',{interiorType:'harbormaster',doors:['south']});
t(10,15,'building','Harbormaster',{interiorType:'harbormaster',doors:['west']});
t(11,15,'building','Harbormaster',{interiorType:'harbormaster',doors:['west']});

// \u2500\u2500 COURTYARDS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
rect(-1,13,1,15,'courtyard','Town Crossing');
rect(8,12,11,13,'courtyard','Dockside Yard');
rect(8,15,11,16,'courtyard','Dockside Yard');

SETTLEMENTS['frilar_town']={
  map:m,
  name:'East-Port',
  hasWalls:false,
  entryPos:{x:0,y:2},
  overworldCell:{x:346,y:556},
  description:'A natural harbour town on the east coast. Smells of salt, smoke, and fish. The kind of place where you can find passage east if you have coin \u2014 or find trouble if you do not.',
};
})();
"""

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('// EAST-PORT')
block_start = content.rfind('(function(){', 0, start)
end = content.find(end_marker)
block_end = content.rfind('})();\n', 0, end) + len('})();\n')

content = content[:block_start] + NEW + content[block_end:]
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
