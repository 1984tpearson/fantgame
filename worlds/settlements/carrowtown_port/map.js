// CARROWTOWN PORT -- settlement map
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }

  // MAP CELLS -- edit in map-editor.html

  window.SETTLEMENTS["carrowtown_port"] = {
    map: m,
    name: "Carrowtown Port",
    hasWalls: false,
    entryPos: {x:0, y:2},
    overworldCell: {x:346, y:556},
    description: '',
  };
})();
