// CARROW TOWN — settlement map
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }
  function rect(x1,y1,x2,y2,type,name,extra={}){
    for(let x=x1;x<=x2;x++) for(let y=y1;y<=y2;y++) t(x,y,type,name,extra);
  }

  // MAP CELLS
  t(1,10,'grass','', {object:"mushroom",objVariant:0});
  t(5,10,'grass','', {object:"thicket",objVariant:0});
  t(6,10,'grass','', {object:"tree_dead",objVariant:0});
  t(9,10,'grass','', {object:"campsite",objVariant:0});
  t(1,9,'grass','', {object:"mushroom",objVariant:0});
  t(9,9,'grass','', {object:"graveyard",objVariant:0});
  t(5,8,'grass','', {objVariant:0});
  t(3,7,'grass','The Wet Leg', {interiorType:"Tavern",doors:["south"]});
  t(9,7,'grass','', {object:"bush_lg",objVariant:0});
  t(10,7,'grass','', {object:"path_v",objVariant:0});
  t(1,6,'grass','', {object:"signpost",objVariant:0});
  t(5,6,'grass','', {object:"well",objVariant:0});
  t(6,6,'grass','', {object:"logpile",objVariant:0});
  t(10,6,'grass','', {object:"path_v",objVariant:0});
  t(0,5,'street','');
  t(1,5,'street','');
  t(2,5,'street','');
  t(3,5,'street','');
  t(4,5,'street','');
  t(5,5,'street','');
  t(6,5,'street','');
  t(7,5,'street','');
  t(8,5,'street','');
  t(9,5,'street','');
  t(10,5,'street','');
  t(1,4,'grass','', {object:"barrels",objVariant:0});
  t(2,4,'grass','', {object:"_part",anchor:"2,2"});
  t(3,4,'grass','', {object:"_part",anchor:"2,2"});
  t(4,4,'grass','', {object:"_part",anchor:"2,2"});
  t(5,4,'grass','', {object:"haystack",objVariant:0});
  t(8,4,'grass','', {object:"path_v"});
  t(9,4,'grass','', {object:"trough",rotation:180,objVariant:0});
  t(2,3,'grass','', {object:"_part",anchor:"2,2"});
  t(3,3,'grass','', {object:"_part",anchor:"2,2"});
  t(4,3,'grass','', {object:"_part",anchor:"2,2"});
  t(8,3,'grass','', {object:"path_v"});
  t(2,2,'building','', {interiorType:"house",bldgType:"standard",bldgW:3,bldgH:3,bldgPxW:60,bldgPxH:60,roofStyle:"red",roofShape:"hip",bldgPattern:"default",bldgYard:"bottom"});
  t(3,2,'grass','', {object:"_part",anchor:"2,2"});
  t(4,2,'grass','', {object:"_part",anchor:"2,2"});
  t(5,2,'grass','', {object:"path_h"});
  t(6,2,'grass','', {object:"path_h",objVariant:0});
  t(7,2,'grass','', {object:"path_h"});
  t(8,2,'grass','', {object:"path_csw",objVariant:0});
  t(2,1,'mud','');
  t(3,1,'mud','');
  t(4,1,'mud','');
  t(2,0,'mud','', {object:"coop",objVariant:0});
  t(3,0,'mud','');
  t(4,0,'mud','');
  t(5,0,'mud','', {objVariant:0});
  t(6,0,'mud','', {objVariant:0});
  t(7,0,'grass','');
  t(9,0,'grass','', {object:"tent",objVariant:0});

  window.SETTLEMENTS["carrow_town"] = {
    map: m,
    name: "Carrow town",
    hasWalls: false,
    entryPos: {"x":0,"y":2},
    overworldCell: {"x":346,"y":556},
    description: "",
  };
})();
