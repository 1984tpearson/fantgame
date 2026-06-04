// CARROW TOWN — settlement map
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }
  function rect(x1,y1,x2,y2,type,name,extra={}){
    for(let x=x1;x<=x2;x++) for(let y=y1;y<=y2;y++) t(x,y,type,name,extra);
  }

  // MAP CELLS
  t(5,0,'mud','', {objVariant:0});
  t(6,0,'mud','', {objVariant:0});
  t(7,0,'grass','');
  t(5,1,'grass','', {object:"path_cne",objVariant:0});
  t(6,1,'grass','', {object:"path_h",objVariant:0});
  t(7,1,'grass','', {object:"path_h",objVariant:0});
  t(4,2,'grass','', {object:"flowers",objVariant:0});
  t(5,2,'grass','', {object:"path_v",objVariant:0});
  t(6,2,'grass','', {object:"flowers",objVariant:0});
  t(2,3,'grass','', {object:"barrels",objVariant:0});
  t(3,3,'grass','', {object:"flowers",objVariant:0});
  t(5,3,'grass','', {object:"path_v",objVariant:0});
  t(7,3,'building','The Salted Squirrel', {interiorType:"inn",bldgType:"standard",bldgW:1,bldgH:2,bldgPxW:20,bldgPxH:40,roofStyle:"thatch",roofShape:"gambrel",bldgPattern:"default",bldgYard:"bottom"});
  t(1,4,'grass','', {object:"barrels",objVariant:0});
  t(2,4,'grass','', {object:"flowers",objVariant:0});
  t(4,4,'grass','', {object:"bush_lg",objVariant:0});
  t(5,4,'grass','', {object:"path_v",objVariant:0});
  t(6,4,'grass','', {object:"campfire",objVariant:0});
  t(7,4,'grass','', {object:"_part",anchor:"7,3"});
  t(9,4,'grass','', {object:"trough",rotation:180,objVariant:0});
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
  t(1,6,'grass','', {object:"signpost",objVariant:0});
  t(6,6,'grass','', {object:"logpile",objVariant:0});
  t(10,6,'grass','', {object:"path_v",objVariant:0});
  t(7,7,'building','The Salted Squirrel', {interiorType:"inn",bldgType:"standard",bldgW:2,bldgH:2,bldgPxW:40,bldgPxH:40,roofStyle:"blueslate",roofShape:"ridge",bldgPattern:"default",bldgYard:"bottom"});
  t(8,7,'grass','', {object:"_part",anchor:"7,7"});
  t(9,7,'grass','', {object:"bush_lg",objVariant:0});
  t(10,7,'grass','', {object:"path_v",objVariant:0});
  t(2,8,'building','The Salted Squirrel', {interiorType:"inn",bldgType:"standard",bldgW:3,bldgH:3,bldgPxW:60,bldgPxH:60,roofStyle:"blueslate",roofShape:"gambrel",bldgPattern:"default",bldgYard:"bottom"});
  t(3,8,'grass','', {object:"_part",anchor:"2,8"});
  t(4,8,'grass','', {object:"_part",anchor:"2,8"});
  t(5,8,'grass','', {objVariant:0});
  t(7,8,'grass','', {object:"_part",anchor:"7,7"});
  t(8,8,'grass','', {object:"_part",anchor:"7,7"});
  t(1,9,'grass','', {object:"mushroom",objVariant:0});
  t(2,9,'grass','', {object:"_part",anchor:"2,8"});
  t(3,9,'grass','', {object:"_part",anchor:"2,8"});
  t(4,9,'grass','', {object:"_part",anchor:"2,8"});
  t(9,9,'grass','', {object:"graveyard",objVariant:0});
  t(1,10,'grass','', {object:"mushroom",objVariant:0});
  t(2,10,'grass','', {object:"_part",anchor:"2,8"});
  t(3,10,'grass','', {object:"_part",anchor:"2,8"});
  t(4,10,'grass','', {object:"_part",anchor:"2,8"});
  t(5,10,'grass','', {object:"thicket",objVariant:0});
  t(6,10,'grass','', {object:"tree_dead",objVariant:0});
  t(9,10,'grass','', {object:"campsite",objVariant:0});

  window.SETTLEMENTS["carrow_town"] = {
    map: m,
    name: "Carrow town",
    hasWalls: false,
    entryPos: {"x":0,"y":2},
    overworldCell: {"x":346,"y":556},
    description: "",
  };
})();
