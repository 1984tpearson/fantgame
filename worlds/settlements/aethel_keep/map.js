// AETHEL-KEEP — full settlement map
// 60x60 tiles, walled city. x: -30..30, y: 0..60
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }
  function sdef(x1,y1,x2,y2,type,name){
    for(let x=x1;x<=x2;x++) for(let y=y1;y<=y2;y++) t(x,y,type,name);
  }

  // Walls
  for(let x=-30;x<=30;x++){ t(x,0,'wall','South Wall'); t(x,60,'wall','North Wall'); }
  for(let y=0;y<=60;y++){ t(-30,y,'wall','West Wall'); t(30,y,'wall','East Wall'); }

  // Gates
  t(0,0,'gate','North Gate',{exit:{layer:'overworld',pos:{x:139,y:257}}});
  t(0,60,'gate','South Gate',{exit:{layer:'overworld',pos:{x:139,y:267}}});
  t(-30,30,'gate','West Gate',{exit:{layer:'overworld',pos:{x:135,y:262}}});
  t(30,30,'gate','East Gate',{exit:{layer:'overworld',pos:{x:143,y:262}}});

  // Streets
  for(let y=1;y<=59;y++) t(0,y,'street',"King's Road");
  for(let x=-29;x<=29;x++) if(!m[`${x},30`]||m[`${x},30`].type!=='wall') t(x,30,'street','Market Way');

  // Districts
  sdef(-20,2,-2,14,'building','South Quarter');
  sdef(2,2,20,14,'docks','Docks Quarter');
  sdef(-25,15,-2,28,'courtyard','Market District');
  sdef(2,15,25,28,'building','Guild District');
  sdef(-25,32,-2,55,'courtyard','Temple District');
  sdef(2,32,25,55,'building','Castle Quarter');

  // Doors
  t(-10,2,'door','The Aethel Arms',{enter:{layer:'interior',id:'aethel_inn',entryPos:{x:2,y:1}}});
  t(10,2,'door','Customs House',{enter:{layer:'interior',id:'aethel_customs',entryPos:{x:2,y:1}}});
  t(-10,15,'door',"Merchants' Exchange",{enter:{layer:'interior',id:'aethel_exchange',entryPos:{x:3,y:1}}});
  t(10,15,'door','Armoury',{enter:{layer:'interior',id:'aethel_armoury',entryPos:{x:2,y:1}}});
  t(-10,35,'door','Temple of the Flame',{enter:{layer:'interior',id:'aethel_temple',entryPos:{x:4,y:1}}});
  t(10,35,'door','Keep Gatehouse',{enter:{layer:'interior',id:'aethel_keep_gate',entryPos:{x:3,y:1}}});

  window.SETTLEMENTS['aethel_keep'] = {
    map: m,
    name: 'Aethel-Keep',
    hasWalls: true,
    entryPos: {x:0, y:2},
    overworldCell: {x:139, y:262},
    description: '',
  };
})();
