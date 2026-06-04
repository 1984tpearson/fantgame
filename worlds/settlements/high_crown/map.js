// HIGH-CROWN CASTLE — settlement map stub (edit in map editor)
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }

  for(let x=-20;x<=20;x++){ m[`${x},0`]={type:'wall',name:'Outer Wall'}; m[`${x},40`]={type:'wall',name:'Outer Wall'}; }
  for(let y=0;y<=40;y++){ m[`-20,${y}`]={type:'wall',name:'Outer Wall'}; m[`20,${y}`]={type:'wall',name:'Outer Wall'}; }

  t(0,40,'gate','North Gate',{exit:{layer:'overworld',pos:{x:253,y:394}}});
  t(0,0,'gate','South Gate',{exit:{layer:'overworld',pos:{x:253,y:398}}});

  for(let y=1;y<=39;y++) m[`0,${y}`]={type:'street',name:'Castle Road'};

  t(-8,38,'door',"Steward's Office",{enter:{layer:'interior',id:'highcrown_steward',entryPos:{x:2,y:1}}});
  t(8,38,'door','Barracks',{enter:{layer:'interior',id:'highcrown_barracks',entryPos:{x:2,y:1}}});
  t(-8,18,'door','Great Hall',{enter:{layer:'interior',id:'highcrown_hall',entryPos:{x:4,y:1}}});

  window.SETTLEMENTS['high_crown'] = {
    map: m,
    name: 'High-Crown Castle',
    hasWalls: true,
    entryPos: {x:0, y:38},
    overworldCell: {x:253, y:396},
    description: '',
  };
})();
