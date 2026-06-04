// AERDORN — overworld cell definitions
// Edit in map-editor.html (Overworld mode) and save via Save to GitHub
(function(){
  window.WORLD_META = window.WORLD_META || {};
  function defCell(x,y,type,name=''){window.WORLD_META[`${x},${y}`]={type,name};}
  function defRect(x1,y1,x2,y2,type,name=''){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)window.WORLD_META[`${x},${y}`]={type,name};}

  // ── SETTLEMENTS ───────────────────────────────────────────────────────────
  defCell(139,262,'city','Aethel-Keep');
  defCell(260,148,'town',"Weaver's Deep");
  defCell(169,289,'village','Wheatstone');
  defCell(253,396,'castle','High-Crown Castle');
  defCell(311,210,'town','Gladehome');
  defCell(338,414,'town','Sylvanis-Root');
  defCell(400,439,'town','Briar-Town');
  defCell(346,556,'town','East-Port');
  defCell(250,544,'village','Theatfields');
  defCell(190,644,'town','Harvestfell');
  defCell(166,416,'village','Dunesedge');
  defCell(139,462,'village','Saltwell');
  defCell(275,254,'ruins','The Forgotten Archives');
  defCell(305,234,'village','The Weeping Falls');

  // ── SETTLEMENT FOOTPRINTS ─────────────────────────────────────────────────
  const _fp=[
    ['aethel_keep',  136,258,142,266,'city'],
    ['weavers_deep', 258,145,262,151,'town'],
    ['high_crown',   251,393,255,399,'castle'],
    ['gladehome',    310,208,312,212,'town'],
    ['sylvanis_root',337,412,339,416,'town'],
    ['briar_town',   400,439,401,440,'town'],
    ['frilar_town',  346,556,347,557,'town'],
    ['harvestfell',  188,642,192,646,'town'],
    ['theatfields',  249,543,251,545,'village'],
    ['dunesedge',    165,415,167,417,'village'],
    ['saltwell',     138,461,140,463,'village'],
    ['wheatstone',   168,288,170,290,'village'],
  ];
  for(const[sid,x1,y1,x2,y2,t]of _fp)
    for(let _x=x1;_x<=x2;_x++)for(let _y=y1;_y<=y2;_y++)
      window.WORLD_META[`${_x},${_y}`]={type:t,name:sid};

  // ── OCEAN / WATER ─────────────────────────────────────────────────────────
  defRect(175,108,312,118,'ocean','The Whispering Sea');
  defRect(150,750,350,775,'ocean','The Sea of Storms');
  defRect(0,250,50,500,'ocean','Aetherial Ocean');
  defRect(450,250,500,500,'ocean','Aetherial Ocean');

  // ── DOCKS ─────────────────────────────────────────────────────────────────
  defRect(348,556,348,557,'docks','East-Port Harbour');
})();
