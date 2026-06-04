// HIGH-CROWN CASTLE — full settlement map
// 40x40 tiles, walled castle. x: -20..20, y: 0..40
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }
  function sdef(x1,y1,x2,y2,type,name){
    for(let x=x1;x<=x2;x++) for(let y=y1;y<=y2;y++) t(x,y,type,name);
  }

  // Walls
  for(let x=-20;x<=20;x++){ t(x,40,'wall','Outer Wall') t(x,0,'wall','Outer Wall') }
  for(let y=0;y<=40;y++){ t(-20,y,'wall','Outer Wall'); t(20,y,'wall','Outer Wall'); }

  // Gates
  t(0,40,'gate','North Gate',{exit:{layer:'overworld',pos:{x:253,y:392}}})
  t(0,0,'gate','South Gate',{exit:{layer:'overworld',pos:{x:253,y:400}}})

  // Streets
  for(let y=1;y<=39;y++) t(0,y,'street','Castle Road');

  // Districts
  sdef(-18,22,-2,38,'courtyard','Outer Bailey')
  sdef(2,22,18,38,'building','Barracks')
  sdef(-18,2,-2,18,'building','Great Hall')
  sdef(2,2,18,18,'building','Royal Quarters')

  // Doors
  t(-8,38,'door',"Steward's Office",{enter:{layer:'interior',id:'highcrown_steward',entryPos:{x:2,y:1}}})
  t(8,38,'door','Barracks',{enter:{layer:'interior',id:'highcrown_barracks',entryPos:{x:2,y:1}}})
  t(-8,18,'door','Great Hall',{enter:{layer:'interior',id:'highcrown_hall',entryPos:{x:4,y:1}}})
  t(8,18,'door','Royal Quarters',{enter:{layer:'interior',id:'highcrown_royal',entryPos:{x:3,y:1}}})

  window.SETTLEMENTS['high_crown'] = {
    map: m,
    name: 'High-Crown Castle',
    hasWalls: true,
    entryPos: {x:0, y:2},
    overworldCell: {x:253, y:396},
    description: '',
  };
})();
