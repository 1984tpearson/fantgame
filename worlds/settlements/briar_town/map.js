// BRIAR-TOWN — settlement map stub (edit in map editor)
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }

  const hw = 25, H = 60;
  for(let x=-hw;x<=hw;x++){ m[`${x},0`]={type:'wall',name:'South Wall'}; m[`${x},${H}`]={type:'wall',name:'North Wall'}; }
  for(let y=0;y<=H;y++){ m[`-${hw},${y}`]={type:'wall',name:'West Wall'}; m[`${hw},${y}`]={type:'wall',name:'East Wall'}; }

  t(0,H,'gate','North Gate',{exit:{layer:'overworld',pos:{x:400,y:437}}});
  t(0,0,'gate','South Gate',{exit:{layer:'overworld',pos:{x:400,y:441}}});

  for(let y=1;y<H;y++) m[`0,${y}`]={type:'street',name:'Morak Street'};

  window.SETTLEMENTS['briar_town'] = {
    map: m,
    name: 'Briar-Town',
    hasWalls: true,
    entryPos: {x:0, y:58},
    overworldCell: {x:400, y:439},
    description: '',
  };
})();
