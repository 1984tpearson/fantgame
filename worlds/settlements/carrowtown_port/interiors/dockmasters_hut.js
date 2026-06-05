// DOCKMASTERS HUT -- interior map
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }

  for(let x=0;x<=13;x++) for(let y=0;y<=11;y++){
    const v=(x===0||x===13||y===0||y===11)?{type:'wall',name:'Wall'}:{type:'interior',name:'Floor'};
    m[`${x},${y}`]=v;
  }
  m['6,0']={type:'door',name:'Entrance'};

  window.SETTLEMENTS["dockmasters_hut"] = {
    map: m,
    name: "Dockmasters hut",
    isInterior: true,
    entryPos: {x:6, y:1},
  };
})();
