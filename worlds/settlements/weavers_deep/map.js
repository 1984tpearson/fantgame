// WEAVER'S DEEP — full settlement map
// 36x36 tiles, walled town. x: -18..18, y: 0..36
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }
  function sdef(x1,y1,x2,y2,type,name){
    for(let x=x1;x<=x2;x++) for(let y=y1;y<=y2;y++) t(x,y,type,name);
  }

  // Walls
  for(let x=-18;x<=18;x++){ t(x,36,'wall','Wall') t(x,0,'wall','Wall') }
  for(let y=0;y<=36;y++){ t(-18,y,'wall','Wall'); t(18,y,'wall','Wall'); }

  // Gates
  t(0,36,'gate','North Gate',{exit:{layer:'overworld',pos:{x:260,y:144}}})
  t(0,0,'gate','South Gate',{exit:{layer:'overworld',pos:{x:260,y:152}}})

  // Streets
  for(let y=1;y<=35;y++) t(0,y,'street','High Street');
  for(let x=-17;x<=17;x++) t(x,18,'street','Cross Road')

  // Districts
  sdef(-8,28,8,34,'market','Market Square')
  sdef(-15,28,-2,34,'building',"Weaver's Hall")
  sdef(2,28,15,34,'building',"Fishmonger's Row")
  sdef(-15,4,-2,16,'building','The Deep Anchor')
  sdef(2,4,15,16,'building',"Tanner's Quarter")

  // Doors
  t(-8,34,'door',"Weaver's Hall",{enter:{layer:'interior',id:'weavers_hall',entryPos:{x:3,y:1}}})
  t(-8,16,'door','The Deep Anchor',{enter:{layer:'interior',id:'weavers_inn',entryPos:{x:2,y:1}}})
  t(8,16,'door',"Tanner's Shop",{enter:{layer:'interior',id:'weavers_tanner',entryPos:{x:1,y:1}}})

  window.SETTLEMENTS['weavers_deep'] = {
    map: m,
    name: "Weaver's Deep",
    hasWalls: true,
    entryPos: {x:0, y:2},
    overworldCell: {x:260, y:148},
    description: '',
  };
})();
