// WEAVER'S DEEP — settlement map stub (edit in map editor)
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }

  for(let x=-18;x<=18;x++){ m[`${x},0`]={type:'wall',name:'Wall'}; m[`${x},36`]={type:'wall',name:'Wall'}; }
  for(let y=0;y<=36;y++){ m[`-18,${y}`]={type:'wall',name:'Wall'}; m[`18,${y}`]={type:'wall',name:'Wall'}; }

  t(0,36,'gate','North Gate',{exit:{layer:'overworld',pos:{x:260,y:146}}});
  t(0,0,'gate','South Gate',{exit:{layer:'overworld',pos:{x:260,y:150}}});

  for(let y=1;y<=35;y++) m[`0,${y}`]={type:'street',name:'High Street'};

  t(-8,34,'door',"Weaver's Hall",{enter:{layer:'interior',id:'weavers_hall',entryPos:{x:3,y:1}}});
  t(-8,16,'door','The Deep Anchor',{enter:{layer:'interior',id:'weavers_inn',entryPos:{x:2,y:1}}});

  window.SETTLEMENTS['weavers_deep'] = {
    map: m,
    name: "Weaver's Deep",
    hasWalls: true,
    entryPos: {x:0, y:34},
    overworldCell: {x:260, y:148},
    description: '',
  };
})();
