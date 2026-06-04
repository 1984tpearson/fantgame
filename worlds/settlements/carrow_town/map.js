// CARROW TOWN -- settlement map
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }

  // MAP CELLS -- edit in map-editor.html

  window.SETTLEMENTS["carrow_town"] = {
    map: m,
    name: "Carrow town",
    hasWalls: false,
    entryPos: {x:0, y:2},
    overworldCell: {x:346, y:556},
    description: '',
  };
})();
