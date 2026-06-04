// CARROWTOWN PORT — settlement map
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }
  function rect(x1,y1,x2,y2,type,name,extra={}){
    for(let x=x1;x<=x2;x++) for(let y=y1;y<=y2;y++) t(x,y,type,name,extra);
  }

  // MAP CELLS
  t(0,0,'water','');
  t(1,0,'water','');
  t(2,0,'shallow_water','');
  t(3,0,'market','');
  t(4,0,'market','');
  t(5,0,'market','', {object:"rock",objVariant:0});
  t(6,0,'market','');
  t(7,0,'market','');
  t(8,0,'market','');
  t(9,0,'market','', {object:"log",objVariant:0});
  t(10,0,'market','');
  t(0,1,'water','');
  t(1,1,'water','');
  t(2,1,'shallow_water','');
  t(3,1,'market','');
  t(4,1,'market','');
  t(5,1,'market','');
  t(6,1,'market','');
  t(7,1,'market','', {object:"tree_palm",objVariant:0});
  t(8,1,'market','');
  t(9,1,'market','');
  t(10,1,'market','', {object:"boulder",objVariant:0});
  t(0,2,'water','');
  t(1,2,'water','');
  t(2,2,'shallow_water','');
  t(3,2,'market','');
  t(4,2,'market','', {object:"tree_palm",objVariant:0});
  t(5,2,'market','');
  t(6,2,'market','');
  t(7,2,'market','');
  t(8,2,'market','');
  t(9,2,'market','');
  t(10,2,'market','');
  t(0,3,'water','');
  t(1,3,'water','');
  t(2,3,'shallow_water','');
  t(3,3,'shallow_water','');
  t(4,3,'market','');
  t(5,3,'market','');
  t(6,3,'market','');
  t(7,3,'market','', {object:"logpile",objVariant:0});
  t(8,3,'market','');
  t(9,3,'market','');
  t(10,3,'market','');
  t(0,4,'water','');
  t(1,4,'shallow_water','', {objVariant:0});
  t(2,4,'shallow_water','');
  t(3,4,'shallow_water','');
  t(4,4,'market','');
  t(5,4,'market','', {object:"cart",objVariant:0});
  t(6,4,'market','');
  t(7,4,'market','');
  t(8,4,'market','');
  t(9,4,'market','');
  t(10,4,'market','');
  t(0,5,'water','');
  t(1,5,'floor_h','', {terrainStyle:5});
  t(2,5,'floor_h','', {terrainStyle:5});
  t(3,5,'floor_h','', {terrainStyle:5});
  t(4,5,'floor_h','', {terrainStyle:5,objVariant:0});
  t(5,5,'floor_h','', {terrainStyle:5,objVariant:0});
  t(6,5,'market','', {object:"path_h",objVariant:0});
  t(7,5,'market','', {object:"path_h",objVariant:0});
  t(8,5,'market','', {object:"path_h",objVariant:0});
  t(9,5,'market','', {object:"path_h",objVariant:0});
  t(10,5,'market','', {object:"path_h",objVariant:0});
  t(0,6,'water','', {object:"boat",objVariant:0});
  t(1,6,'water','');
  t(2,6,'water','');
  t(3,6,'shallow_water','');
  t(4,6,'building','', {interiorType:"house",bldgType:"standard",bldgW:1,bldgH:1,bldgPxW:20,bldgPxH:20,roofStyle:"amber",roofShape:"mansard",bldgPattern:"default"});
  t(5,6,'market','', {object:"signpost",objVariant:0});
  t(6,6,'market','');
  t(7,6,'market','');
  t(8,6,'market','');
  t(9,6,'market','');
  t(10,6,'market','');
  t(0,7,'water','');
  t(1,7,'water','');
  t(2,7,'shallow_water','');
  t(3,7,'market','');
  t(4,7,'market','');
  t(5,7,'market','');
  t(6,7,'market','');
  t(7,7,'market','', {object:"tree_palm",objVariant:0});
  t(8,7,'market','');
  t(9,7,'market','');
  t(10,7,'market','');
  t(0,8,'water','');
  t(1,8,'water','');
  t(2,8,'shallow_water','');
  t(3,8,'shallow_water','');
  t(4,8,'market','');
  t(5,8,'market','');
  t(6,8,'market','');
  t(7,8,'market','');
  t(8,8,'market','');
  t(9,8,'market','');
  t(10,8,'market','');
  t(0,9,'water','');
  t(1,9,'water','');
  t(2,9,'shallow_water','');
  t(3,9,'shallow_water','');
  t(4,9,'market','');
  t(5,9,'market','');
  t(6,9,'market','', {object:"tree_palm",objVariant:0});
  t(7,9,'market','');
  t(8,9,'market','');
  t(9,9,'market','');
  t(10,9,'market','', {object:"rock",objVariant:0});
  t(0,10,'water','');
  t(1,10,'water','');
  t(2,10,'water','');
  t(3,10,'shallow_water','');
  t(4,10,'market','', {object:"tree_palm",objVariant:0});
  t(5,10,'market','');
  t(6,10,'market','');
  t(7,10,'market','');
  t(8,10,'market','');
  t(9,10,'market','', {object:"rock",objVariant:0});
  t(10,10,'market','', {object:"boulder",objVariant:0});

  window.SETTLEMENTS["carrowtown_port"] = {
    map: m,
    name: "Carrowtown Port",
    hasWalls: false,
    entryPos: {"x":0,"y":2},
    overworldCell: {"x":346,"y":556},
    description: "",
  };
})();
