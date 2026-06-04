// EAST-PORT — full settlement map
// 28x28 tiles, 20m/tile. No walls.
// x: -14(west) to +14(east/harbour). y: 0(south) to 28(north).
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }
  function rect(x1,y1,x2,y2,type,name,extra={}){
    for(let x=x1;x<=x2;x++) for(let y=y1;y<=y2;y++) t(x,y,type,name,extra);
  }

  // Streets
  for(let x=-14;x<=12;x++) t(x,14,'street','Harbour Street')
  for(let y=0;y<=28;y++) t(0,y,'street',"Fisher's Way");
  for(let y=0;y<=28;y++) t(5,y,'street',"Tanner's Lane");
  for(let y=0;y<=28;y++) t(-5,y,'street',"Chapel Lane");
  for(let x=-14;x<=12;x++) t(x,22,'street','Quay Road')
  for(let x=-14;x<=12;x++) t(x,6,'street',"Chandler's Walk")
  for(let y=14;y<=22;y++) t(3,y,'street','Rope Lane');
  for(let y=6;y<=14;y++) t(-3,y,'street','Salt Lane');
  for(let y=14;y<=22;y++) t(8,y,'street','Smoker Lane');
  for(let y=6;y<=14;y++) t(10,y,'street','Pier Lane');

  // Road entries
  t(0,28,'road',"Fisher's Way")
  t(0,0,'road',"Fisher's Way")
  t(-14,14,'road','Harbour Street')

  // Harbour
  rect(12,4,13,24,'docks','East-Port Harbour')
  t(12,14,'street','Harbour Street')

  // Market District
  rect(-4,15,3,18,'market','Market Square')
  rect(-4,10,3,13,'market','Market Square')
  t(-5,16,'building','The Salt & Sail Inn',{interiorType:'inn',doors:['east'],enter:{layer:'interior',id:'salt_and_sail',entryPos:{x:1,y:1}}})
  t(-5,12,'building','Market Hall',{interiorType:'market_hall',doors:['east'],enter:{layer:'interior',id:'ep_market_hall',entryPos:{x:1,y:1}}})
  t(4,16,'building','Chandler & Rope',{interiorType:'shop',doors:['west'],enter:{layer:'interior',id:'ep_chandler',entryPos:{x:1,y:1}}})
  t(4,12,'building','Spice Merchant',{interiorType:'shop',doors:['west'],enter:{layer:'interior',id:'ep_spice',entryPos:{x:1,y:1}}})
  t(-2,19,'building',"Fletcher's Stall",{interiorType:'shop',doors:['north'],enter:{layer:'interior',id:'ep_fletcher',entryPos:{x:1,y:1}}})
  t(2,19,'building','Grain Exchange',{interiorType:'shop',doors:['north'],enter:{layer:'interior',id:'ep_grain',entryPos:{x:1,y:1}}})
  t(-2,9,'building','Apothecary',{interiorType:'shop',doors:['south'],enter:{layer:'interior',id:'ep_apothecary',entryPos:{x:1,y:1}}})
  t(2,9,'building','Moneylender',{interiorType:'shop',doors:['south'],enter:{layer:'interior',id:'ep_moneylender',entryPos:{x:1,y:1}}})

  // Fishermen's Quarter
  rect(6,1,8,5,'building','Net Shed',{interiorType:'house'})
  t(6,5,'building','Net Shed',{interiorType:'house',doors:['south'],enter:{layer:'interior',id:'ep_netshed_1',entryPos:{x:1,y:1}}})
  rect(9,1,11,5,'building','Net Shed',{interiorType:'house'})
  t(9,5,'building','Net Shed',{interiorType:'house',doors:['south'],enter:{layer:'interior',id:'ep_netshed_2',entryPos:{x:1,y:1}}})
  t(6,9,'building',"Fisher's Cottage",{interiorType:'house',doors:['south'],enter:{layer:'interior',id:'ep_cottage_1',entryPos:{x:1,y:1}}})
  t(7,9,'building',"Fisher's Cottage",{interiorType:'house',doors:['south'],enter:{layer:'interior',id:'ep_cottage_2',entryPos:{x:1,y:1}}})
  t(9,9,'building',"Fisher's Cottage",{interiorType:'house',doors:['south'],enter:{layer:'interior',id:'ep_cottage_3',entryPos:{x:1,y:1}}})
  t(11,9,'building',"Fisher's Cottage",{interiorType:'house',doors:['west'],enter:{layer:'interior',id:'ep_cottage_4',entryPos:{x:1,y:1}}})
  t(6,12,'building',"Fisher's Cottage",{interiorType:'house',doors:['south'],enter:{layer:'interior',id:'ep_cottage_5',entryPos:{x:1,y:1}}})
  t(7,12,'building',"Fisher's Cottage",{interiorType:'house',doors:['south'],enter:{layer:'interior',id:'ep_cottage_6',entryPos:{x:1,y:1}}})
  t(9,12,'building',"Fisher's Cottage",{interiorType:'house',doors:['south'],enter:{layer:'interior',id:'ep_cottage_7',entryPos:{x:1,y:1}}})
  t(6,13,'building','Smokehouse',{interiorType:'shop',doors:['west'],enter:{layer:'interior',id:'ep_smokehouse',entryPos:{x:1,y:1}}})

  // Merchant Quarter
  t(-6,5,'building','Merchant House',{interiorType:'house',doors:['south'],enter:{layer:'interior',id:'ep_merchant_1',entryPos:{x:1,y:1}}})
  t(-7,5,'building','Merchant House',{interiorType:'house',doors:['south'],enter:{layer:'interior',id:'ep_merchant_2',entryPos:{x:1,y:1}}})
  t(-9,5,'building','Merchant House',{interiorType:'house',doors:['south'],enter:{layer:'interior',id:'ep_merchant_3',entryPos:{x:1,y:1}}})
  t(-11,5,'building','Merchant House',{interiorType:'house',doors:['south'],enter:{layer:'interior',id:'ep_merchant_4',entryPos:{x:1,y:1}}})
  t(-13,5,'building','Merchant House',{interiorType:'house',doors:['south'],enter:{layer:'interior',id:'ep_merchant_5',entryPos:{x:1,y:1}}})
  t(-6,2,'building','Merchant House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_merchant_6',entryPos:{x:1,y:1}}})
  t(-9,2,'building','Merchant House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_merchant_7',entryPos:{x:1,y:1}}})
  t(-11,2,'building','Merchant House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_merchant_8',entryPos:{x:1,y:1}}})
  t(-13,2,'building','Merchant House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_merchant_9',entryPos:{x:1,y:1}}})
  t(-6,9,'building','Notary & Scribe',{interiorType:'shop',doors:['east'],enter:{layer:'interior',id:'ep_notary',entryPos:{x:1,y:1}}})
  t(-9,9,'building','Merchant House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_merchant_10',entryPos:{x:1,y:1}}})
  t(-11,9,'building','Merchant House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_merchant_11',entryPos:{x:1,y:1}}})
  t(-13,9,'building','Merchant House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_merchant_12',entryPos:{x:1,y:1}}})

  // Residential
  t(-6,17,'building','Chapel of the Tides',{interiorType:'chapel'})
  t(-7,17,'building','Chapel of the Tides',{interiorType:'chapel'})
  t(-6,18,'building','Chapel of the Tides',{interiorType:'chapel',doors:['east'],enter:{layer:'interior',id:'ep_chapel',entryPos:{x:1,y:1}}})
  t(-7,18,'building','Chapel of the Tides',{interiorType:'chapel'})
  t(-6,21,'building','House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_house_sw1',entryPos:{x:1,y:1}}})
  t(-7,21,'building','House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_house_sw2',entryPos:{x:1,y:1}}})
  t(-9,21,'building','House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_house_sw3',entryPos:{x:1,y:1}}})
  t(-11,21,'building','House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_house_sw4',entryPos:{x:1,y:1}}})
  t(-13,21,'building','House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_house_sw5',entryPos:{x:1,y:1}}})
  t(-6,25,'building','House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_house_sw6',entryPos:{x:1,y:1}}})
  t(-7,25,'building','House',{interiorType:'house',doors:['east'],enter:{layer:'interior',id:'ep_house_sw7',entryPos:{x:1,y:1}}})
  t(-9,25,'building','House',{interiorType:'house',doors:['north'],enter:{layer:'interior',id:'ep_house_sw8',entryPos:{x:1,y:1}}})
  t(-11,25,'building','House',{interiorType:'house',doors:['north'],enter:{layer:'interior',id:'ep_house_sw9',entryPos:{x:1,y:1}}})
  t(-13,25,'building','House',{interiorType:'house',doors:['north'],enter:{layer:'interior',id:'ep_house_sw10',entryPos:{x:1,y:1}}})

  // Tradesmen's Row
  t(6,17,'building','Blacksmith',{interiorType:'blacksmith',doors:['west'],enter:{layer:'interior',id:'ep_blacksmith',entryPos:{x:1,y:1}}})
  t(7,17,'building','Blacksmith',{interiorType:'blacksmith'})
  t(6,18,'building','Blacksmith',{interiorType:'blacksmith'})
  t(7,18,'building','Blacksmith',{interiorType:'blacksmith'})
  t(9,17,'building','Bathhouse',{interiorType:'bathhouse',doors:['west'],enter:{layer:'interior',id:'ep_bathhouse',entryPos:{x:1,y:1}}})
  t(9,18,'building','Bathhouse',{interiorType:'bathhouse'})
  t(6,21,'building','Tannery',{interiorType:'shop',doors:['west'],enter:{layer:'interior',id:'ep_tannery',entryPos:{x:1,y:1}}})
  t(9,21,'building','Carpenter',{interiorType:'shop',doors:['west'],enter:{layer:'interior',id:'ep_carpenter',entryPos:{x:1,y:1}}})
  t(6,25,'building','House',{interiorType:'house',doors:['west'],enter:{layer:'interior',id:'ep_house_se1',entryPos:{x:1,y:1}}})
  t(7,25,'building','House',{interiorType:'house',doors:['west'],enter:{layer:'interior',id:'ep_house_se2',entryPos:{x:1,y:1}}})
  t(9,25,'building','House',{interiorType:'house',doors:['west'],enter:{layer:'interior',id:'ep_house_se3',entryPos:{x:1,y:1}}})
  t(11,25,'building','House',{interiorType:'house',doors:['west'],enter:{layer:'interior',id:'ep_house_se4',entryPos:{x:1,y:1}}})
  t(13,25,'building','House',{interiorType:'house',doors:['west'],enter:{layer:'interior',id:'ep_house_se5',entryPos:{x:1,y:1}}})
  t(6,20,'building','House',{interiorType:'house',doors:['west'],enter:{layer:'interior',id:'ep_house_se6',entryPos:{x:1,y:1}}})
  t(9,20,'building','House',{interiorType:'house',doors:['west'],enter:{layer:'interior',id:'ep_house_se7',entryPos:{x:1,y:1}}})
  t(11,20,'building','House',{interiorType:'house',doors:['west'],enter:{layer:'interior',id:'ep_house_se8',entryPos:{x:1,y:1}}})
  t(13,20,'building','House',{interiorType:'house',doors:['west'],enter:{layer:'interior',id:'ep_house_se9',entryPos:{x:1,y:1}}})

  // Harbormaster
  t(10,14,'building','Harbormaster',{interiorType:'harbormaster',doors:['west'],enter:{layer:'interior',id:'ep_harbormaster',entryPos:{x:1,y:1}}})
  t(11,14,'building','Harbormaster',{interiorType:'harbormaster'})
  t(10,13,'building','Harbormaster',{interiorType:'harbormaster'})
  t(11,13,'building','Harbormaster',{interiorType:'harbormaster'})

  // Courtyards
  rect(-1,13,1,15,'courtyard','Town Crossing')
  t(0,14,'courtyard','Town Crossing',{object:'well'})
  rect(8,15,11,16,'courtyard','Dockside Yard')
  t(9,16,'courtyard','Dockside Yard',{object:'barrels'})
  rect(8,12,11,13,'courtyard','Dockside Yard')
  t(9,13,'courtyard','Dockside Yard',{object:'cart'})
  t(12,18,'docks','East-Port Harbour',{object:'barrels'})
  t(13,10,'docks','East-Port Harbour',{object:'cart'})

  // Outdoor objects
  t(-3,20,'street','Quay Road',{object:'stall'})
  t(1,20,'street','Quay Road',{object:'stall'})
  t(-1,8,'street',"Chandler's Walk",{object:'stall'})
  t(-1,14,'courtyard','Town Crossing',{object:'noticeboard'})
  t(10,16,'courtyard','Dockside Yard',{object:'logpile'})
  t(-4,14,'street','Harbour Street',{object:'trough'})
  t(4,14,'street','Harbour Street',{object:'signpost'})
  t(-8,14,'street','Harbour Street',{object:'cart'})
  t(3,22,'street','Quay Road',{object:'barrels'})
  t(-3,6,'street',"Chandler's Walk",{object:'haystack'})
  t(8,8,'courtyard','Dockside Yard',{object:'logpile'})
  t(7,6,'street',"Chandler's Walk",{object:'haystack'})
  t(-8,18,'courtyard','Chapel Yard',{object:'bush'})
  t(-8,17,'courtyard','Chapel Yard',{object:'bush'})

  window.SETTLEMENTS['frilar_town'] = {
    map: m,
    name: 'East-Port',
    hasWalls: false,
    entryPos: {x:0, y:2},
    overworldCell: {x:346, y:556},
    description: 'A natural harbour town on the east coast. Smells of salt, smoke, and fish. The kind of place where you can find passage east if you have coin — or find trouble if you do not.',
  };
})();
