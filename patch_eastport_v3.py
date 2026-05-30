import re

path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '(function(){\n// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n// EAST-PORT'
end_marker = "makeSimpleTown('harvestfell'"

start = content.find('// EAST-PORT')
block_start = content.rfind('(function(){', 0, start)
end = content.find(end_marker)
block_end = content.rfind('})();\n', 0, end) + len('})();\n')

print(f"Block found: chars {block_start} to {block_end}")

NEW = """(function(){
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// EAST-PORT \u2014 full layout
// 56\xd756 tiles, 20m/tile (~1120m\xd71120m). No walls.
// x: -28(west) to +28(east/harbour). y: 0(south) to 56(north).
//
// Districts:
//   Fishermen's Quarter  \u2014 NE  (x:8..27,  y:30..54)
//   Market District      \u2014 centre (x:-8..8, y:20..36)
//   Merchant Quarter     \u2014 NW  (x:-27..-9, y:30..54)
//   Residential          \u2014 SW  (x:-27..-9, y:2..20)
//   Tradesmen's Row      \u2014 SE  (x:9..27,   y:2..20)
//   Harbour / Docks      \u2014 E edge (x:24..27, y:8..48)
//
// Streets:
//   Harbour Street  \u2014 E-W spine, y=28
//   Fisher's Way    \u2014 N-S spine, x=0
//   Tanner's Lane   \u2014 N-S east,  x=10
//   Chapel Lane     \u2014 N-S west,  x=-10
//   Quay Road       \u2014 E-W south, y=12
//   Chandler's Walk \u2014 E-W north, y=44
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
const m={};
function t(x,y,type,name,extra={}){m[`${x},${y}`]=Object.assign({type,name},extra);}
function rect(x1,y1,x2,y2,type,name,extra={}){
  for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)t(x,y,type,name,extra);
}

// \u2500\u2500 STREETS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Harbour Street (E-W spine, y=28)
for(let x=-28;x<=23;x++)t(x,28,'street','Harbour Street');
// Fisher's Way (N-S spine, x=0)
for(let y=0;y<=56;y++)t(0,y,'street',"Fisher's Way");
// Tanner's Lane (N-S east, x=10)
for(let y=0;y<=56;y++)t(10,y,'street',"Tanner's Lane");
// Chapel Lane (N-S west, x=-10)
for(let y=0;y<=56;y++)t(-10,y,'street',"Chapel Lane");
// Quay Road (E-W south, y=12)
for(let x=-28;x<=23;x++)t(x,12,'street','Quay Road');
// Chandler's Walk (E-W north, y=44)
for(let x=-28;x<=23;x++)t(x,44,'street',"Chandler's Walk");
// Short connector lanes
for(let y=12;y<=28;y++)t(5,y,'street','Rope Lane');
for(let y=28;y<=44;y++)t(-5,y,'street','Salt Lane');
for(let y=12;y<=28;y++)t(15,y,'street','Smoker Lane');
for(let y=28;y<=44;y++)t(20,y,'street','Pier Lane');

// \u2500\u2500 ROAD ENTRIES (open ends, no gates) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
t(0,0,'road',"Fisher's Way");   // south entry
t(0,56,'road',"Fisher's Way");  // north entry
t(-28,28,'road','Harbour Street'); // west entry

// \u2500\u2500 HARBOUR (east edge, natural inlet) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
rect(22,8,23,48,'docks','East-Port Harbour');
t(22,28,'street','Harbour Street'); // street meets docks

// \u2500\u2500 MARKET DISTRICT (centre) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
rect(-7,21,7,27,'market','Market Square');
rect(-7,29,7,35,'market','Market Square');
t(-8,24,'building','The Salt & Sail Inn',{interiorType:'inn',doors:['east']});
t(-8,32,'building','Market Hall',{interiorType:'market_hall',doors:['east']});
t(8,24,'building','Chandler & Rope',{interiorType:'shop',doors:['west']});
t(8,32,'building','Spice Merchant',{interiorType:'shop',doors:['west']});
t(-4,20,'building',"Fletcher's Stall",{interiorType:'shop',doors:['north']});
t(4,20,'building','Grain Exchange',{interiorType:'shop',doors:['north']});
t(-4,36,'building','Apothecary',{interiorType:'shop',doors:['south']});
t(4,36,'building','Moneylender',{interiorType:'shop',doors:['south']});

// \u2500\u2500 FISHERMEN'S QUARTER (NE) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
rect(11,46,14,54,'building','Net Shed',{interiorType:'house',doors:['south']});
rect(16,46,19,54,'building','Net Shed',{interiorType:'house',doors:['south']});
rect(21,46,21,54,'building','Net Shed',{interiorType:'house',doors:['west']});
t(11,40,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(13,40,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(15,40,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(17,40,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(19,40,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(21,40,'building',"Fisher's Cottage",{interiorType:'house',doors:['west']});
t(11,36,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(13,36,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(15,36,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(17,36,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(19,36,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(11,32,'building','Smokehouse',{interiorType:'shop',doors:['west','south']});
t(12,32,'building','Smokehouse',{interiorType:'shop',doors:['south']});

// \u2500\u2500 MERCHANT QUARTER (NW) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
t(-11,46,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-13,46,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-15,46,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-17,46,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-19,46,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-21,46,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-23,46,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-11,50,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-14,50,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-17,50,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-20,50,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-23,50,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-11,54,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-14,54,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-17,54,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-20,54,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-23,54,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-11,40,'building','Notary & Scribe',{interiorType:'shop',doors:['east','south']});
t(-12,40,'building','Notary & Scribe',{interiorType:'shop',doors:['south']});
t(-11,36,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-14,36,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-17,36,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-20,36,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-23,36,'building','Merchant House',{interiorType:'house',doors:['east']});

// \u2500\u2500 RESIDENTIAL (SW) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
t(-11,20,'building','Chapel of the Tides',{interiorType:'chapel',doors:['east','south']});
t(-12,20,'building','Chapel of the Tides',{interiorType:'chapel',doors:['south']});
t(-11,19,'building','Chapel of the Tides',{interiorType:'chapel',doors:['east']});
t(-12,19,'building','Chapel of the Tides',{interiorType:'chapel',doors:['east']});
t(-11,15,'building','House',{interiorType:'house',doors:['east']});
t(-13,15,'building','House',{interiorType:'house',doors:['east']});
t(-15,15,'building','House',{interiorType:'house',doors:['east']});
t(-17,15,'building','House',{interiorType:'house',doors:['east']});
t(-19,15,'building','House',{interiorType:'house',doors:['east']});
t(-21,15,'building','House',{interiorType:'house',doors:['east']});
t(-23,15,'building','House',{interiorType:'house',doors:['east']});
t(-25,15,'building','House',{interiorType:'house',doors:['east']});
t(-11,8,'building','House',{interiorType:'house',doors:['east','north']});
t(-13,8,'building','House',{interiorType:'house',doors:['north']});
t(-15,8,'building','House',{interiorType:'house',doors:['north']});
t(-17,8,'building','House',{interiorType:'house',doors:['north']});
t(-19,8,'building','House',{interiorType:'house',doors:['north']});
t(-21,8,'building','House',{interiorType:'house',doors:['north']});
t(-23,8,'building','House',{interiorType:'house',doors:['north']});
t(-25,8,'building','House',{interiorType:'house',doors:['north']});
t(-11,4,'building','House',{interiorType:'house',doors:['east']});
t(-13,4,'building','House',{interiorType:'house',doors:['east']});
t(-15,4,'building','House',{interiorType:'house',doors:['east']});
t(-17,4,'building','House',{interiorType:'house',doors:['east']});
t(-19,4,'building','House',{interiorType:'house',doors:['east']});
t(-21,4,'building','House',{interiorType:'house',doors:['east']});
t(-23,4,'building','House',{interiorType:'house',doors:['east']});
t(-25,4,'building','House',{interiorType:'house',doors:['east']});

// \u2500\u2500 TRADESMEN'S ROW (SE) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
t(11,20,'building','Blacksmith',{interiorType:'blacksmith',doors:['west','south']});
t(12,20,'building','Blacksmith',{interiorType:'blacksmith',doors:['south']});
t(11,19,'building','Blacksmith',{interiorType:'blacksmith',doors:['west']});
t(12,19,'building','Blacksmith',{interiorType:'blacksmith',doors:['west']});
t(14,20,'building','Bathhouse',{interiorType:'bathhouse',doors:['west','south']});
t(15,20,'building','Bathhouse',{interiorType:'bathhouse',doors:['south']});
t(14,19,'building','Bathhouse',{interiorType:'bathhouse',doors:['west']});
t(15,19,'building','Bathhouse',{interiorType:'bathhouse',doors:['west']});
t(11,15,'building','Tannery',{interiorType:'shop',doors:['west']});
t(12,15,'building','Tannery',{interiorType:'shop',doors:['west']});
t(14,15,'building','Carpenter',{interiorType:'shop',doors:['west']});
t(15,15,'building','Carpenter',{interiorType:'shop',doors:['west']});
t(11,8,'building','House',{interiorType:'house',doors:['west','north']});
t(13,8,'building','House',{interiorType:'house',doors:['north']});
t(15,8,'building','House',{interiorType:'house',doors:['north']});
t(17,8,'building','House',{interiorType:'house',doors:['north']});
t(19,8,'building','House',{interiorType:'house',doors:['north']});
t(21,8,'building','House',{interiorType:'house',doors:['north']});
t(11,4,'building','House',{interiorType:'house',doors:['west']});
t(13,4,'building','House',{interiorType:'house',doors:['west']});
t(15,4,'building','House',{interiorType:'house',doors:['west']});
t(17,4,'building','House',{interiorType:'house',doors:['west']});
t(19,4,'building','House',{interiorType:'house',doors:['west']});
t(21,4,'building','House',{interiorType:'house',doors:['west']});

// \u2500\u2500 HARBORMASTER (east, near docks) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
t(20,29,'building','Harbormaster',{interiorType:'harbormaster',doors:['west','south']});
t(20,30,'building','Harbormaster',{interiorType:'harbormaster',doors:['west']});
t(21,29,'building','Harbormaster',{interiorType:'harbormaster',doors:['south']});
t(21,30,'building','Harbormaster',{interiorType:'harbormaster',doors:['west']});

// \u2500\u2500 OPEN GROUND / COURTYARD \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
rect(-2,26,2,30,'courtyard','Town Crossing');
rect(16,25,21,27,'courtyard','Dockside Yard');
rect(16,29,21,31,'courtyard','Dockside Yard');

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

content = content[:block_start] + NEW + content[block_end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
