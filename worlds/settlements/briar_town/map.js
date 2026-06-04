// BRIAR-TOWN — settlement map stub
// 50x60 tiles, walled town. x: -25..25, y: 0..60
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }

  const W=50, H=60, hw=25;

  // Walls
  for(let x=-hw;x<=hw;x++){ t(x,0,'wall','South Wall'); t(x,H,'wall','North Wall'); }
  for(let y=0;y<=H;y++){ t(-hw,y,'wall','West Wall'); t(hw,y,'wall','East Wall'); }

  // Gates
  t(0,0,'gate','South Gate',{exit:{layer:'overworld',pos:{x:400,y:440}}});
  t(0,H,'gate','North Gate',{exit:{layer:'overworld',pos:{x:400,y:438}}});
  t(-hw,30,'gate','West Gate',{exit:{layer:'overworld',pos:{x:399,y:439}}});
  t(hw,30,'gate','East Gate',{exit:{layer:'overworld',pos:{x:401,y:439}}});

  // Streets
  for(let y=1;y<H;y++) t(0,y,'street','Morak Street');

  window.SETTLEMENTS['briar_town'] = {
    map: m,
    name: 'Briar-Town',
    hasWalls: true,
    entryPos: {x:0, y:2},
    overworldCell: {x:400, y:439},
    description: '',
  };
})();
