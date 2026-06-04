// AETHEL-KEEP — settlement map stub (edit in map editor)
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }

  // Walls
  for(let x=-30;x<=30;x++){ m[`${x},0`]={type:'wall',name:'Wall'}; m[`${x},60`]={type:'wall',name:'Wall'}; }
  for(let y=0;y<=60;y++){ m[`-30,${y}`]={type:'wall',name:'Wall'}; m[`30,${y}`]={type:'wall',name:'Wall'}; }

  // Gates
  t(0,60,'gate','South Gate',{exit:{layer:'overworld',pos:{x:139,y:264}}});
  t(0,0,'gate','North Gate',{exit:{layer:'overworld',pos:{x:139,y:260}}});

  // Main street
  for(let y=1;y<=59;y++) m[`0,${y}`]={type:'street',name:"King's Road"};

  // Doors
  t(-10,58,'door','The Aethel Arms',{enter:{layer:'interior',id:'aethel_inn',entryPos:{x:2,y:1}}});
  t(10,58,'door','Customs House',{enter:{layer:'interior',id:'aethel_customs',entryPos:{x:2,y:1}}});

  window.SETTLEMENTS['aethel_keep'] = {
    map: m,
    name: 'Aethel-Keep',
    hasWalls: true,
    entryPos: {x:0, y:58},
    overworldCell: {x:139, y:262},
    description: '',
  };
})();
