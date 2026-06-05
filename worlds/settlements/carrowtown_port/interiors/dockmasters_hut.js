// DOCKMASTERS_HUT — interior map
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }

  // MAP CELLS
  t(0,0,'wall','Wall');
  t(1,0,'wall','Wall');
  t(2,0,'wall','Wall');
  t(3,0,'wall','Wall');
  t(4,0,'wall','Wall');
  t(5,0,'wall','Wall');
  t(6,0,'wall','Wall');
  t(7,0,'wall','Wall');
  t(8,0,'wall','Wall');
  t(9,0,'wall','Wall');
  t(0,1,'wall','Wall');
  t(1,1,'floor_h','Sleeping Quarters', {terrainStyle:2,object:"bed_s"});
  t(2,1,'floor_h','Sleeping Quarters', {terrainStyle:2});
  t(3,1,'floor_h','Sleeping Quarters', {terrainStyle:2});
  t(4,1,'floor_h','Sleeping Quarters', {terrainStyle:2,object:"drawers"});
  t(5,1,'wall','Wall');
  t(6,1,'floor_stone','Storeroom', {object:"barrels"});
  t(7,1,'floor_stone','Storeroom');
  t(8,1,'floor_stone','Storeroom');
  t(9,1,'wall','Wall');
  t(0,2,'wall','Wall');
  t(1,2,'floor_h','Sleeping Quarters', {terrainStyle:2,object:"chest"});
  t(2,2,'floor_h','Sleeping Quarters', {terrainStyle:2});
  t(3,2,'floor_h','Sleeping Quarters', {terrainStyle:2});
  t(4,2,'floor_h','Sleeping Quarters', {terrainStyle:2});
  t(5,2,'wall','Wall');
  t(6,2,'floor_stone','Storeroom');
  t(7,2,'floor_stone','Storeroom');
  t(8,2,'floor_stone','Storeroom', {object:"logpile"});
  t(9,2,'wall','Wall');
  t(0,3,'wall','Wall');
  t(1,3,'floor_h','Sleeping Quarters', {terrainStyle:2});
  t(2,3,'floor_h','Sleeping Quarters', {terrainStyle:2});
  t(3,3,'floor_h','Sleeping Quarters', {terrainStyle:2,object:"stool"});
  t(4,3,'floor_h','Sleeping Quarters', {terrainStyle:2});
  t(5,3,'wall','Wall');
  t(6,3,'floor_stone','Storeroom', {object:"weaponrack"});
  t(7,3,'floor_stone','Storeroom');
  t(8,3,'floor_stone','Storeroom');
  t(9,3,'wall','Wall');
  t(0,4,'wall','Wall');
  t(1,4,'wall','Wall');
  t(2,4,'wall','Wall');
  t(3,4,'floor_h','Main Office', {terrainStyle:2});
  t(4,4,'wall','Wall');
  t(5,4,'wall','Wall');
  t(6,4,'floor_h','Main Office', {terrainStyle:2});
  t(7,4,'wall','Wall');
  t(8,4,'wall','Wall');
  t(9,4,'wall','Wall');
  t(0,5,'wall','Wall');
  t(1,5,'floor_h','Main Office', {terrainStyle:2,object:"basin"});
  t(2,5,'floor_h','Main Office', {terrainStyle:2,object:"torch"});
  t(3,5,'floor_h','Main Office', {terrainStyle:2});
  t(4,5,'floor_h','Main Office', {terrainStyle:2});
  t(5,5,'floor_h','Main Office', {terrainStyle:2});
  t(6,5,'floor_h','Main Office', {terrainStyle:2});
  t(7,5,'floor_h','Main Office', {terrainStyle:2,object:"desk"});
  t(8,5,'floor_h','Main Office', {terrainStyle:2,object:"barrels"});
  t(9,5,'wall','Wall');
  t(0,6,'wall','Wall');
  t(1,6,'floor_h','Main Office', {terrainStyle:2,object:"fireplace"});
  t(2,6,'floor_h','Main Office', {terrainStyle:2,object:"noticeboard"});
  t(3,6,'floor_h','Main Office', {terrainStyle:2});
  t(4,6,'floor_h','Main Office', {terrainStyle:2});
  t(5,6,'floor_h','Main Office', {terrainStyle:2});
  t(6,6,'floor_h','Main Office', {terrainStyle:2});
  t(7,6,'floor_h','Main Office', {terrainStyle:2,object:"chair"});
  t(8,6,'floor_h','Main Office', {terrainStyle:2});
  t(9,6,'wall','Wall');
  t(0,7,'wall','Wall');
  t(1,7,'wall','Wall');
  t(2,7,'wall','Wall');
  t(3,7,'wall','Wall');
  t(4,7,'wall','Wall');
  t(5,7,'door','Entrance', {exit:{layer:"settlement",pos:null}});
  t(6,7,'wall','Wall');
  t(7,7,'wall','Wall');
  t(8,7,'wall','Wall');
  t(9,7,'wall','Wall');

  window.SETTLEMENTS["dockmasters_hut"] = {
    map: m,
    name: "Carrowtown Port",
    isInterior: true,
    entryPos: {x:1, y:1},
  };
})();
