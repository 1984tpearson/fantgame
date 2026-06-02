// ═══════════════════════════════════════════════════════════════
// mapforge.js — Medieval Pixel Art Sprite Engine
// Extracted from map-forge-3.jsx (BUILD-003 v2.0.0)
// Exports: window.MapForge
// ═══════════════════════════════════════════════════════════════
(function(global) {
'use strict';


// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────
const lerp = (a, b, t) => {
  t = Math.max(0, Math.min(1, t));
  return [0,1,2,3].map(i => Math.round(a[i] + (b[i]-a[i])*t));
};
const jitter = (c, amt=14, rng=Math.random) =>
  [0,1,2].map(i => Math.max(0,Math.min(255,c[i]+Math.round((rng()-0.5)*2*amt)))).concat([255]);
const hex = ([r,g,b,a=255]) => `rgba(${r},${g},${b},${a/255})`;

function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ─── DRAWING PRIMITIVES ───────────────────────────────────────────────────────
function createPixelGrid(w, h) {
  return new Array(h).fill(null).map(() => new Array(w).fill(null));
}
function setPixel(grid, x, y, col) {
  if (x >= 0 && y >= 0 && x < grid[0].length && y < grid.length && col)
    grid[y][x] = col;
}
function getPixel(grid, x, y) {
  if (x >= 0 && y >= 0 && x < grid[0].length && y < grid.length)
    return grid[y][x];
  return null;
}
function tileAlong(u, v, faceCol, darkCol, rng) {
  const tu = (u + (Math.floor(v/3)%2 === 1 ? 2 : 0)) % 4;
  const tv = v % 3;
  if (tu === 0 || tv === 0) return lerp(darkCol, [25,20,15,255], 0.55);
  let base = jitter(faceCol, 18, rng);
  const r = rng();
  // dirt/age patches
  if (r < 0.08) base = lerp(base, [52,42,28,255], rng()*0.4+0.15);
  // moss patches
  else if (r < 0.13) base = lerp(base, [45,62,28,255], rng()*0.35+0.1);
  // lighter weathered tile
  else if (r < 0.17) base = lerp(base, [200,190,160,255], rng()*0.2+0.05);
  // darker worn tile
  else if (r < 0.21) base = lerp(base, [30,22,14,255], rng()*0.3+0.1);
  // occasional streak — slightly different hue along v axis
  if (rng() < 0.04) base = lerp(base, lerp(faceCol,[80,60,30,255],0.3), 0.4);
  return base;
}


// ─── TILE PATTERN FUNCTIONS ───────────────────────────────────────────────────
function tileFishScale(x, y, faceCol, darkCol, rng) {
  // overlapping semicircle fish-scale pattern
  const scaleW=4, scaleH=3;
  const row=Math.floor(y/scaleH);
  const offset=(row%2)*Math.floor(scaleW/2);
  const tx=(x+offset)%scaleW - scaleW/2;
  const ty=y%scaleH;
  const inArc=Math.sqrt(tx*tx+(ty-scaleH)**2)<scaleH*1.1;
  if(tx===0&&ty===0) return lerp(darkCol,[18,14,10,255],0.6);
  let base=jitter(inArc?faceCol:lerp(faceCol,darkCol,0.4),14,rng);
  if(rng()<0.06) base=lerp(base,[50,42,28,255],rng()*0.35+0.15);
  if(rng()<0.04) base=lerp(base,[45,62,28,255],rng()*0.3+0.1);
  return base;
}

function tileDiamond(x, y, faceCol, darkCol, rng) {
  const sz=4;
  const dx=Math.abs((x%sz)-sz/2), dy=Math.abs((y%sz)-sz/2);
  const onLine=dx+dy===Math.floor(sz/2);
  if(onLine) return lerp(darkCol,[18,14,10,255],0.5);
  const t=(dx+dy)/(sz);
  let base=jitter(lerp(faceCol,darkCol,t*0.5),14,rng);
  if(rng()<0.07) base=lerp(base,[52,42,28,255],rng()*0.3+0.15);
  return base;
}

function tileSlate(x, y, faceCol, darkCol, rng) {
  // large irregular flag stones
  const slateW=6, slateH=5;
  const row=Math.floor(y/slateH);
  const off=(row%2)*3;
  const tu=(x+off)%slateW, tv=y%slateH;
  if(tu===0||tv===0) return lerp(darkCol,[20,16,12,255],0.6);
  let base=jitter(faceCol,16,rng);
  if(rng()<0.05) base=lerp(base,[52,42,28,255],rng()*0.4+0.15);
  if(rng()<0.06) base=lerp(base,[45,62,28,255],rng()*0.3+0.1);
  if(rng()<0.03) base=lerp(base,[185,178,158,255],0.2);
  return base;
}

function tileShake(x, y, faceCol, darkCol, rng) {
  // rough wooden shingles — wider, rougher
  const shW=5, shH=4;
  const row=Math.floor(y/shH);
  const off=(row%2)*2;
  const tu=(x+off)%shW, tv=y%shH;
  if(tu===0||tv===0) return lerp(darkCol,[25,18,10,255],0.55);
  let base=jitter(faceCol,18,rng);
  // wood grain
  if((x+(row*3))%7===0) base=lerp(base,[65,45,18,255],0.3);
  if(rng()<0.08) base=lerp(base,[58,38,15,255],rng()*0.4+0.1);
  return base;
}

function tileThatch(x, y, dist, angle, faceCol, darkCol, rng) {
  // straw bundles radiating from ridge — streaky texture
  const streakDir=angle; // follows slope direction
  const streak=(x*Math.cos(streakDir*Math.PI/180)+y*Math.sin(streakDir*Math.PI/180));
  const bundle=Math.floor(streak/2)%3;
  let base=jitter(bundle===0?faceCol:bundle===1?lerp(faceCol,darkCol,0.25):lerp(faceCol,darkCol,0.45),16,rng);
  // straw wisps — random dark streaks
  if(rng()<0.12) base=lerp(base,darkCol,rng()*0.5+0.2);
  if(rng()<0.04) base=lerp(base,[180,155,55,255],0.3); // occasional light straw
  return base;
}

function applyTilePattern(pattern, x, y, u, v, faceCol, darkCol, dist, angle, rng) {
  if(pattern==='fish') return tileFishScale(x,y,faceCol,darkCol,rng);
  if(pattern==='diamond') return tileDiamond(x,y,faceCol,darkCol,rng);
  if(pattern==='slate') return tileSlate(x,y,faceCol,darkCol,rng);
  if(pattern==='shake') return tileShake(x,y,faceCol,darkCol,rng);
  if(pattern==='thatch') return tileThatch(x,y,dist,angle,faceCol,darkCol,rng);
  return tileAlong(u,v,faceCol,darkCol,rng); // default
}

// ─── ROOF SHAPE GENERATORS ────────────────────────────────────────────────────
function makeRoofByShape(w, h, shape, pattern, RL, RM, RD, RS, chimneys, seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(w,h);
  const cx=w/2, cy=h/2;

  if(shape==='hip') {
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const dx=x-cx,dy=y-cy;
      const angle=Math.atan2(dy,dx)*180/Math.PI;
      const dist=Math.min(1,Math.sqrt((dx/cx)**2+(dy/cy)**2));
      let faceBase,u;
      const v=Math.round(dist*Math.min(cx,cy));
      if(angle>=-135&&angle<-45){faceBase=lerp(RL,RM,dist);u=x;}
      else if(angle>=-45&&angle<45){faceBase=lerp(RM,RD,dist);u=y;}
      else if(angle>=45&&angle<135){faceBase=lerp(RD,lerp(RD,RS,0.4),dist);u=x;}
      else{faceBase=lerp(lerp(RM,RD,0.5),RS,dist);u=y;}
      setPixel(grid,x,y,applyTilePattern(pattern,x,y,u,v,faceBase,RS,dist,angle,rng));
    }
    // ridge lines
    [[0,0],[w-1,0],[0,h-1],[w-1,h-1]].forEach(([cx2,cy2])=>{
      const rdx=Math.round(cx)-cx2,rdy=Math.round(cy)-cy2;
      const steps=Math.max(Math.abs(rdx),Math.abs(rdy));
      for(let s=0;s<=steps;s++){
        const t=s/Math.max(1,steps);
        setPixel(grid,Math.round(cx2+rdx*t),Math.round(cy2+rdy*t),lerp(RS,[18,14,10,255],0.4));
      }
    });

  } else if(shape==='ridge') {
    const ridgeY=Math.floor(h/2);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const t=y<ridgeY?y/Math.max(1,ridgeY):(y-ridgeY)/Math.max(1,h-ridgeY);
      const fc=y<ridgeY?lerp(RL,RM,t):lerp(RM,RD,t);
      const dist=t, angle=y<ridgeY?270:90;
      setPixel(grid,x,y,applyTilePattern(pattern,x,y,x,y,fc,RD,dist,angle,rng));
    }
    for(let x=0;x<w;x++){
      setPixel(grid,x,ridgeY,lerp(RS,[18,14,10,255],0.35));
      const ab=getPixel(grid,x,ridgeY-1);
      if(ab) setPixel(grid,x,ridgeY-1,lerp(ab,RS,0.35));
    }

  } else if(shape==='pyramid') {
    // steeper than hip — peak rises faster, faces are more triangular
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const dx=x-cx,dy=y-cy;
      const angle=Math.atan2(dy,dx)*180/Math.PI;
      // pyramid dist — faster falloff toward centre
      const dist=Math.min(1,Math.sqrt((dx/cx)**2+(dy/cy)**2));
      const pDist=dist*dist; // quadratic — steeper
      let faceBase,u;
      const v=Math.round(pDist*Math.min(cx,cy));
      if(angle>=-135&&angle<-45){faceBase=lerp(RL,RS,pDist);u=x;}
      else if(angle>=-45&&angle<45){faceBase=lerp(RM,RD,pDist);u=y;}
      else if(angle>=45&&angle<135){faceBase=lerp(RD,RS,pDist);u=x;}
      else{faceBase=lerp(lerp(RM,RD,0.6),RS,pDist);u=y;}
      setPixel(grid,x,y,applyTilePattern(pattern,x,y,u,v,faceBase,RS,pDist,angle,rng));
    }
    // single peak pixel
    setPixel(grid,Math.round(cx),Math.round(cy),lerp(RS,[12,8,5,255],0.5));

  } else if(shape==='mansard') {
    // flat centre plateau + steep outer band
    const flatR=0.45; // inner flat zone
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const dx=x-cx,dy=y-cy;
      const angle=Math.atan2(dy,dx)*180/Math.PI;
      const rawDist=Math.sqrt((dx/cx)**2+(dy/cy)**2);
      const dist=Math.min(1,rawDist);
      if(rawDist<=flatR){
        // flat centre — uniform mid tone with subtle texture
        setPixel(grid,x,y,applyTilePattern(pattern,x,y,x,y,RM,RD,0.3,0,rng));
      } else {
        // steep outer band — strong shading
        const bandDist=(rawDist-flatR)/(1-flatR);
        let faceBase;
        if(angle>=-135&&angle<-45) faceBase=lerp(RL,RD,bandDist);
        else if(angle>=-45&&angle<45) faceBase=lerp(RM,RS,bandDist);
        else if(angle>=45&&angle<135) faceBase=lerp(RD,RS,bandDist*1.2);
        else faceBase=lerp(lerp(RM,RD,0.5),RS,bandDist);
        const u=Math.abs(angle)<45||Math.abs(angle)>135?y:x;
        setPixel(grid,x,y,applyTilePattern(pattern,x,y,u,Math.round(bandDist*8),faceBase,RS,bandDist,angle,rng));
      }
    }
    // flat roof edge line
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const dx=x-cx,dy=y-cy,rawDist=Math.sqrt((dx/cx)**2+(dy/cy)**2);
      if(rawDist>=flatR-0.05&&rawDist<=flatR+0.05) setPixel(grid,x,y,lerp(RS,[18,14,10,255],0.5));
    }

  } else if(shape==='gambrel') {
    // two pitches per side — lower steep band, upper shallow band
    // ridge runs horizontally (like ridge but each half has a knee)
    const ridgeY=Math.floor(h/2);
    const kneeOffset=Math.floor(h*0.2); // where pitch changes
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      let t,fc,angle;
      if(y<ridgeY){
        const fromRidge=ridgeY-y;
        if(fromRidge<=kneeOffset){
          t=fromRidge/kneeOffset;
          fc=lerp(RL,RM,t*0.5); angle=270;
        } else {
          t=(fromRidge-kneeOffset)/(ridgeY-kneeOffset);
          fc=lerp(RM,RD,t); angle=270;
        }
      } else {
        const fromRidge=y-ridgeY;
        if(fromRidge<=kneeOffset){
          t=fromRidge/kneeOffset;
          fc=lerp(RL,RM,t*0.5); angle=90;
        } else {
          t=(fromRidge-kneeOffset)/(h-ridgeY-kneeOffset);
          fc=lerp(RM,RD,t); angle=90;
        }
      }
      setPixel(grid,x,y,applyTilePattern(pattern,x,y,x,y,fc,RD,t,angle,rng));
    }
    // ridge and knee lines
    for(let x=0;x<w;x++){
      setPixel(grid,x,ridgeY,lerp(RS,[18,14,10,255],0.35));
      setPixel(grid,x,ridgeY-kneeOffset,lerp(RS,[18,14,10,255],0.25));
      setPixel(grid,x,ridgeY+kneeOffset,lerp(RS,[18,14,10,255],0.25));
    }

  } else if(shape==='conical') {
    // circular cone — for towers
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const dx=x-cx,dy=y-cy;
      const angle=Math.atan2(dy,dx)*180/Math.PI;
      const dist=Math.min(1,Math.sqrt((dx/cx)**2+(dy/cy)**2));
      // cone shading: bright top-left, dark bottom-right
      const lt=(dx/cx*0.3+dy/cy*0.4)*0.5+0.5;
      const faceBase=lerp(RL,RS,lt*dist+(1-dist)*0.1);
      const v=Math.round(dist*Math.min(cx,cy));
      setPixel(grid,x,y,applyTilePattern(pattern,x,y,Math.round(angle),v,faceBase,RS,dist,angle,rng));
    }
    // spiral ridge line
    for(let a=0;a<720;a+=8){
      const rad=a*Math.PI/180;
      const spiralR=(a/720)*Math.min(cx,cy);
      const sx=Math.round(cx+Math.cos(rad)*spiralR);
      const sy=Math.round(cy+Math.sin(rad)*spiralR);
      if(sx>=0&&sx<w&&sy>=0&&sy<h) setPixel(grid,sx,sy,lerp(RS,[18,14,10,255],0.3));
    }
  }

  // chimneys
  chimneys.forEach(([chx,chy])=>{
    for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++)
      setPixel(grid,chx+dx,chy+dy,(dx||dy)?[70,62,54,255]:[45,38,33,255]);
    setPixel(grid,chx+1,chy-1,[98,88,74,255]);
  });
  return grid;
}

// Thatch roof — separate generator
function makeThatchRoof(w, h, shape, chimneys, seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(w,h);
  const cx=w/2, cy=h/2;
  const TL=[198,172,80,255],TM=[168,140,54,255],TD=[128,104,34,255],TS=[90,70,20,255];

  // Draw a single straw strand — short diagonal line
  const strand=(x,y,col)=>{
    setPixel(grid,x,y,col);
    if(x+1<w&&y+1<h) setPixel(grid,x+1,y+1,lerp(col,TS,0.2));
  };

  // Fill a face with parallel straw streaks running down-slope
  const fillFace=(x0,y0,x1,y1,x2,y2,lightCol,darkCol)=>{
    // Bounding box
    const minX=Math.max(0,Math.min(x0,x1,x2));
    const maxX=Math.min(w-1,Math.max(x0,x1,x2));
    const minY=Math.max(0,Math.min(y0,y1,y2));
    const maxY=Math.min(h-1,Math.max(y0,y1,y2));
    for(let y=minY;y<=maxY;y++) for(let x=minX;x<=maxX;x++){
      // Point-in-triangle test
      const d1=(x-x1)*(y0-y1)-(x0-x1)*(y-y1);
      const d2=(x-x2)*(y1-y2)-(x1-x2)*(y-y2);
      const d3=(x-x0)*(y2-y0)-(x2-x0)*(y-y0);
      const hasNeg=(d1<0)||(d2<0)||(d3<0);
      const hasPos=(d1>0)||(d2>0)||(d3>0);
      if(hasNeg&&hasPos) continue;
      // Distance from apex (tip) — lighter at top, darker toward eave
      const tipDist=Math.sqrt((x-x0)**2+(y-y0)**2);
      const maxDist=Math.sqrt((x2-x0)**2+(y2-y0)**2);
      const t=Math.min(1,tipDist/Math.max(1,maxDist));
      let c=lerp(lightCol,darkCol,t);
      c=jitter(c,14,rng);
      // Straw strand lines — run parallel to slope direction
      const slopeX=x2-x0, slopeY=y2-y0;
      const slopeLen=Math.sqrt(slopeX*slopeX+slopeY*slopeY);
      const perpX=-slopeY/slopeLen, perpY=slopeX/slopeLen;
      const perpDist=Math.round((x*perpX+y*perpY)*3)%3;
      if(perpDist===0) c=lerp(c,TS,0.35);
      else if(perpDist===1) c=lerp(c,TL,0.1);
      // Random wisps
      if(rng()<0.08) c=lerp(c,TS,rng()*0.4+0.2);
      if(rng()<0.03) c=lerp(c,[215,192,75,255],0.3);
      setPixel(grid,x,y,c);
    }
  };

  if(shape==='ridge'||shape==='gambrel') {
    const ridgeY=Math.floor(h/2);
    // Top face: ridge down to top edge
    fillFace(0,ridgeY, w-1,ridgeY, Math.floor(w/2),0, TL,TM);
    fillFace(w-1,ridgeY, 0,ridgeY, Math.floor(w/2),0, TL,TM);
    // Bottom face: ridge down to bottom edge
    fillFace(0,ridgeY, w-1,ridgeY, Math.floor(w/2),h-1, TM,TD);
    fillFace(w-1,ridgeY, 0,ridgeY, Math.floor(w/2),h-1, TM,TD);
    // Solid fill for any missed pixels
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(!grid[y][x]) setPixel(grid,x,y,jitter(y<ridgeY?TM:TD,14,rng));
    // Ridge cap — thick ragged bundle
    for(let x=0;x<w;x++){
      setPixel(grid,x,ridgeY,jitter(TS,6,rng));
      setPixel(grid,x,ridgeY-1,jitter(TD,8,rng));
      setPixel(grid,x,ridgeY+1,jitter(TD,8,rng));
      if(rng()<0.35) setPixel(grid,x+Math.round((rng()-0.5)*2),ridgeY-2,jitter(TM,12,rng));
      if(rng()<0.35) setPixel(grid,x+Math.round((rng()-0.5)*2),ridgeY+2,jitter(TM,12,rng));
    }
  } else {
    // Hip/pyramid/mansard — 4 triangular faces from corners to centre
    const tip=[Math.round(cx),Math.round(cy)];
    // Top face
    fillFace(tip[0],tip[1], 0,0, w-1,0, TL,TM);
    // Bottom face
    fillFace(tip[0],tip[1], 0,h-1, w-1,h-1, TD,TS);
    // Left face
    fillFace(tip[0],tip[1], 0,0, 0,h-1, lerp(TM,TD,0.5),TD);
    // Right face
    fillFace(tip[0],tip[1], w-1,0, w-1,h-1, lerp(TM,TD,0.3),TD);
    // Fill any missed pixels
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(!grid[y][x]) setPixel(grid,x,y,jitter(TM,14,rng));
    // Ridge cap at tip
    for(let r=0;r<4;r++) for(let a=0;a<360;a+=15){
      const rad=a*Math.PI/180;
      const rx=Math.round(tip[0]+Math.cos(rad)*r), ry=Math.round(tip[1]+Math.sin(rad)*r);
      if(rx>=0&&rx<w&&ry>=0&&ry<h) setPixel(grid,rx,ry,jitter(r<2?TS:TD,8,rng));
    }
  }
  // Eave overhang hint — slightly darker bottom row
  for(let x=0;x<w;x++) setPixel(grid,x,h-1,jitter(TS,6,rng));
  for(let y=0;y<h;y++) setPixel(grid,0,y,jitter(TD,8,rng));

  chimneys.forEach(([chx,chy])=>{
    for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++)
      setPixel(grid,chx+dx,chy+dy,(dx||dy)?[70,62,54,255]:[45,38,33,255]);
    setPixel(grid,chx+1,chy-1,[98,88,74,255]);
  });
  return grid;
}

// ─── ROOF GENERATORS ─────────────────────────────────────────────────────────
function makeHipRoof(w, h, RL, RM, RD, RS, chimneys, seed) {
  const rng = mulberry32(seed);
  const grid = createPixelGrid(w, h);
  const cx = w/2, cy = h/2;
  for (let y=0;y<h;y++) {
    for (let x=0;x<w;x++) {
      const dx=x-cx, dy=y-cy;
      const angle=Math.atan2(dy,dx)*180/Math.PI;
      const dist=Math.min(1,Math.sqrt((dx/cx)**2+(dy/cy)**2));
      let faceBase, u;
      const v=Math.round(dist*Math.min(cx,cy));
      if (angle>=-135&&angle<-45)      { faceBase=lerp(RL,RM,dist); u=x; }
      else if (angle>=-45&&angle<45)   { faceBase=lerp(RM,RD,dist); u=y; }
      else if (angle>=45&&angle<135)   { faceBase=lerp(RD,lerp(RD,RS,0.4),dist); u=x; }
      else                              { faceBase=lerp(lerp(RM,RD,0.5),RS,dist); u=y; }
      setPixel(grid,x,y,tileAlong(u,v,faceBase,RS,rng));
    }
  }
  [[0,0],[w-1,0],[0,h-1],[w-1,h-1]].forEach(([cx2,cy2])=>{
    const dx=Math.round(cx)-cx2, dy=Math.round(cy)-cy2;
    const steps=Math.max(Math.abs(dx),Math.abs(dy));
    for (let s=0;s<=steps;s++) {
      const t=s/Math.max(1,steps);
      setPixel(grid,Math.round(cx2+dx*t),Math.round(cy2+dy*t),lerp(RS,[18,14,10,255],0.4));
    }
  });
  chimneys.forEach(([chx,chy])=>{
    for (let dx=-1;dx<=1;dx++) for (let dy=-1;dy<=1;dy++)
      setPixel(grid,chx+dx,chy+dy,(dx||dy)?[70,62,54,255]:[45,38,33,255]);
    setPixel(grid,chx+1,chy-1,[98,88,74,255]);
  });
  return grid;
}

function makeRidgeRoof(w, h, RL, RM, RD, RS, chimneys, seed) {
  const rng = mulberry32(seed);
  const grid = createPixelGrid(w, h);
  const ridgeY = Math.floor(h/2);
  for (let y=0;y<h;y++) {
    for (let x=0;x<w;x++) {
      const t=y<ridgeY?y/Math.max(1,ridgeY):(y-ridgeY)/Math.max(1,h-ridgeY);
      const fc=y<ridgeY?lerp(RL,RM,t):lerp(RM,RD,t);
      setPixel(grid,x,y,tileAlong(x,y,fc,RD,rng));
    }
  }
  for (let x=0;x<w;x++) {
    setPixel(grid,x,ridgeY,lerp(RS,[18,14,10,255],0.35));
    const ab=getPixel(grid,x,ridgeY-1);
    if (ab) setPixel(grid,x,ridgeY-1,lerp(ab,RS,0.35));
  }
  chimneys.forEach(([chx,chy])=>{
    for (let dx=-1;dx<=1;dx++) for (let dy=-1;dy<=1;dy++)
      setPixel(grid,chx+dx,chy+dy,(dx||dy)?[70,62,54,255]:[45,38,33,255]);
    setPixel(grid,chx+1,chy-1,[98,88,74,255]);
  });
  return grid;
}

// Auto-place chimneys based on roof size
function autoChimneys(w, h, count) {
  const chimneys = [];
  if (count === 0) return chimneys;
  if (count === 1) return [[Math.floor(w*0.35), Math.floor(h*0.3)]];
  if (count >= 2) {
    chimneys.push([Math.floor(w*0.25), Math.floor(h*0.28)]);
    chimneys.push([Math.floor(w*0.72), Math.floor(h*0.28)]);
  }
  return chimneys;
}

// ─── YARD GENERATOR ──────────────────────────────────────────────────────────
function makeYard(w, h, seed) {
  const rng = mulberry32(seed);
  const grid = createPixelGrid(w, h);

  // Grass base
  const G1=[55,82,38,255], G2=[70,100,48,255], G3=[42,68,28,255];
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
    const r=rng();
    setPixel(grid,x,y,jitter(r<0.3?G2:r<0.6?G1:G3,10,rng));
  }

  // Occasional bare patches
  for (let i=0;i<3;i++) {
    const bx=Math.floor(rng()*w), by=Math.floor(rng()*h);
    if (rng()<0.4) setPixel(grid,bx,by,jitter([105,80,50,255],12,rng));
  }

  // Path from building edge — randomly dirt or cobble
  const useCobblePath = rng()<0.4;
  const pathW = Math.max(3, Math.floor(w*0.2));
  const pathX = Math.floor((w-pathW)/2);
  for (let x=pathX;x<pathX+pathW;x++) {
    for (let y=0;y<h;y++) {
      if (useCobblePath) {
        // cobble path
        const S1=[122,118,110,255],S2=[100,96,88,255],SJ=[72,68,62,255];
        const row=Math.floor(y/3), off=(row%2)*(2);
        const tu=(x+off)%4, tv=y%3;
        setPixel(grid,x,y,(tu===0||tv===0)?SJ:jitter(rng()<0.5?S1:S2,8,rng));
      } else {
        // dirt path
        let c=jitter([118,92,55,255],14,rng);
        if (rng()<0.08) c=jitter([138,115,80,255],8,rng); // pebble
        setPixel(grid,x,y,c);
      }
    }
  }
  // Path edge lines
  for (let y=0;y<h;y++) {
    setPixel(grid,pathX,y,jitter([88,72,45,255],6,rng));
    setPixel(grid,pathX+pathW-1,y,jitter([88,72,45,255],6,rng));
  }

  // Scatter flowers near edges (muted colours)
  const flowerCols=[
    [188,155,100,255], // pale yellow
    [168,125,138,255], // dusty rose
    [138,158,105,255], // sage
    [155,138,88,255],  // ochre
    [125,145,158,255], // slate blue
  ];
  const numFlowers = 3 + Math.floor(rng()*5);
  for (let i=0;i<numFlowers;i++) {
    const fx=1+Math.floor(rng()*(w-2)), fy=1+Math.floor(rng()*(h-2));
    // avoid path
    if (fx>=pathX-1&&fx<=pathX+pathW) continue;
    const fc=flowerCols[Math.floor(rng()*flowerCols.length)];
    setPixel(grid,fx,fy,jitter(fc,14,rng));
    // stem
    if (fy+1<h) setPixel(grid,fx,fy+1,jitter([55,85,38,255],8,rng));
  }

  // Props — expanded set, pick 2-4
  const propTypes=['fence','barrel','bush','garden','well_sm','cart','log','stone','flower_cluster','trough_sm'];
  const numProps = 2 + Math.floor(rng()*3);
  for (let i=0;i<numProps;i++) {
    const prop=propTypes[Math.floor(rng()*propTypes.length)];
    const side = rng()<0.5 ? 0 : 1;
    const px = Math.max(1, side===0
      ? 1 + Math.floor(rng()*Math.max(1,pathX-3))
      : pathX+pathW+1+Math.floor(rng()*Math.max(1,w-pathX-pathW-4)));
    const py = 1 + Math.floor(rng()*Math.max(1,h-5));

    if (px>=w-2||py>=h-2) continue;

    if (prop==='fence') {
      const fL=Math.min(6,w-px-1);
      for (let fx=0;fx<fL;fx++) {
        setPixel(grid,px+fx,py,jitter([118,88,48,255],8,rng));
        if (fx%2===0&&py>0) setPixel(grid,px+fx,py-1,jitter([100,72,38,255],8,rng));
      }
    } else if (prop==='barrel') {
      const BD=[85,52,22,255],BL=[132,85,42,255];
      for (let dx=0;dx<3;dx++) for (let dy=0;dy<3;dy++) {
        const t=(dx===0||dx===2)?0.8:(dx===1&&dy===1)?0.2:0.5;
        setPixel(grid,px+dx,py+dy,lerp(BL,BD,t));
      }
      setPixel(grid,px+1,py,jitter([152,105,52,255],6,rng));
    } else if (prop==='bush') {
      const BG=[38,95,32,255],BGL=[58,122,45,255];
      for (let dx=-1;dx<=1;dx++) for (let dy=-1;dy<=1;dy++)
        if (Math.abs(dx)+Math.abs(dy)<=1||rng()<0.45)
          setPixel(grid,px+dx+1,py+dy+1,jitter(rng()<0.4?BGL:BG,12,rng));
    } else if (prop==='garden') {
      for (let dx=0;dx<4;dx++) for (let dy=0;dy<3;dy++)
        setPixel(grid,px+dx,py+dy,jitter([95,65,35,255],10,rng));
      for (let dx=0;dx<4;dx+=2) setPixel(grid,px+dx,py,jitter([62,128,48,255],14,rng));
    } else if (prop==='well_sm') {
      const WS=[125,118,108,255],WD=[85,78,70,255];
      for (let dx=0;dx<4;dx++) for (let dy=0;dy<4;dy++) {
        const d=Math.sqrt((dx-1.5)**2+(dy-1.5)**2);
        if (d<2) setPixel(grid,px+dx,py+dy,d>1.2?jitter(WS,8,rng):jitter([55,105,148,255],12,rng));
      }
    } else if (prop==='cart') {
      const WD=[95,62,28,255],WL=[130,88,45,255];
      for (let dx=0;dx<5;dx++) { setPixel(grid,px+dx,py+2,WD); setPixel(grid,px+dx,py+3,WL); }
      setPixel(grid,px,py+1,WD); setPixel(grid,px,py+2,WD);
      setPixel(grid,px+4,py+1,WD); setPixel(grid,px+4,py+2,WD);
    } else if (prop==='log') {
      for (let dx=0;dx<4;dx++) setPixel(grid,px+dx,py,jitter([105,68,30,255],12,rng));
      setPixel(grid,px,py,jitter([85,52,22,255],8,rng));
      setPixel(grid,px+3,py,[72,45,18,255]);
    } else if (prop==='stone') {
      const SC=[128,122,112,255];
      for (let dx=0;dx<2;dx++) for (let dy=0;dy<2;dy++)
        setPixel(grid,px+dx,py+dy,jitter(SC,12,rng));
    } else if (prop==='flower_cluster') {
      const fc=flowerCols[Math.floor(rng()*flowerCols.length)];
      for (let dx=0;dx<3;dx++) {
        if (rng()<0.7) setPixel(grid,px+dx,py,jitter(fc,16,rng));
        if (rng()<0.5&&py+1<h) setPixel(grid,px+dx,py+1,jitter([55,85,38,255],8,rng));
      }
    } else if (prop==='trough_sm') {
      for (let dx=0;dx<4;dx++) setPixel(grid,px+dx,py,jitter([108,75,38,255],8,rng));
      for (let dx=1;dx<3;dx++) setPixel(grid,px+dx,py,jitter([52,98,138,255],10,rng));
    }
  }

  return grid;
}

// ─── COMPOSITE: BUILDING + YARD ───────────────────────────────────────────────
function composeWithYard(roofGrid, roofW, roofH, yardPos, totalW, totalH, roofStyle, seed) {
  const finalGrid = createPixelGrid(totalW, totalH);

  // Figure out where roof and yard go
  let roofOffX=0, roofOffY=0, yardOffX=0, yardOffY=0, yardW, yardH;
  if (yardPos==='bottom')  { roofOffX=0;      roofOffY=0;      yardOffX=0;      yardOffY=roofH; yardW=totalW; yardH=totalH-roofH; }
  if (yardPos==='top')     { roofOffX=0;      roofOffY=totalH-roofH; yardOffX=0; yardOffY=0;    yardW=totalW; yardH=totalH-roofH; }
  if (yardPos==='right')   { roofOffX=0;      roofOffY=0;      yardOffX=roofW;  yardOffY=0;     yardW=totalW-roofW; yardH=totalH; }
  if (yardPos==='left')    { roofOffX=totalW-roofW; roofOffY=0; yardOffX=0;    yardOffY=0;      yardW=totalW-roofW; yardH=totalH; }

  // Draw yard first
  const yard = makeYard(yardW, yardH, seed+1);
  for (let y=0;y<yardH;y++) for (let x=0;x<yardW;x++) {
    const col=yard[y]?.[x];
    if (col) finalGrid[yardOffY+y][yardOffX+x]=col;
  }

  // Draw roof on top
  for (let y=0;y<roofH;y++) for (let x=0;x<roofW;x++) {
    const col=roofGrid[y]?.[x];
    if (col) finalGrid[roofOffY+y][roofOffX+x]=col;
  }

  return finalGrid;
}

// ─── TREE GENERATORS ─────────────────────────────────────────────────────────
function makeTopDownTree(w, h, type, seed) {
  const rng = mulberry32(seed);
  const grid = createPixelGrid(w, h);
  const cx=Math.floor(w/2), cy=Math.floor(h/2);
  const palettes = {
    oak:  {e:[30,80,25,255],m:[55,120,45,255],l:[85,155,60,255],h:[115,180,70,255]},
    pine: {e:[20,60,20,255],m:[40,100,40,255],l:[70,140,50,255],h:[100,170,50,255]},
    dead: {e:[55,40,25,255],m:[85,65,40,255],l:[120,95,60,255],h:[150,120,80,255]},
    palm: {e:[25,90,25,255],m:[50,140,50,255],l:[90,190,70,255],h:[120,210,90,255]},
  };
  const p=palettes[type]||palettes.oak;
  const rx=w/2-1, ry=h/2-1;
  if (type==='dead') {
    for (let angle=0;angle<360;angle+=45) {
      const rad=angle*Math.PI/180, len=Math.min(rx,ry)*0.9;
      for (let d=1;d<=len;d++) {
        const x=Math.round(cx+Math.cos(rad)*d), y=Math.round(cy+Math.sin(rad)*d);
        setPixel(grid,x,y,lerp(p.l,p.e,d/len));
        if (d>len*0.3&&d<len*0.7&&rng()<0.3) {
          const br=rad+(rng()-0.5)*1.2;
          for (let bd=1;bd<=3;bd++) setPixel(grid,Math.round(x+Math.cos(br)*bd),Math.round(y+Math.sin(br)*bd),p.m);
        }
      }
    }
    setPixel(grid,cx,cy,p.m); setPixel(grid,cx+1,cy,p.m);
  } else if (type==='palm') {
    const nf=6+Math.floor(rng()*4);
    for (let i=0;i<nf;i++) {
      const angle=(i/nf)*Math.PI*2+rng()*0.3, len=Math.min(rx,ry)*0.85;
      for (let d=1;d<=len;d++) {
        const x=Math.round(cx+Math.cos(angle)*d), y=Math.round(cy+Math.sin(angle)*d);
        setPixel(grid,x,y,lerp(p.l,p.e,d/len));
        if (d<len*0.7) {
          const s=angle+Math.PI/2;
          setPixel(grid,Math.round(x+Math.cos(s)*0.5),Math.round(y+Math.sin(s)*0.5),p.m);
        }
      }
    }
    for (let dx=-1;dx<=1;dx++) for (let dy=-1;dy<=1;dy++) setPixel(grid,cx+dx,cy+dy,[130,90,40,255]);
  } else {
    for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
      const dx=x-cx, dy=y-cy, dist=Math.sqrt(dx*dx+dy*dy), maxR=Math.min(rx,ry);
      if (dist<=maxR) {
        let col=lerp(p.h,p.e,dist/maxR);
        col=jitter(col,10,rng);
        if (rng()<0.06) col=lerp(col,[50,65,30,255],0.3);
        setPixel(grid,x,y,col);
      }
    }
    if (type==='pine') {
      for (let angle=0;angle<360;angle+=45) {
        const rad=angle*Math.PI/180;
        for (let d=Math.min(rx,ry)*0.4;d<=Math.min(rx,ry);d++) {
          const x=Math.round(cx+Math.cos(rad)*d), y=Math.round(cy+Math.sin(rad)*d);
          const ex=getPixel(grid,x,y);
          if (ex) setPixel(grid,x,y,lerp(ex,p.e,0.5));
        }
      }
    }
  }
  return grid;
}

// ─── NATURE & EXTRAS ─────────────────────────────────────────────────────────
function makeRock(w, h, type, seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(w,h);
  const cx=Math.floor(w/2), cy=Math.floor(h/2);
  const pals={small:{l:[170,165,158,255],m:[130,125,118,255],d:[90,85,80,255],s:[55,50,46,255]},boulder:{l:[155,150,142,255],m:[115,110,104,255],d:[80,75,70,255],s:[45,42,38,255]},mossy:{l:[140,148,120,255],m:[105,112,88,255],d:[72,80,58,255],s:[42,48,32,255]}};
  const p=pals[type]||pals.small, rx=w/2-1, ry=h/2-1;
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
    const dx=x-cx+rng()*1.5-0.75, dy=y-cy+rng()*1.5-0.75;
    const dist=Math.sqrt((dx/rx)**2+(dy/ry)**2);
    if (dist<=1) {
      const lt=(dx/rx*0.4+dy/ry*0.4)*0.5+0.5;
      let col=lerp(p.l,p.d,lt*dist+dist*0.3);
      col=jitter(col,8,rng);
      if (type==='mossy'&&rng()<0.15) col=lerp(col,[60,80,40,255],0.3);
      setPixel(grid,x,y,col);
    }
  }
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
    const ex=getPixel(grid,x,y);
    if (ex&&(!getPixel(grid,x+1,y)||!getPixel(grid,x,y+1))) setPixel(grid,x,y,lerp(ex,p.s,0.5));
  }
  return grid;
}

function makePond(w, h, seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(w,h);
  const cx=Math.floor(w/2), cy=Math.floor(h/2), rx=w/2-1, ry=h/2-1;
  const water=[[80,130,170,255],[60,110,155,255],[45,95,140,255],[100,150,185,255]];
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
    const dx=x-cx+rng()*2-1, dy=y-cy+rng()*2-1;
    const dist=Math.sqrt((dx/rx)**2+(dy/ry)**2);
    if (dist<=1) {
      if (dist>0.8) setPixel(grid,x,y,jitter([55,90,70,255],12,rng));
      else {
        let col=jitter(water[Math.floor(rng()*water.length)],10,rng);
        if ((x+y)%6===0) col=lerp(col,[180,210,230,255],0.2);
        if (rng()<0.04) col=[60,140,60,255];
        setPixel(grid,x,y,col);
      }
    }
  }
  return grid;
}

function makeWell(w, h, seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(w,h);
  const cx=Math.floor(w/2), cy=Math.floor(h/2);
  const SW=[140,130,120,255],SD=[90,82,75,255];
  const ro=Math.floor(w/2)-1, ri=Math.floor(w/2)-3;
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
    const dx=x-cx, dy=y-cy, dist=Math.sqrt(dx*dx+dy*dy);
    if (dist<=ro&&dist>=ri) setPixel(grid,x,y,jitter(lerp(SW,SD,(dx/ro*0.5+dy/ro*0.5)*0.5+0.5),8,rng));
    else if (dist<ri) setPixel(grid,x,y,jitter([60,110,155,255],12,rng));
  }
  for (let x=cx-1;x<=cx+1;x++) { for (let y=1;y<=3;y++) setPixel(grid,x,y,[140,95,50,255]); setPixel(grid,x,0,[101,67,33,255]); }
  return grid;
}

function makeHaystack(w, h, seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(w,h);
  const cx=Math.floor(w/2), cy=Math.floor(h/2), rx=w/2-1, ry=h/2-2;
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
    const dx=x-cx, dy=y-cy, dist=Math.sqrt((dx/rx)**2+(dy/ry)**2);
    if (dist<=1) {
      const lt=(dx/rx*0.3+dy/ry*0.4)*0.5+0.5;
      let col=lerp([210,180,80,255],[140,108,30,255],lt*dist+dist*0.2);
      col=jitter(col,14,rng);
      if ((x+Math.floor(y/2))%3===0) col=lerp(col,[90,65,15,255],0.2);
      setPixel(grid,x,y,col);
    }
  }
  return grid;
}

function makeGraveyard(w, h, seed, _style, floor='grass') {
  const rng=mulberry32(seed), grid=createPixelGrid(w,h);
  const stone=[128,122,114,255], stoneL=[158,152,142,255], stoneD=[82,78,72,255];
  const dirt=[95,72,48,255], dirtD=[72,52,32,255];

  // Floor base
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
    let c;
    if (floor==='grass') {
      const r=rng();
      c=jitter(r<0.25?[68,98,46,255]:r<0.6?[52,78,38,255]:[38,60,26,255],10,rng);
    } else if (floor==='dirt') {
      c=jitter(rng()<0.4?[108,82,50,255]:rng()<0.6?[92,68,40,255]:[78,56,32,255],12,rng);
    } else if (floor==='worn') {
      // patchy mix of grass and bare dirt
      const r=rng();
      if (r<0.35) c=jitter([52,78,38,255],10,rng);
      else if (r<0.55) c=jitter([95,72,48,255],12,rng);
      else if (r<0.75) c=jitter([42,65,28,255],10,rng);
      else c=jitter([78,56,32,255],12,rng);
      // extra bare patches
      if (rng()<0.08) c=jitter([118,90,55,255],14,rng);
    } else if (floor==='cobble') {
      const S1=[115,110,102,255],S2=[95,90,83,255],SJ=[62,58,52,255];
      const row=Math.floor(y/3), off=(row%2)*2;
      const tu=(x+off)%4, tv=y%3;
      c=(tu===0||tv===0)?SJ:jitter(rng()<0.5?S1:S2,8,rng);
    } else {
      c=jitter([52,78,38,255],10,rng);
    }
    setPixel(grid,x,y,c);
  }

  // Dirt path running down the middle
  const pathX=Math.floor(w/2)-1;
  for (let y=2;y<h-2;y++) for (let dx=0;dx<3;dx++)
    setPixel(grid,pathX+dx,y,jitter(rng()<0.3?dirtD:dirt,10,rng));

  // Grid layout
  const slotW=7, slotH=8, gapX=2, gapY=3;
  const colsLeft=Math.floor((pathX-2)/(slotW+gapX));
  const colsRight=Math.floor((w-pathX-4)/(slotW+gapX));
  const rows=Math.floor((h-4)/(slotH+gapY));

  const drawGrave=(gx,gy)=>{
    for (let dx=0;dx<slotW;dx++) for (let dy=2;dy<slotH;dy++)
      setPixel(grid,gx+dx,gy+dy,jitter([85,62,40,255],10,rng));
    const hx=gx+Math.floor((slotW-3)/2), hy=gy;
    for (let dx=0;dx<3;dx++) for (let dy=1;dy<4;dy++)
      setPixel(grid,hx+dx,hy+dy,jitter(stone,8,rng));
    setPixel(grid,hx+1,hy,jitter(stoneL,6,rng));
    setPixel(grid,hx,hy+1,jitter(stone,6,rng));
    setPixel(grid,hx+2,hy+1,jitter(stone,6,rng));
    for (let dy=1;dy<4;dy++) setPixel(grid,hx+2,hy+dy,jitter(stoneD,6,rng));
    setPixel(grid,hx,hy+3,jitter(stoneD,6,rng));
    setPixel(grid,hx+1,hy+3,jitter(stoneD,6,rng));
  };

  for (let col=0;col<colsLeft;col++) {
    const gx=2+col*(slotW+gapX);
    for (let row=0;row<rows;row++) {
      if (rng()<0.15) continue;
      const gy=2+row*(slotH+gapY);
      if (gx+slotW<pathX-1&&gy+slotH<h-2) drawGrave(gx,gy);
    }
  }
  for (let col=0;col<colsRight;col++) {
    const gx=pathX+4+col*(slotW+gapX);
    for (let row=0;row<rows;row++) {
      if (rng()<0.15) continue;
      const gy=2+row*(slotH+gapY);
      if (gx+slotW<w-2&&gy+slotH<h-2) drawGrave(gx,gy);
    }
  }

  return grid;
}

// ─── EXTRAS GENERATORS ───────────────────────────────────────────────────────
function makeCampfire(seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(16,16);
  // log ring
  const logs=[[5,9],[6,10],[7,10],[8,10],[9,9],[9,8],[8,8],[7,8],[6,8],[5,8]];
  logs.forEach(([x,y])=>setPixel(grid,x,y,jitter([101,67,33,255],10,rng)));
  // ember glow
  [[7,8],[8,8],[7,9],[8,9]].forEach(([x,y])=>setPixel(grid,x,y,[180,80,20,255]));
  // flames
  [[7,7],[8,7]].forEach(([x,y])=>setPixel(grid,x,y,[220,140,30,255]));
  [[7,6],[8,6]].forEach(([x,y])=>setPixel(grid,x,y,[240,200,40,255]));
  setPixel(grid,8,5,[255,220,60,255]);
  // smoke dots
  [[7,4],[9,3],[8,2]].forEach(([x,y])=>setPixel(grid,x,y,[90,88,85,200]));
  return grid;
}

function makeMarketStall(seed, awning='stripe_red') {
  const rng=mulberry32(seed), grid=createPixelGrid(24,20);

  // Awning styles
  const drawAwning=()=>{
    if (awning==='stripe_red') {
      const c1=jitter([148,68,44,255],12,rng), c2=jitter([182,165,108,255],12,rng);
      for (let x=0;x<20;x++) for (let y=0;y<5;y++)
        setPixel(grid,x+2,y,jitter(x%4<2?c1:c2,10,rng));
    } else if (awning==='stripe_blue') {
      const c1=jitter([68,88,138,255],12,rng), c2=jitter([188,178,148,255],12,rng);
      for (let x=0;x<20;x++) for (let y=0;y<5;y++)
        setPixel(grid,x+2,y,jitter(x%4<2?c1:c2,10,rng));
    } else if (awning==='stripe_green') {
      const c1=jitter([62,105,55,255],12,rng), c2=jitter([178,165,108,255],12,rng);
      for (let x=0;x<20;x++) for (let y=0;y<5;y++)
        setPixel(grid,x+2,y,jitter(x%4<2?c1:c2,10,rng));
    } else if (awning==='stripe_wide') {
      // wider stripes, 3 colours
      const c1=jitter([148,68,44,255],12,rng), c2=jitter([182,155,88,255],12,rng), c3=jitter([88,75,55,255],12,rng);
      for (let x=0;x<20;x++) for (let y=0;y<5;y++) {
        const s=Math.floor(x/3)%3;
        setPixel(grid,x+2,y,jitter(s===0?c1:s===1?c2:c3,10,rng));
      }
    } else if (awning==='canvas_worn') {
      // plain aged canvas, no stripes, worn patches
      const base=jitter([165,145,98,255],14,rng);
      for (let x=0;x<20;x++) for (let y=0;y<5;y++) {
        let c=jitter(base,12,rng);
        if (rng()<0.1) c=lerp(c,[80,65,40,255],rng()*0.5+0.2); // dark worn patch
        if (rng()<0.05) c=lerp(c,[195,180,138,255],0.4); // light faded patch
        setPixel(grid,x+2,y,c);
      }
      // tear/hole pixels
      for (let i=0;i<3;i++) {
        const tx=3+Math.floor(rng()*16), ty=Math.floor(rng()*4);
        setPixel(grid,tx,ty,[40,30,20,180]);
      }
    } else if (awning==='wood_overhang') {
      // plain wooden boards, no fabric
      const PL=jitter([130,92,48,255],12,rng), PD=jitter([98,68,32,255],10,rng);
      for (let x=2;x<22;x++) for (let y=0;y<4;y++) {
        setPixel(grid,x,y,jitter(y%2===0?PL:PD,10,rng));
        if (x%5===0) setPixel(grid,x,y,jitter([78,52,22,255],6,rng)); // plank seam
      }
      // shadow line under overhang
      for (let x=2;x<22;x++) setPixel(grid,x,4,[45,32,18,255]);
    } else if (awning==='tattered') {
      // striped but with big missing/torn sections
      const c1=jitter([138,58,38,255],14,rng), c2=jitter([170,148,92,255],14,rng);
      for (let x=0;x<20;x++) for (let y=0;y<5;y++) {
        if (rng()<0.12) continue; // torn gap = transparent-ish (leave as floor)
        setPixel(grid,x+2,y,jitter(x%4<2?c1:c2,14,rng));
      }
    }
  };
  drawAwning();

  // Stall counter — worn wood
  for (let x=2;x<22;x++) for (let y=5;y<8;y++)
    setPixel(grid,x,y,jitter([122,88,44,255],10,rng));
  // Goods — 2 muted earthy tones
  const gA=jitter([148,108,52,255],16,rng), gB=jitter([105,88,62,255],16,rng);
  [[4,6],[7,6],[10,6],[13,6],[16,6],[19,6]].forEach(([x,y],i)=>{
    const c=i%2===0?gA:gB;
    setPixel(grid,x,y,c); setPixel(grid,x+1,y,lerp(c,[80,60,35,255],0.3));
  });
  // Posts — dark wood
  [[2,0],[21,0],[2,8],[21,8]].forEach(([x,y])=>{
    for (let dy=0;dy<3;dy++) setPixel(grid,x,y+dy,[78,52,22,255]);
  });
  return grid;
}

function makeStockadeFence(seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(20,12);
  // fence posts every 4px
  for (let x=0;x<20;x+=4) {
    for (let y=0;y<10;y++) {
      setPixel(grid,x,y,jitter([110,75,35,255],8,rng));
      setPixel(grid,x+1,y,jitter([140,100,50,255],8,rng));
    }
    // pointed top
    setPixel(grid,x,10,[110,75,35,255]);
    setPixel(grid,x+1,9,[140,100,50,255]);
  }
  // horizontal rail
  for (let x=0;x<20;x++) {
    setPixel(grid,x,4,jitter([130,90,45,255],6,rng));
    setPixel(grid,x,7,jitter([120,82,40,255],6,rng));
  }
  return grid;
}

function makeSignpost(seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(14,18);
  // post
  for (let y=4;y<18;y++) { setPixel(grid,6,y,[100,68,30,255]); setPixel(grid,7,y,[130,92,45,255]); }
  // sign board
  for (let x=1;x<13;x++) for (let y=0;y<6;y++)
    setPixel(grid,x,y,jitter([170,130,70,255],10,rng));
  // border
  for (let x=1;x<13;x++) { setPixel(grid,x,0,[100,70,30,255]); setPixel(grid,x,5,[100,70,30,255]); }
  for (let y=0;y<6;y++) { setPixel(grid,1,y,[100,70,30,255]); setPixel(grid,12,y,[100,70,30,255]); }
  // text lines
  for (let x=3;x<11;x+=2) setPixel(grid,x,2,[80,55,25,255]);
  for (let x=3;x<9;x+=2) setPixel(grid,x,3,[80,55,25,255]);
  return grid;
}

function makeAnvil(seed) {
  // top-down: anvil face seen from directly above
  // main body = wide rectangle, horn = tapered protrusion on right, base legs = small squares bottom corners
  const W=16,H=14, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const ML=[128,128,128,255],MM=[105,105,105,255],MD=[75,75,75,255],MH=[158,158,162,255];
  const shadow=[45,42,40,180];
  // main face — large rectangle, top-left lit
  for(let y=2;y<11;y++) for(let x=1;x<12;x++){
    const lt=(x/12*0.25+y/11*0.25);
    setPixel(grid,x,y,jitter(lerp(MH,MD,lt),10,rng));
  }
  // top edge highlight
  for(let x=2;x<11;x++) setPixel(grid,x,2,jitter(MH,5,rng));
  // left edge highlight
  for(let y=2;y<11;y++) setPixel(grid,1,y,jitter(MH,5,rng));
  // right/bottom shadow edge
  for(let y=2;y<11;y++) setPixel(grid,11,y,jitter(MD,4,rng));
  for(let x=1;x<12;x++) setPixel(grid,x,10,jitter(MD,4,rng));
  // horn — tapered rectangle protruding right
  for(let x=11;x<W-1;x++) for(let y=4;y<8;y++){
    const taper=(x-11)/4;
    const hy=Math.round(taper);
    if(y>=4+hy&&y<8-hy) setPixel(grid,x,y,jitter(lerp(MM,MD,taper),8,rng));
  }
  // base legs — two small dark squares bottom-left and bottom-right of face
  [[2,11],[8,11]].forEach(([x,y])=>{
    for(let dx=0;dx<3;dx++) for(let dy=0;dy<2;dy++) setPixel(grid,x+dx,y+dy,jitter(MD,8,rng));
  });
  // shadow cast to bottom-right
  for(let y=11;y<13;y++) for(let x=3;x<13;x++) setPixel(grid,x,y,shadow);
  return grid;
}

function makeLogPile(seed) {
  // top-down: rows of cut logs seen from above — horizontal rectangles stacked
  const W=20,H=18, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const drawLog=(x,y,w,h)=>{
    const LB=jitter([112,72,30,255],12,rng),LL=jitter([142,98,48,255],10,rng);
    const LD=jitter([78,50,18,255],8,rng),LK=[52,32,10,255];
    // bark body
    for(let dy=0;dy<h;dy++) for(let dx=0;dx<w;dx++){
      const lt=(dx/w*0.3+dy/h*0.3);
      setPixel(grid,x+dx,y+dy,jitter(lerp(LL,LD,lt),12,rng));
    }
    // top edge (lighter)
    for(let dx=0;dx<w;dx++) setPixel(grid,x+dx,y,jitter(LL,6,rng));
    // bottom edge (darker)
    for(let dx=0;dx<w;dx++) setPixel(grid,x+dx,y+h-1,jitter(LD,5,rng));
    // left/right ends (end grain)
    for(let dy=1;dy<h-1;dy++){
      setPixel(grid,x,y+dy,jitter(LB,8,rng));
      setPixel(grid,x+w-1,y+dy,jitter(LK,5,rng));
    }
    // bark crack lines
    if(rng()<0.5) for(let dx=2;dx<w-2;dx++) if(rng()<0.2) setPixel(grid,x+dx,y+Math.floor(h/2),jitter(LD,6,rng));
  };
  // bottom row — 3 full-width logs
  drawLog(1,13,18,4);
  drawLog(1,8,18,4);
  // top row — 2 shorter logs side by side (offset for stacked look)
  drawLog(1,3,8,4);
  drawLog(11,3,8,4);
  return grid;
}

function makeBarrelCluster(seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(18,16);
  const drawBarrel=(bx,by)=>{
    const BL=jitter([145,95,48,255],12,rng), BD=jitter([90,55,22,255],8,rng);
    const BH=jitter([175,120,62,255],8,rng);
    for (let dx=0;dx<5;dx++) for (let dy=0;dy<6;dy++) {
      const t=(dx===0||dx===4)?0.8:(dx===1||dx===3)?0.3:0;
      setPixel(grid,bx+dx,by+dy,lerp(BH,BD,t));
    }
    // hoop lines
    [by+1,by+4].forEach(hy=>{ for(let dx=0;dx<5;dx++) setPixel(grid,bx+dx,hy,BD); });
    // top highlight
    for (let dx=1;dx<4;dx++) setPixel(grid,bx+dx,by,BH);
  };
  drawBarrel(1,1); drawBarrel(8,1); drawBarrel(13,4); drawBarrel(4,8); drawBarrel(10,8);
  return grid;
}

function makeNoticeboard(seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(16,16);
  // two posts
  for (let y=5;y<16;y++) { setPixel(grid,3,y,[100,68,30,255]); setPixel(grid,12,y,[100,68,30,255]); }
  // board
  for (let x=2;x<14;x++) for (let y=1;y<9;y++) setPixel(grid,x,y,jitter([175,138,78,255],10,rng));
  for (let x=2;x<14;x++) { setPixel(grid,x,1,[110,75,35,255]); setPixel(grid,x,8,[110,75,35,255]); }
  for (let y=1;y<9;y++) { setPixel(grid,2,y,[110,75,35,255]); setPixel(grid,13,y,[110,75,35,255]); }
  // notices (small coloured scraps)
  [[4,3,7,5],[8,2,11,4],[4,5,6,7],[9,5,12,7]].forEach(([x1,y1,x2,y2],i)=>{
    const cols=[[220,215,185,255],[200,180,140,255],[185,195,210,255],[215,200,170,255]];
    for (let x=x1;x<=x2;x++) for (let y=y1;y<=y2;y++) setPixel(grid,x,y,jitter(cols[i],6,rng));
  });
  return grid;
}

function makeTrough(seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(18,10);
  // trough body
  for (let x=1;x<17;x++) for (let y=2;y<9;y++) setPixel(grid,x,y,jitter([115,80,40,255],10,rng));
  // water inside
  for (let x=3;x<15;x++) for (let y=3;y<8;y++) setPixel(grid,x,y,jitter([60,105,148,255],12,rng));
  // rim
  for (let x=1;x<17;x++) { setPixel(grid,x,2,jitter([140,100,52,255],6,rng)); }
  for (let y=2;y<9;y++) { setPixel(grid,1,y,[90,60,25,255]); setPixel(grid,16,y,[90,60,25,255]); }
  // legs
  [[2,8],[15,8]].forEach(([x,y])=>{ setPixel(grid,x,y,[95,62,28,255]); setPixel(grid,x,y+1,[95,62,28,255]); });
  return grid;
}

function makeChickenCoop(seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(20,18);
  // coop building footprint
  for (let x=2;x<14;x++) for (let y=2;y<14;y++) setPixel(grid,x,y,jitter([155,120,65,255],10,rng));
  // roof (simple hip)
  const cx=8,cy=8;
  for (let y=2;y<14;y++) for (let x=2;x<14;x++) {
    const dx=x-cx,dy=y-cy,angle=Math.atan2(dy,dx)*180/Math.PI;
    const dist=Math.min(1,Math.sqrt((dx/6)**2+(dy/6)**2));
    let col=angle>=-135&&angle<-45?lerp([200,120,60,255],[155,85,35,255],dist):
            angle>=45&&angle<135?lerp([140,80,30,255],[100,55,18,255],dist):
            lerp([170,100,45,255],[120,65,22,255],dist);
    setPixel(grid,x,y,col);
  }
  // pen — wire fence area (transparent interior, just draw fence lines)
  for (let x=13;x<19;x++) { setPixel(grid,x,4,[100,75,40,255]); setPixel(grid,x,13,[100,75,40,255]); }
  for (let y=4;y<14;y++) { setPixel(grid,13,y,[100,75,40,255]); setPixel(grid,18,y,[100,75,40,255]); }
  // chickens (dots)
  [[15,7],[17,9],[14,11]].forEach(([x,y])=>{ setPixel(grid,x,y,[240,225,180,255]); setPixel(grid,x+1,y,[200,185,140,255]); });
  return grid;
}

function makeGarden(seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(20,20);
  // soil base
  for (let y=0;y<20;y++) for (let x=0;x<20;x++) setPixel(grid,x,y,jitter([108,78,45,255],12,rng));
  // planting rows
  const rowCols=[[70,130,50,255],[90,150,60,255],[200,60,40,255],[240,200,50,255]];
  for (let row=0;row<4;row++) {
    const ry=2+row*4;
    // soil furrow
    for (let x=1;x<19;x++) setPixel(grid,x,ry+1,jitter([82,55,28,255],8,rng));
    // plants
    for (let x=2;x<18;x+=3) {
      const col=rowCols[row%rowCols.length];
      setPixel(grid,x,ry,jitter(col,14,rng));
      setPixel(grid,x+1,ry,jitter(col,10,rng));
    }
  }
  // border stones
  for (let x=0;x<20;x++) { setPixel(grid,x,0,jitter([130,122,110,255],8,rng)); setPixel(grid,x,19,jitter([130,122,110,255],8,rng)); }
  for (let y=0;y<20;y++) { setPixel(grid,0,y,jitter([130,122,110,255],8,rng)); setPixel(grid,19,y,jitter([130,122,110,255],8,rng)); }
  return grid;
}

// ─── BUSH GENERATORS ─────────────────────────────────────────────────────────
function makeBushField(size, seed) {
  // scattered individual bushes seen from top-down
  const W=size==='lg'?24:16, H=W;
  const rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const DG=[28,72,22,255],MG=[48,100,38,255],LG=[72,128,52,255],YG=[88,145,55,255];
  const twig=[88,60,28,255];

  const drawBush=(cx,cy,r)=>{
    for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist>r) continue;
      const t=dist/r;
      // lighter centre (lit top), darker edge
      const lt=(dx/r*0.2+dy/r*0.2)*0.5+0.5;
      let c=lerp(lerp(YG,LG,lt*0.5),lerp(MG,DG,lt),t);
      c=jitter(c,12,rng);
      if(rng()<0.05) c=jitter(twig,8,rng);
      if(cx+dx>=0&&cx+dx<W&&cy+dy>=0&&cy+dy<H)
        setPixel(grid,cx+dx,cy+dy,c);
    }
    // shadow on bottom-right edge
    for(let a=30;a<180;a+=20){
      const rad=a*Math.PI/180;
      const ex=Math.round(cx+Math.cos(rad)*r), ey=Math.round(cy+Math.sin(rad)*r);
      if(ex>=0&&ex<W&&ey>=0&&ey<H) setPixel(grid,ex,ey,jitter(DG,8,rng));
    }
  };

  const num=size==='lg'?5:3;
  const placed=[];
  let attempts=0;
  while(placed.length<num&&attempts<80){
    attempts++;
    const r=2+Math.floor(rng()*3);
    const cx=r+1+Math.floor(rng()*(W-r*2-2));
    const cy=r+1+Math.floor(rng()*(H-r*2-2));
    const overlap=placed.some(([px,py,pr])=>Math.sqrt((cx-px)**2+(cy-py)**2)<r+pr+1);
    if(!overlap){ placed.push([cx,cy,r]); drawBush(cx,cy,r); }
  }
  return grid;
}

// ─── HEDGE GENERATOR ─────────────────────────────────────────────────────────
function makeHedge(shape, seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const DG=[28,72,22,255],MG=[48,100,38,255],LG=[72,128,52,255];
  const DK=[18,48,14,255]; // dark gap between hedge sections

  const hedgeW=8, lo=Math.floor((W-hedgeW)/2), hi=lo+hedgeW;

  const fillHedge=(x,y)=>{
    // top-down hedge texture — bumpy canopy
    const bumpX=Math.floor(x/3), bumpY=Math.floor(y/3);
    const bumpSeed=(bumpX*7+bumpY*13)%17;
    const bump=bumpSeed<5?LG:bumpSeed<11?MG:DG;
    let c=jitter(bump,12,rng);
    if(rng()<0.06) c=jitter(DK,6,rng); // gaps in foliage
    setPixel(grid,x,y,c);
  };
  const edgePx=(x,y)=>{ if(x>=0&&x<W&&y>=0&&y<H) setPixel(grid,x,y,jitter(DK,5,rng)); };

  if(shape==='h'){
    for(let y=lo;y<hi;y++) for(let x=0;x<W;x++) fillHedge(x,y);
    for(let x=0;x<W;x++){ edgePx(x,lo); edgePx(x,hi-1); }
  } else if(shape==='v'){
    for(let x=lo;x<hi;x++) for(let y=0;y<H;y++) fillHedge(x,y);
    for(let y=0;y<H;y++){ edgePx(lo,y); edgePx(hi-1,y); }
  } else if(shape==='cross'){
    for(let y=lo;y<hi;y++) for(let x=0;x<W;x++) fillHedge(x,y);
    for(let x=lo;x<hi;x++) for(let y=0;y<H;y++) fillHedge(x,y);
    for(let x=0;x<W;x++) if(x<lo||x>=hi){ edgePx(x,lo); edgePx(x,hi-1); }
    for(let y=0;y<H;y++) if(y<lo||y>=hi){ edgePx(lo,y); edgePx(hi-1,y); }
  } else if(shape==='corner_se'){
    for(let x=lo;x<hi;x++) for(let y=lo;y<H;y++) fillHedge(x,y);
    for(let y=lo;y<hi;y++) for(let x=lo;x<W;x++) fillHedge(x,y);
    for(let y=lo;y<H;y++) edgePx(lo,y);
    for(let x=lo;x<W;x++) edgePx(x,lo);
    for(let x=lo;x<hi;x++) edgePx(x,H-1);
    for(let y=lo;y<hi;y++) edgePx(W-1,y);
  } else if(shape==='corner_sw'){
    for(let x=lo;x<hi;x++) for(let y=lo;y<H;y++) fillHedge(x,y);
    for(let y=lo;y<hi;y++) for(let x=0;x<hi;x++) fillHedge(x,y);
    for(let y=lo;y<H;y++) edgePx(hi-1,y);
    for(let x=0;x<hi;x++) edgePx(x,lo);
    for(let x=lo;x<hi;x++) edgePx(x,H-1);
    for(let y=lo;y<hi;y++) edgePx(0,y);
  } else if(shape==='corner_ne'){
    for(let x=lo;x<hi;x++) for(let y=0;y<hi;y++) fillHedge(x,y);
    for(let y=lo;y<hi;y++) for(let x=lo;x<W;x++) fillHedge(x,y);
    for(let y=0;y<hi;y++) edgePx(lo,y);
    for(let x=lo;x<W;x++) edgePx(x,hi-1);
    for(let x=lo;x<hi;x++) edgePx(x,0);
    for(let y=lo;y<hi;y++) edgePx(W-1,y);
  } else if(shape==='corner_nw'){
    for(let x=lo;x<hi;x++) for(let y=0;y<hi;y++) fillHedge(x,y);
    for(let y=lo;y<hi;y++) for(let x=0;x<hi;x++) fillHedge(x,y);
    for(let y=0;y<hi;y++) edgePx(hi-1,y);
    for(let x=0;x<hi;x++) edgePx(x,hi-1);
    for(let x=lo;x<hi;x++) edgePx(x,0);
    for(let y=lo;y<hi;y++) edgePx(0,y);
  } else if(shape==='t_south'){
    for(let y=lo;y<hi;y++) for(let x=0;x<W;x++) fillHedge(x,y);
    for(let x=lo;x<hi;x++) for(let y=hi;y<H;y++) fillHedge(x,y);
    for(let x=0;x<W;x++) if(x<lo||x>=hi) edgePx(x,lo);
    for(let x=0;x<lo;x++) edgePx(x,hi-1);
    for(let x=hi;x<W;x++) edgePx(x,hi-1);
    for(let y=hi;y<H;y++){ edgePx(lo,y); edgePx(hi-1,y); }
  } else if(shape==='t_north'){
    for(let y=lo;y<hi;y++) for(let x=0;x<W;x++) fillHedge(x,y);
    for(let x=lo;x<hi;x++) for(let y=0;y<lo;y++) fillHedge(x,y);
    for(let x=0;x<W;x++) if(x<lo||x>=hi) edgePx(x,hi-1);
    for(let x=0;x<lo;x++) edgePx(x,lo);
    for(let x=hi;x<W;x++) edgePx(x,lo);
    for(let y=0;y<lo;y++){ edgePx(lo,y); edgePx(hi-1,y); }
  } else if(shape==='t_east'){
    for(let x=lo;x<hi;x++) for(let y=0;y<H;y++) fillHedge(x,y);
    for(let y=lo;y<hi;y++) for(let x=hi;x<W;x++) fillHedge(x,y);
    for(let y=0;y<H;y++) if(y<lo||y>=hi) edgePx(lo,y);
    for(let y=0;y<lo;y++) edgePx(hi-1,y);
    for(let y=hi;y<H;y++) edgePx(hi-1,y);
    for(let x=hi;x<W;x++){ edgePx(x,lo); edgePx(x,hi-1); }
  } else if(shape==='t_west'){
    for(let x=lo;x<hi;x++) for(let y=0;y<H;y++) fillHedge(x,y);
    for(let y=lo;y<hi;y++) for(let x=0;x<lo;x++) fillHedge(x,y);
    for(let y=0;y<H;y++) if(y<lo||y>=hi) edgePx(hi-1,y);
    for(let y=0;y<lo;y++) edgePx(lo,y);
    for(let y=hi;y<H;y++) edgePx(lo,y);
    for(let x=0;x<lo;x++){ edgePx(x,lo); edgePx(x,hi-1); }
  }
  return grid;
}


// ─── FLOORBOARD GENERATOR ────────────────────────────────────────────────────
function makeFloorboard(pattern, seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const rng2=mulberry32(seed+13337);
  const woodSpecies=[
    {PL:[195,158,88,255],PD:[148,112,52,255],PL2:[218,178,108,255]}, // pine — warm pale
    {PL:[148,95,42,255],PD:[108,65,25,255],PL2:[175,118,58,255]},    // dark oak — rich brown
    {PL:[215,188,145,255],PD:[172,145,98,255],PL2:[232,208,165,255]}, // ash — pale cream
    {PL:[88,52,28,255],PD:[62,35,15,255],PL2:[112,68,38,255]},       // walnut — very dark
    {PL:[178,128,65,255],PD:[138,92,38,255],PL2:[205,152,85,255]},   // maple — golden
    {PL:[158,108,55,255],PD:[118,75,30,255],PL2:[182,132,72,255]},   // standard oak
  ];
  const ws=woodSpecies[Math.floor(rng2()*woodSpecies.length)];
  const PL=jitter(ws.PL,14,rng2), PD=jitter(ws.PD,12,rng2), PL2=jitter(ws.PL2,14,rng2);
  const PJ=jitter(lerp(ws.PD,[30,20,10,255],0.4),5,rng2);
  const grain=()=>rng()<0.15?jitter(PD,8,rng):jitter(PL,14,rng);
  const knot=()=>rng()<0.025?jitter([128,95,52,255],8,rng):null;

  if(pattern==='h'){
    // horizontal planks
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const row=Math.floor(y/4), off=(row%2)*7;
      if(y%4===0){setPixel(grid,x,y,jitter(PJ,5,rng));continue;}
      if((x+off)%14===0){setPixel(grid,x,y,jitter(PJ,5,rng));continue;}
      setPixel(grid,x,y,knot()||jitter(row%2===0?PL:PL2,14,rng));
    }
  } else if(pattern==='v'){
    // vertical planks
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const col=Math.floor(x/4), off=(col%2)*7;
      if(x%4===0){setPixel(grid,x,y,jitter(PJ,5,rng));continue;}
      if((y+off)%14===0){setPixel(grid,x,y,jitter(PJ,5,rng));continue;}
      setPixel(grid,x,y,knot()||jitter(col%2===0?PL:PL2,14,rng));
    }
  } else if(pattern==='herringbone'){
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const block=Math.floor((x+y)/4);
      const sub=(x+y)%4;
      const isH=block%2===0;
      if(sub===0){setPixel(grid,x,y,jitter(PJ,5,rng));continue;}
      const col=isH?PL:PL2;
      setPixel(grid,x,y,knot()||jitter(col,14,rng));
    }
  } else if(pattern==='diagonal'){
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const d=(x+y)%5;
      if(d===0){setPixel(grid,x,y,jitter(PJ,5,rng));continue;}
      const stripe=Math.floor((x+y)/5)%2;
      setPixel(grid,x,y,knot()||jitter(stripe===0?PL:PL2,14,rng));
    }
  } else if(pattern==='parquet'){
    // basket weave 4x4 blocks
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const bx=Math.floor(x/4), by=Math.floor(y/4);
      const tx=x%4, ty=y%4;
      const isH=(bx+by)%2===0;
      if(tx===0||ty===0){setPixel(grid,x,y,jitter(PJ,5,rng));continue;}
      const col=isH?(tx===1||tx===2?PL:PL2):(ty===1||ty===2?PL:PL2);
      setPixel(grid,x,y,knot()||jitter(col,14,rng));
    }
  } else if(pattern==='stone'){
    // large stone tiles
    const S1=[138,132,122,255],S2=[115,110,102,255],SJ=[72,68,62,255];
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const row=Math.floor(y/6), off=(row%2)*4;
      const tu=(x+off)%8, tv=y%6;
      if(tu===0||tv===0){setPixel(grid,x,y,SJ);continue;}
      let c=jitter(rng()<0.5?S1:S2,10,rng);
      if(rng()<0.05) c=lerp(c,[55,70,38,255],0.25); // lichen
      setPixel(grid,x,y,c);
    }
  }
  return grid;
}

// ─── FURNITURE GENERATORS ────────────────────────────────────────────────────
function makeBed(type, seed) {
  const W=type==='double'?20:14, H=24;
  const rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const rngW=mulberry32(seed+4441);
  const woodF=[
    {a:[105,72,35,255],b:[135,95,52,255],c:[78,50,20,255]},   // oak
    {a:[78,48,20,255],b:[102,65,32,255],c:[55,32,10,255]},    // walnut
    {a:[185,148,88,255],b:[215,178,118,255],c:[155,118,62,255]}, // pine
    {a:[62,38,15,255],b:[82,52,22,255],c:[45,28,8,255]},      // ebony
    {a:[158,118,62,255],b:[188,148,88,255],c:[128,88,40,255]}, // maple
  ][Math.floor(rngW()*5)];
  const FR=jitter(woodF.a,12,rngW), FRL=jitter(woodF.b,12,rngW), FRD=jitter(woodF.c,10,rngW); // frame
  const SH=[188,168,128,255],SHL=[215,195,158,255],SHD=[148,125,88,255]; // sheets
  const PIL=[225,215,188,255]; // pillow
  const BL=jitter([88,68,148,255],14,rng); // blanket colour — random each gen

  // frame
  for(let x=0;x<W;x++) for(let y=0;y<H;y++) setPixel(grid,x,y,jitter(FR,10,rng));
  for(let x=1;x<W-1;x++) for(let y=4;y<H-3;y++) setPixel(grid,x,y,jitter(rng()<0.5?SH:SHL,10,rng));
  // blanket over lower 2/3
  for(let x=1;x<W-1;x++) for(let y=9;y<H-3;y++){
    let c=jitter(BL,12,rng);
    if((x+y)%5===0) c=lerp(c,lerp(BL,[0,0,0,255],0.3),0.4); // fold lines
    setPixel(grid,x,y,c);
  }
  // pillow(s)
  const numPillows=type==='double'?2:1;
  for(let p=0;p<numPillows;p++){
    const px=p===0?2:W/2+1, pw=type==='double'?W/2-3:W-4;
    for(let x=px;x<px+pw;x++) for(let y=4;y<8;y++) setPixel(grid,x,y,jitter(PIL,8,rng));
    for(let x=px;x<px+pw;x++) setPixel(grid,x,4,jitter(SHD,5,rng));
    for(let x=px;x<px+pw;x++) setPixel(grid,x,7,jitter(SHD,5,rng));
  }
  // headboard
  for(let x=0;x<W;x++) for(let y=0;y<4;y++) setPixel(grid,x,y,jitter(FRL,10,rng));
  for(let x=0;x<W;x++) setPixel(grid,x,0,jitter(FRD,5,rng));
  // footboard
  for(let x=0;x<W;x++) for(let y=H-3;y<H;y++) setPixel(grid,x,y,jitter(FR,10,rng));
  for(let x=0;x<W;x++) setPixel(grid,x,H-1,jitter(FRD,5,rng));
  // frame sides
  for(let y=0;y<H;y++){ setPixel(grid,0,y,jitter(FRD,6,rng)); setPixel(grid,W-1,y,jitter(FRD,6,rng)); }
  return grid;
}

function makeTable(type, seed) {
  const drawObject=(grid,ox,oy,kind,rng)=>{
    if(kind===0){ // goblet — gold ring, dark centre
      const c=jitter([188,155,72,255],14,rng);
      setPixel(grid,ox+1,oy,c); setPixel(grid,ox,oy+1,c); setPixel(grid,ox+2,oy+1,c); setPixel(grid,ox+1,oy+2,c);
      setPixel(grid,ox+1,oy+1,[40,30,18,255]);
    } else if(kind===1){ // bowl — earthy filled circle
      const c=jitter([148,108,68,255],14,rng), fill=jitter([95,70,45,255],10,rng);
      setPixel(grid,ox+1,oy,c); setPixel(grid,ox,oy+1,c); setPixel(grid,ox+2,oy+1,c); setPixel(grid,ox+1,oy+2,c);
      setPixel(grid,ox+1,oy+1,fill); setPixel(grid,ox,oy,fill);
    } else if(kind===2){ // book — rectangle with spine
      const cvr=jitter([[148,48,42,255],[48,88,148,255],[48,128,68,255],[128,98,42,255]][Math.floor(rng()*4)],14,rng);
      for(let dx=0;dx<3;dx++) for(let dy=0;dy<2;dy++) setPixel(grid,ox+dx,oy+dy,cvr);
      for(let dy=0;dy<2;dy++) setPixel(grid,ox,oy+dy,lerp(cvr,[15,10,8,255],0.45));
      setPixel(grid,ox+1,oy,jitter([215,205,185,255],8,rng));
    } else if(kind===3){ // candle — stub + flame
      setPixel(grid,ox+1,oy+1,[232,222,198,255]);
      setPixel(grid,ox,oy+1,[232,222,198,255]);
      setPixel(grid,ox+1,oy,[252,215,55,255]);
      setPixel(grid,ox,oy,[245,175,35,200]);
    } else if(kind===4){ // plate — silver rim, food inside
      const rim=jitter([195,185,172,255],8,rng), food=jitter([155,118,62,255],18,rng);
      setPixel(grid,ox+1,oy,rim); setPixel(grid,ox,oy+1,rim); setPixel(grid,ox+2,oy+1,rim); setPixel(grid,ox+1,oy+2,rim);
      setPixel(grid,ox+1,oy+1,food); setPixel(grid,ox,oy,food);
    } else { // potion — coloured vial
      const col=jitter([[188,48,188,255],[48,188,128,255],[188,128,48,255],[48,128,218,255]][Math.floor(rng()*4)],14,rng);
      setPixel(grid,ox+1,oy,[155,148,140,255]);
      setPixel(grid,ox,oy+1,col); setPixel(grid,ox+1,oy+1,col); setPixel(grid,ox+2,oy+1,col);
      setPixel(grid,ox+1,oy+2,col);
    }
  };

  if(type==='round'){
    const W=16,H=16, rng=mulberry32(seed), grid=createPixelGrid(W,H);
    const rngW2=mulberry32(seed+5552);
    const woodT=[
      {a:[178,138,72,255],b:[108,78,35,255],c:[72,48,18,255]},   // oak
      {a:[68,42,18,255],b:[52,32,12,255],c:[40,25,8,255]},       // walnut
      {a:[215,188,138,255],b:[172,145,98,255],c:[138,108,65,255]}, // ash/pine
      {a:[148,108,52,255],b:[108,72,28,255],c:[82,52,18,255]},   // maple
    ][Math.floor(rngW2()*4)];
    const TL=jitter(woodT.a,14,rngW2), TD=jitter(woodT.b,12,rngW2), TE=jitter(woodT.c,10,rngW2);
    const cx=8,cy=8,r=6;
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const dx=x-cx,dy=y-cy,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<r-1){ let c=lerp(TL,TD,(dx/r*0.25+dy/r*0.25)*0.5+0.5); setPixel(grid,x,y,jitter(c,12,rng)); }
      else if(dist<=r) setPixel(grid,x,y,jitter(TE,5,rng));
    }
    const r2=mulberry32(seed+7331);
    const nObj=1+Math.floor(r2()*3);
    // scattered positions with jitter, not a grid
    const baseSlots=[[5,5],[9,6],[6,9],[10,9],[7,6]];
    for(let i=0;i<nObj;i++){
      const [bx,by]=baseSlots[i%baseSlots.length];
      const ox=bx+Math.floor(r2()*3)-1, oy=by+Math.floor(r2()*3)-1;
      drawObject(grid,ox,oy,Math.floor(r2()*6),r2);
    }
    return grid;
  } else {
    const W=24,H=16, rng=mulberry32(seed), grid=createPixelGrid(W,H);
    const rngW2=mulberry32(seed+5552);
    const woodTLong=[
      {l:[195,158,88,255],m:[155,118,58,255],d:[112,80,32,255]},
      {l:[95,58,22,255],m:[72,42,14,255],d:[52,30,8,255]},
      {l:[218,188,138,255],m:[178,148,98,255],d:[138,108,65,255]},
      {l:[68,38,12,255],m:[50,28,8,255],d:[35,18,4,255]},
      {l:[182,142,72,255],m:[148,108,45,255],d:[108,75,25,255]},
      {l:[158,112,52,255],m:[125,82,30,255],d:[90,58,18,255]},
    ][Math.floor(rngW2()*6)];
    const TL=jitter(woodTLong.l,14,rngW2), TD=jitter(woodTLong.m,12,rngW2), TE=jitter(woodTLong.d,10,rngW2);
    for(let x=0;x<W;x++) for(let y=0;y<H;y++){
      let c=lerp(TL,TD,(x/W*0.15+y/H*0.2)); c=jitter(c,12,rng);
      if(x%5===0) c=lerp(c,TE,0.25);
      setPixel(grid,x,y,c);
    }
    for(let x=0;x<W;x++){ setPixel(grid,x,0,jitter(TE,5,rng)); setPixel(grid,x,H-1,jitter(TE,5,rng)); }
    for(let y=0;y<H;y++){ setPixel(grid,0,y,jitter(TE,5,rng)); setPixel(grid,W-1,y,jitter(TE,5,rng)); }
    const r2=mulberry32(seed+7331);
    const nObj=2+Math.floor(r2()*4);
    // scattered base positions across table surface, jittered
    const baseSlots=[[4,4],[9,3],[15,4],[19,5],[4,9],[10,9],[15,10],[19,9],[7,6],[13,7]];
    const used=new Set();
    for(let i=0;i<nObj;i++){
      let tries=0, ox, oy;
      do {
        const [bx,by]=baseSlots[Math.floor(r2()*baseSlots.length)];
        ox=bx+Math.floor(r2()*3)-1; oy=by+Math.floor(r2()*3)-1;
        tries++;
      } while(used.has(ox+','+oy)&&tries<10);
      used.add(ox+','+oy);
      if(ox>0&&ox<W-3&&oy>0&&oy<H-3) drawObject(grid,ox,oy,Math.floor(r2()*6),r2);
    }
    return grid;
  }
}

function makeChair(type, seed) {
  const W=type==='throne'?18:12, H=type==='throne'?20:14;
  const rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const rngW3=mulberry32(seed+6663);
  const woodC=[
    {a:[105,72,35,255],b:[138,98,52,255],c:[75,50,18,255]},   // oak
    {a:[72,42,18,255],b:[95,58,28,255],c:[52,30,10,255]},     // walnut
    {a:[188,152,92,255],b:[218,182,122,255],c:[158,118,65,255]}, // pine
    {a:[145,102,48,255],b:[178,132,72,255],c:[115,75,28,255]}, // maple
  ][Math.floor(rngW3()*4)];
  const FR=jitter(woodC.a,12,rngW3), FRL=jitter(woodC.b,12,rngW3), FRD=jitter(woodC.c,10,rngW3);
  const SEA=[148,118,68,255],SEAL=[175,145,88,255];
  const cushion=jitter([128,78,88,255],16,rng);

  // seat cushion
  const sx=1,sy=Math.floor(H*0.35),sw=W-2,sh=Math.floor(H*0.45);
  for(let x=sx;x<sx+sw;x++) for(let y=sy;y<sy+sh;y++) setPixel(grid,x,y,jitter(cushion,12,rng));
  for(let x=sx;x<sx+sw;x++){ setPixel(grid,x,sy,jitter(lerp(cushion,[0,0,0,255],0.3),5,rng)); setPixel(grid,x,sy+sh-1,jitter(lerp(cushion,[0,0,0,255],0.4),5,rng)); }

  // backrest (top portion)
  for(let x=1;x<W-1;x++) for(let y=0;y<sy;y++){
    setPixel(grid,x,y,jitter(type==='throne'?FRL:FR,10,rng));
    if(type==='throne'&&x%3===0) setPixel(grid,x,y,jitter(FRD,6,rng)); // carving detail
  }
  for(let x=1;x<W-1;x++) setPixel(grid,x,0,jitter(FRD,5,rng));

  // throne extra: armrests
  if(type==='throne'){
    for(let y=sy;y<sy+sh;y++){ setPixel(grid,0,y,jitter(FRL,8,rng)); setPixel(grid,W-1,y,jitter(FRL,8,rng)); }
    // gold trim
    const gold=[185,155,52,255];
    for(let x=0;x<W;x++) setPixel(grid,x,0,jitter(gold,8,rng));
    for(let y=0;y<sy;y++){ setPixel(grid,0,y,jitter(gold,8,rng)); setPixel(grid,W-1,y,jitter(gold,8,rng)); }
  }

  // legs
  const legCols=[FRD,FRD,FRD,FRD];
  [[1,H-3],[W-3,H-3]].forEach(([lx,ly],i)=>{
    for(let dx=0;dx<2;dx++) for(let dy=0;dy<2;dy++) setPixel(grid,lx+dx,ly+dy,jitter(legCols[i],8,rng));
  });
  return grid;
}

function makeBookshelf(seed) {
  const W=20,H=8, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const rngW=mulberry32(seed+1337);
  const woodSpec=[
    {l:[195,158,88,255],m:[155,118,58,255],d:[112,80,32,255],j:[78,52,18,255]}, // pine
    {l:[95,58,22,255],m:[72,42,14,255],d:[52,30,8,255],j:[35,20,5,255]},       // walnut
    {l:[218,188,138,255],m:[178,148,98,255],d:[138,108,65,255],j:[98,72,38,255]}, // ash
    {l:[68,38,12,255],m:[50,28,8,255],d:[35,18,4,255],j:[22,12,2,255]},        // ebony
    {l:[182,142,72,255],m:[148,108,45,255],d:[108,75,25,255],j:[72,48,12,255]}, // maple
    {l:[158,112,52,255],m:[125,82,30,255],d:[90,58,18,255],j:[62,38,10,255]},  // oak
  ][Math.floor(rngW()*6)];
  const WL=jitter(woodSpec.l,14,rng), WM=jitter(woodSpec.m,12,rng), WD=jitter(woodSpec.d,10,rng), WJ=jitter(woodSpec.j,5,rng);
  for(let x=0;x<W;x++) for(let y=0;y<H;y++){
    const lt=(x/W*0.2+y/H*0.2);
    let c=lerp(WL,WM,lt); c=jitter(c,12,rng);
    if(x%5===0) c=lerp(c,WD,0.3);
    setPixel(grid,x,y,c);
  }
  for(let x=0;x<W;x++){ setPixel(grid,x,0,WJ); setPixel(grid,x,H-1,WJ); }
  for(let y=0;y<H;y++){ setPixel(grid,0,y,WJ); setPixel(grid,W-1,y,WJ); }
  for(let x=1;x<W-1;x++) setPixel(grid,x,1,jitter(WL,6,rng));
  for(let y=1;y<H-1;y++) setPixel(grid,1,y,jitter(WL,6,rng));
  return grid;
}

function makeFireplace(seed) {
  const W=20,H=16, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const ST=[138,132,120,255],STD=[95,90,82,255],STL=[162,155,142,255];
  const soot=[22,18,14,255];
  const ember=[188,85,18,255],glow1=[215,118,22,255],glow2=[238,178,35,255],glow3=[252,218,52,255];
  const ash=[78,72,65,255];

  // stone surround — thick U-shape (back wall + two side walls, open front)
  // full rectangle first
  for(let x=0;x<W;x++) for(let y=0;y<H;y++){
    const row=Math.floor(y/4),off=(row%2)*3,tu=(x+off)%6,tv=y%4;
    setPixel(grid,x,y,(tu===0||tv===0)?STD:jitter(rng()<0.5?ST:STL,10,rng));
  }

  // firebox interior — inset dark rectangle, open at bottom
  const fx0=4,fx1=W-4,fy0=2,fy1=H-1;
  for(let x=fx0;x<fx1;x++) for(let y=fy0;y<fy1;y++) setPixel(grid,x,y,jitter(soot,4,rng));

  // ash bed on firebox floor
  for(let x=fx0+1;x<fx1-1;x++) for(let y=fy1-4;y<fy1;y++) setPixel(grid,x,y,jitter(ash,10,rng));

  // glowing embers centre — radiating warmth
  const ex=W/2|0, ey=(fy0+fy1)/2|0;
  // glow spreads outward from centre
  for(let y=fy0;y<fy1;y++) for(let x=fx0;x<fx1;x++){
    const dist=Math.sqrt((x-ex)**2+(y-ey)**2);
    const maxD=Math.min(ex-fx0, ey-fy0)*0.9;
    if(dist<maxD){
      const t=dist/maxD;
      const glowCol=t<0.2?glow3:t<0.45?glow2:t<0.7?glow1:ember;
      const existing=grid[y][x];
      // blend glow over soot
      setPixel(grid,x,y,lerp(glowCol,existing||soot,t*0.8));
    }
  }

  // log shapes — two rectangles lying in firebox
  [[fx0+2,ey-1,6],[fx0+2,ey+1,5]].forEach(([lx,ly,len])=>{
    for(let dx=0;dx<len;dx++) setPixel(grid,lx+dx,ly,jitter([85,52,20,255],10,rng));
    setPixel(grid,lx,ly,[58,35,12,255]);
  });

  return grid;
}

function makeDrawers(seed) {
  const W=16,H=10, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const rngW=mulberry32(seed+1337);
  const woodSpec=[
    {l:[195,158,88,255],m:[155,118,58,255],d:[112,80,32,255],j:[78,52,18,255]}, // pine
    {l:[95,58,22,255],m:[72,42,14,255],d:[52,30,8,255],j:[35,20,5,255]},       // walnut
    {l:[218,188,138,255],m:[178,148,98,255],d:[138,108,65,255],j:[98,72,38,255]}, // ash
    {l:[68,38,12,255],m:[50,28,8,255],d:[35,18,4,255],j:[22,12,2,255]},        // ebony
    {l:[182,142,72,255],m:[148,108,45,255],d:[108,75,25,255],j:[72,48,12,255]}, // maple
    {l:[158,112,52,255],m:[125,82,30,255],d:[90,58,18,255],j:[62,38,10,255]},  // oak
  ][Math.floor(rngW()*6)];
  const WL=jitter(woodSpec.l,14,rng), WM=jitter(woodSpec.m,12,rng), WD=jitter(woodSpec.d,10,rng), WJ=jitter(woodSpec.j,5,rng);
  const MT=[155,135,92,255];
  for(let x=0;x<W;x++) for(let y=0;y<H;y++){
    const lt=(x/W*0.15+y/H*0.15);
    setPixel(grid,x,y,jitter(lerp(WL,WM,lt),12,rng));
  }
  for(let x=0;x<W;x++){ setPixel(grid,x,0,WJ); setPixel(grid,x,H-1,WJ); }
  for(let y=0;y<H;y++){ setPixel(grid,0,y,WJ); setPixel(grid,W-1,y,WJ); }
  for(let x=1;x<W-1;x++) setPixel(grid,x,1,jitter(WL,6,rng));
  for(let y=1;y<H-1;y++) setPixel(grid,1,y,jitter(WL,6,rng));
  [4,8,12].forEach(hx=>{ if(hx<W-1) setPixel(grid,hx,H/2|0,jitter(MT,5,rng)); });
  return grid;
}

function makeCauldron(seed) {
  const W=14,H=14, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const IR=[68,65,60,255],IRL=[92,88,82,255],IRD=[45,42,38,255];
  const brew=jitter([[55,128,88,255],[88,48,128,255],[128,88,48,255]][Math.floor(rng()*3)],14,rng);
  const brewL=lerp(brew,[220,220,220,255],0.3);
  const cx=7,cy=7,r=6;
  // cauldron body
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<=r&&dist>=r-2){
      const lt=(dx/r*0.3+dy/r*0.3)*0.5+0.5;
      setPixel(grid,x,y,jitter(lerp(IRL,IRD,lt),8,rng));
    } else if(dist<r-2){
      // brew contents — bubbling
      let c=jitter(brew,14,rng);
      if(dist<2) c=jitter(brewL,10,rng); // bright centre bubble
      if(rng()<0.06) c=jitter(brewL,8,rng);
      setPixel(grid,x,y,c);
    }
  }
  // rim highlight
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist>=r-0.8&&dist<=r) setPixel(grid,x,y,jitter(IRL,5,rng));
  }
  // handles
  [[-1,0],[1,0]].forEach(([hx,hy])=>{
    setPixel(grid,cx+hx*(r+1),cy,jitter(IRL,6,rng));
    setPixel(grid,cx+hx*(r),cy-1,jitter(IR,6,rng));
  });
  return grid;
}

function makeWeaponRack(seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const rngW=mulberry32(seed+1337);
  const woodSpec=[
    {l:[195,158,88,255],m:[155,118,58,255],d:[112,80,32,255],j:[78,52,18,255]}, // pine
    {l:[95,58,22,255],m:[72,42,14,255],d:[52,30,8,255],j:[35,20,5,255]},       // walnut
    {l:[218,188,138,255],m:[178,148,98,255],d:[138,108,65,255],j:[98,72,38,255]}, // ash
    {l:[68,38,12,255],m:[50,28,8,255],d:[35,18,4,255],j:[22,12,2,255]},        // ebony
    {l:[182,142,72,255],m:[148,108,45,255],d:[108,75,25,255],j:[72,48,12,255]}, // maple
    {l:[158,112,52,255],m:[125,82,30,255],d:[90,58,18,255],j:[62,38,10,255]},  // oak
  ][Math.floor(rngW()*6)];
  const WL=jitter(woodSpec.l,14,rng), WM=jitter(woodSpec.m,12,rng), WD=jitter(woodSpec.d,10,rng), WJ=jitter(woodSpec.j,5,rng);
  const ST=[178,170,160,255],STL=[212,205,195,255],STD=[118,112,105,255];
  // rack bar
  for(let y=0;y<H;y++) for(let x=0;x<3;x++) setPixel(grid,x,y,jitter(x===0?WJ:WM,8,rng));
  for(let y=0;y<H;y++) setPixel(grid,2,y,WJ);
  [3,8,13,18].forEach(py=>{ if(py<H){ setPixel(grid,2,py,WJ); setPixel(grid,3,py,jitter([55,38,14,255],4,rng)); }});
  // sword
  for(let y=4;y<16;y++){ setPixel(grid,5,y,jitter(y<13?ST:WM,8,rng)); if(y<11) setPixel(grid,6,y,jitter(lerp(ST,STD,0.3),8,rng)); }
  setPixel(grid,5,4,jitter(STL,5,rng)); setPixel(grid,6,4,jitter(STL,5,rng));
  for(let dx=-2;dx<=2;dx++) setPixel(grid,5+dx,12,jitter(STD,6,rng));
  for(let dx=-1;dx<=1;dx++) setPixel(grid,5+dx,13,jitter(WM,8,rng));
  setPixel(grid,5,15,jitter([88,62,25,255],6,rng));
  // axe
  for(let y=10;y<19;y++) setPixel(grid,10,y,jitter(WM,8,rng));
  for(let dy=0;dy<7;dy++){ const w=dy<3?(3+dy):(9-dy); for(let dx=0;dx<w;dx++) setPixel(grid,8+dx,4+dy,jitter(ST,8,rng)); }
  setPixel(grid,8,4,jitter(STL,5,rng)); setPixel(grid,8,10,jitter(STL,5,rng));
  // spear
  for(let y=4;y<H;y++) setPixel(grid,16,y,jitter(WM,8,rng));
  setPixel(grid,16,3,jitter(STL,4,rng)); setPixel(grid,15,5,jitter(ST,5,rng)); setPixel(grid,17,5,jitter(STD,5,rng)); setPixel(grid,16,4,jitter(STL,4,rng));
  // dagger
  for(let y=5;y<12;y++){ setPixel(grid,21,y,jitter(y<9?ST:WM,8,rng)); if(y<8) setPixel(grid,22,y,jitter(lerp(ST,STD,0.4),8,rng)); }
  setPixel(grid,21,5,jitter(STL,5,rng));
  setPixel(grid,20,9,jitter(STD,5,rng)); setPixel(grid,23,9,jitter(STD,5,rng));
  return grid;
}


// ─── GRID ROTATION ───────────────────────────────────────────────────────────
function rotateGrid(grid, degrees) {
  if(!degrees || degrees===0) return grid;
  const H=grid.length, W=grid[0].length;
  if(degrees===90){
    const out=createPixelGrid(H,W);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(grid[y][x]) out[x][H-1-y]=grid[y][x];
    return out;
  } else if(degrees===180){
    const out=createPixelGrid(W,H);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(grid[y][x]) out[H-1-y][W-1-x]=grid[y][x];
    return out;
  } else if(degrees===270){
    const out=createPixelGrid(H,W);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(grid[y][x]) out[W-1-x][y]=grid[y][x];
    return out;
  }
  return grid;
}


// ─── STONE WALL GENERATOR ────────────────────────────────────────────────────
function makeStoneWall(shape, seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const S1=[138,132,120,255],S2=[115,110,102,255],S3=[158,152,140,255],SJ=[68,64,58,255];
  const wallW=6, lo=Math.floor((W-wallW)/2), hi=lo+wallW;

  const fillWall=(x,y)=>{
    const row=Math.floor(y/4),off=(row%2)*3,tu=(x+off)%6,tv=y%4;
    let c=(tu===0||tv===0)?SJ:jitter(rng()<0.5?S1:S3,10,rng);
    if(rng()<0.05) c=lerp(c,[50,65,35,255],0.25);
    setPixel(grid,x,y,c);
  };
  const edgePx=(x,y)=>{ if(x>=0&&x<W&&y>=0&&y<H) setPixel(grid,x,y,jitter(SJ,4,rng)); };

  if(shape==='h'){ for(let y=lo;y<hi;y++) for(let x=0;x<W;x++) fillWall(x,y); for(let x=0;x<W;x++){ edgePx(x,lo); edgePx(x,hi-1); } }
  else if(shape==='v'){ for(let x=lo;x<hi;x++) for(let y=0;y<H;y++) fillWall(x,y); for(let y=0;y<H;y++){ edgePx(lo,y); edgePx(hi-1,y); } }
  else if(shape==='cross'){ for(let y=lo;y<hi;y++) for(let x=0;x<W;x++) fillWall(x,y); for(let x=lo;x<hi;x++) for(let y=0;y<H;y++) fillWall(x,y); for(let x=0;x<W;x++) if(x<lo||x>=hi){ edgePx(x,lo); edgePx(x,hi-1); } for(let y=0;y<H;y++) if(y<lo||y>=hi){ edgePx(lo,y); edgePx(hi-1,y); } }
  else if(shape==='corner_se'){ for(let x=lo;x<hi;x++) for(let y=lo;y<H;y++) fillWall(x,y); for(let y=lo;y<hi;y++) for(let x=lo;x<W;x++) fillWall(x,y); for(let y=lo;y<H;y++) edgePx(lo,y); for(let x=lo;x<W;x++) edgePx(x,lo); }
  else if(shape==='corner_sw'){ for(let x=lo;x<hi;x++) for(let y=lo;y<H;y++) fillWall(x,y); for(let y=lo;y<hi;y++) for(let x=0;x<hi;x++) fillWall(x,y); for(let y=lo;y<H;y++) edgePx(hi-1,y); for(let x=0;x<hi;x++) edgePx(x,lo); }
  else if(shape==='corner_ne'){ for(let x=lo;x<hi;x++) for(let y=0;y<hi;y++) fillWall(x,y); for(let y=lo;y<hi;y++) for(let x=lo;x<W;x++) fillWall(x,y); for(let y=0;y<hi;y++) edgePx(lo,y); for(let x=lo;x<W;x++) edgePx(x,hi-1); }
  else if(shape==='corner_nw'){ for(let x=lo;x<hi;x++) for(let y=0;y<hi;y++) fillWall(x,y); for(let y=lo;y<hi;y++) for(let x=0;x<hi;x++) fillWall(x,y); for(let y=0;y<hi;y++) edgePx(hi-1,y); for(let x=0;x<hi;x++) edgePx(x,hi-1); }
  else if(shape==='t_south'){ for(let y=lo;y<hi;y++) for(let x=0;x<W;x++) fillWall(x,y); for(let x=lo;x<hi;x++) for(let y=hi;y<H;y++) fillWall(x,y); for(let x=0;x<W;x++) if(x<lo||x>=hi) edgePx(x,lo); for(let x=0;x<lo;x++) edgePx(x,hi-1); for(let x=hi;x<W;x++) edgePx(x,hi-1); for(let y=hi;y<H;y++){ edgePx(lo,y); edgePx(hi-1,y); } }
  else if(shape==='t_north'){ for(let y=lo;y<hi;y++) for(let x=0;x<W;x++) fillWall(x,y); for(let x=lo;x<hi;x++) for(let y=0;y<lo;y++) fillWall(x,y); for(let x=0;x<W;x++) if(x<lo||x>=hi) edgePx(x,hi-1); for(let x=0;x<lo;x++) edgePx(x,lo); for(let x=hi;x<W;x++) edgePx(x,lo); for(let y=0;y<lo;y++){ edgePx(lo,y); edgePx(hi-1,y); } }
  else if(shape==='t_east'){ for(let x=lo;x<hi;x++) for(let y=0;y<H;y++) fillWall(x,y); for(let y=lo;y<hi;y++) for(let x=hi;x<W;x++) fillWall(x,y); for(let y=0;y<H;y++) if(y<lo||y>=hi) edgePx(lo,y); for(let y=0;y<lo;y++) edgePx(hi-1,y); for(let y=hi;y<H;y++) edgePx(hi-1,y); for(let x=hi;x<W;x++){ edgePx(x,lo); edgePx(x,hi-1); } }
  else if(shape==='t_west'){ for(let x=lo;x<hi;x++) for(let y=0;y<H;y++) fillWall(x,y); for(let y=lo;y<hi;y++) for(let x=0;x<lo;x++) fillWall(x,y); for(let y=0;y<H;y++) if(y<lo||y>=hi) edgePx(hi-1,y); for(let y=0;y<lo;y++) edgePx(lo,y); for(let y=hi;y<H;y++) edgePx(lo,y); for(let x=0;x<lo;x++){ edgePx(x,lo); edgePx(x,hi-1); } }

  return grid;
}

// ─── WOODEN FENCE GENERATOR ──────────────────────────────────────────────────
function makeWoodenFence(shape, style, seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const palettes={
    fresh:  {p:[138,105,58,255],d:[102,72,32,255],l:[168,132,78,255]},
    aged:   {p:[108,85,52,255],d:[78,58,28,255],l:[135,108,68,255]},
    dark:   {p:[72,52,28,255],d:[48,32,14,255],l:[95,72,38,255]},
    weathered:{p:[122,105,82,255],d:[88,72,52,255],l:[148,128,102,255]},
  };
  const {p:PC,d:DC,l:LC}=palettes[style]||palettes.fresh;
  const fenceW=4, lo=Math.floor((W-fenceW)/2), hi=lo+fenceW;

  const fillFence=(x,y)=>{
    // post every 4px, rail between
    const isPost=(x%4===0&&shape==='h')||(y%4===0&&shape==='v');
    let c=isPost?jitter(DC,8,rng):jitter(PC,10,rng);
    if(rng()<0.06) c=lerp(c,[60,80,38,255],0.25); // moss
    setPixel(grid,x,y,c);
    // top highlight
    if(shape==='h'&&y===lo) setPixel(grid,x,y,jitter(LC,6,rng));
    if(shape==='v'&&x===lo) setPixel(grid,x,y,jitter(LC,6,rng));
  };

  // Use same shape logic as stone wall but with fenceW
  const lo2=Math.floor((W-fenceW)/2), hi2=lo2+fenceW;
  if(shape==='h'){ for(let y=lo2;y<hi2;y++) for(let x=0;x<W;x++) fillFence(x,y); }
  else if(shape==='v'){ for(let x=lo2;x<hi2;x++) for(let y=0;y<H;y++) fillFence(x,y); }
  else if(shape==='cross'){ for(let y=lo2;y<hi2;y++) for(let x=0;x<W;x++) fillFence(x,y); for(let x=lo2;x<hi2;x++) for(let y=0;y<H;y++) fillFence(x,y); }
  else if(shape==='corner_se'){ for(let x=lo2;x<hi2;x++) for(let y=lo2;y<H;y++) fillFence(x,y); for(let y=lo2;y<hi2;y++) for(let x=lo2;x<W;x++) fillFence(x,y); }
  else if(shape==='corner_sw'){ for(let x=lo2;x<hi2;x++) for(let y=lo2;y<H;y++) fillFence(x,y); for(let y=lo2;y<hi2;y++) for(let x=0;x<hi2;x++) fillFence(x,y); }
  else if(shape==='corner_ne'){ for(let x=lo2;x<hi2;x++) for(let y=0;y<hi2;y++) fillFence(x,y); for(let y=lo2;y<hi2;y++) for(let x=lo2;x<W;x++) fillFence(x,y); }
  else if(shape==='corner_nw'){ for(let x=lo2;x<hi2;x++) for(let y=0;y<hi2;y++) fillFence(x,y); for(let y=lo2;y<hi2;y++) for(let x=0;x<hi2;x++) fillFence(x,y); }
  else if(shape==='t_south'){ for(let y=lo2;y<hi2;y++) for(let x=0;x<W;x++) fillFence(x,y); for(let x=lo2;x<hi2;x++) for(let y=hi2;y<H;y++) fillFence(x,y); }
  else if(shape==='t_north'){ for(let y=lo2;y<hi2;y++) for(let x=0;x<W;x++) fillFence(x,y); for(let x=lo2;x<hi2;x++) for(let y=0;y<lo2;y++) fillFence(x,y); }
  else if(shape==='t_east'){ for(let x=lo2;x<hi2;x++) for(let y=0;y<H;y++) fillFence(x,y); for(let y=lo2;y<hi2;y++) for(let x=hi2;x<W;x++) fillFence(x,y); }
  else if(shape==='t_west'){ for(let x=lo2;x<hi2;x++) for(let y=0;y<H;y++) fillFence(x,y); for(let y=lo2;y<hi2;y++) for(let x=0;x<lo2;x++) fillFence(x,y); }

  return grid;
}

// ─── DOUBLE TRACK PATH ───────────────────────────────────────────────────────
function makeCartTrack(shape, surface, seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  // Two ruts with transparent middle — rut width 2px each, gap 4px transparent centre
  const trackW=10, lo=Math.floor((W-trackW)/2), hi=lo+trackW;
  const rutW=2, gapW=6;
  // rut positions within track
  const rut1lo=lo, rut1hi=lo+rutW;
  const rut2lo=hi-rutW, rut2hi=hi;

  const fillRut=(x,y)=>{
    let c;
    if(surface==='dirt'){ c=jitter([95,68,32,255],16,rng); if(rng()<0.08) c=jitter([75,52,22,255],8,rng); }
    else if(surface==='mud'){ c=jitter([72,50,28,255],14,rng); if(rng()<0.1) c=jitter([55,75,58,255],10,rng); }
    else { c=jitter([95,68,32,255],16,rng); } // default dirt
    setPixel(grid,x,y,c);
  };

  if(shape==='h'){
    // horizontal track — ruts run left-right, transparent middle strip
    for(let y=rut1lo;y<rut1hi;y++) for(let x=0;x<W;x++) fillRut(x,y);
    for(let y=rut2lo;y<rut2hi;y++) for(let x=0;x<W;x++) fillRut(x,y);
    // edge marks
    for(let x=0;x<W;x++){ setPixel(grid,x,rut1lo,jitter([65,50,28,255],5,rng)); setPixel(grid,x,rut2hi-1,jitter([65,50,28,255],5,rng)); }
  } else if(shape==='v'){
    for(let x=rut1lo;x<rut1hi;x++) for(let y=0;y<H;y++) fillRut(x,y);
    for(let x=rut2lo;x<rut2hi;x++) for(let y=0;y<H;y++) fillRut(x,y);
    for(let y=0;y<H;y++){ setPixel(grid,rut1lo,y,jitter([65,50,28,255],5,rng)); setPixel(grid,rut2hi-1,y,jitter([65,50,28,255],5,rng)); }
  } else if(shape==='cross'){
    // H ruts
    for(let y=rut1lo;y<rut1hi;y++) for(let x=0;x<W;x++) fillRut(x,y);
    for(let y=rut2lo;y<rut2hi;y++) for(let x=0;x<W;x++) fillRut(x,y);
    // V ruts
    for(let x=rut1lo;x<rut1hi;x++) for(let y=0;y<H;y++) fillRut(x,y);
    for(let x=rut2lo;x<rut2hi;x++) for(let y=0;y<H;y++) fillRut(x,y);
  } else if(shape==='corner_se'){
    for(let x=rut1lo;x<rut1hi;x++) for(let y=lo;y<H;y++) fillRut(x,y);
    for(let x=rut2lo;x<rut2hi;x++) for(let y=lo;y<H;y++) fillRut(x,y);
    for(let y=rut1lo;y<rut1hi;y++) for(let x=lo;x<W;x++) fillRut(x,y);
    for(let y=rut2lo;y<rut2hi;y++) for(let x=lo;x<W;x++) fillRut(x,y);
  } else if(shape==='corner_sw'){
    for(let x=rut1lo;x<rut1hi;x++) for(let y=lo;y<H;y++) fillRut(x,y);
    for(let x=rut2lo;x<rut2hi;x++) for(let y=lo;y<H;y++) fillRut(x,y);
    for(let y=rut1lo;y<rut1hi;y++) for(let x=0;x<hi;x++) fillRut(x,y);
    for(let y=rut2lo;y<rut2hi;y++) for(let x=0;x<hi;x++) fillRut(x,y);
  } else if(shape==='corner_ne'){
    for(let x=rut1lo;x<rut1hi;x++) for(let y=0;y<hi;y++) fillRut(x,y);
    for(let x=rut2lo;x<rut2hi;x++) for(let y=0;y<hi;y++) fillRut(x,y);
    for(let y=rut1lo;y<rut1hi;y++) for(let x=lo;x<W;x++) fillRut(x,y);
    for(let y=rut2lo;y<rut2hi;y++) for(let x=lo;x<W;x++) fillRut(x,y);
  } else if(shape==='corner_nw'){
    for(let x=rut1lo;x<rut1hi;x++) for(let y=0;y<hi;y++) fillRut(x,y);
    for(let x=rut2lo;x<rut2hi;x++) for(let y=0;y<hi;y++) fillRut(x,y);
    for(let y=rut1lo;y<rut1hi;y++) for(let x=0;x<hi;x++) fillRut(x,y);
    for(let y=rut2lo;y<rut2hi;y++) for(let x=0;x<hi;x++) fillRut(x,y);
  } else if(shape==='t_south'){
    for(let y=rut1lo;y<rut1hi;y++) for(let x=0;x<W;x++) fillRut(x,y);
    for(let y=rut2lo;y<rut2hi;y++) for(let x=0;x<W;x++) fillRut(x,y);
    for(let x=rut1lo;x<rut1hi;x++) for(let y=hi;y<H;y++) fillRut(x,y);
    for(let x=rut2lo;x<rut2hi;x++) for(let y=hi;y<H;y++) fillRut(x,y);
  } else if(shape==='t_north'){
    for(let y=rut1lo;y<rut1hi;y++) for(let x=0;x<W;x++) fillRut(x,y);
    for(let y=rut2lo;y<rut2hi;y++) for(let x=0;x<W;x++) fillRut(x,y);
    for(let x=rut1lo;x<rut1hi;x++) for(let y=0;y<lo;y++) fillRut(x,y);
    for(let x=rut2lo;x<rut2hi;x++) for(let y=0;y<lo;y++) fillRut(x,y);
  } else if(shape==='t_east'){
    for(let x=rut1lo;x<rut1hi;x++) for(let y=0;y<H;y++) fillRut(x,y);
    for(let x=rut2lo;x<rut2hi;x++) for(let y=0;y<H;y++) fillRut(x,y);
    for(let y=rut1lo;y<rut1hi;y++) for(let x=hi;x<W;x++) fillRut(x,y);
    for(let y=rut2lo;y<rut2hi;y++) for(let x=hi;x<W;x++) fillRut(x,y);
  } else if(shape==='t_west'){
    for(let x=rut1lo;x<rut1hi;x++) for(let y=0;y<H;y++) fillRut(x,y);
    for(let x=rut2lo;x<rut2hi;x++) for(let y=0;y<H;y++) fillRut(x,y);
    for(let y=rut1lo;y<rut1hi;y++) for(let x=0;x<lo;x++) fillRut(x,y);
    for(let y=rut2lo;y<rut2hi;y++) for(let x=0;x<lo;x++) fillRut(x,y);
  }
  return grid;
}

// ─── NEW EXTRAS GENERATORS ───────────────────────────────────────────────────
function makeGoldPile(seed) {
  const W=16,H=12, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const GL=[215,182,48,255],GD=[165,132,28,255],GH=[248,222,88,255],GM=[195,158,38,255];
  const coin=(x,y,r)=>{
    for(let dx=-r;dx<=r;dx++) for(let dy=-r;dy<=r;dy++){
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<=r){ const lt=(dx/r*0.3+dy/r*0.3)*0.5+0.5; setPixel(grid,x+dx,y+dy,jitter(lerp(GH,GD,lt),12,rng)); }
    }
    setPixel(grid,x,y,jitter(GH,6,rng));
  };
  // scattered coins of varying sizes
  [[8,6,4],[4,8,2],[12,7,2],[6,4,2],[11,4,3],[5,9,1],[13,5,1],[9,9,2],[3,5,1]].forEach(([x,y,r])=>coin(x,y,r));
  // sparkle highlights
  for(let i=0;i<5;i++) setPixel(grid,2+Math.floor(rng()*12),1+Math.floor(rng()*10),[255,245,180,255]);
  return grid;
}

function makeCart(seed) {
  const W=22,H=18, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const WD=[105,72,35,255],WL=[138,98,52,255],WD2=[72,48,18,255];
  const MT=[88,82,75,255],MTL=[115,108,98,255];
  const cx=W/2,cy=H/2;
  // cart body — top-down rectangle
  for(let x=3;x<W-3;x++) for(let y=4;y<H-4;y++) setPixel(grid,x,y,jitter(rng()<0.5?WD:WL,10,rng));
  // planks
  for(let x=4;x<W-4;x+=3) for(let y=4;y<H-4;y++) setPixel(grid,x,y,jitter(WD2,6,rng));
  // frame border
  for(let x=3;x<W-3;x++){ setPixel(grid,x,4,jitter(WD2,5,rng)); setPixel(grid,x,H-5,jitter(WD2,5,rng)); }
  for(let y=4;y<H-4;y++){ setPixel(grid,3,y,jitter(WD2,5,rng)); setPixel(grid,W-4,y,jitter(WD2,5,rng)); }
  // four wheels — circles
  [[4,3],[W-5,3],[4,H-4],[W-5,H-4]].forEach(([wx,wy])=>{
    for(let dx=-2;dx<=2;dx++) for(let dy=-2;dy<=2;dy++){
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<=2.5) setPixel(grid,wx+dx,wy+dy,jitter(d<=1?MTL:WD2,8,rng));
    }
  });
  // axles
  for(let x=3;x<W-3;x++) setPixel(grid,x,3,jitter(MT,5,rng));
  for(let x=3;x<W-3;x++) setPixel(grid,x,H-4,jitter(MT,5,rng));
  return grid;
}

function makeSkeleton(seed) {
  const W=12,H=18, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const BN=[215,208,195,255],BND=[165,158,145,255],BNS=[128,122,110,255];
  const blood=[155,18,18,200];
  const r2=mulberry32(seed+4442);

  const headDetached=r2()<0.35;
  const leftArmDetached=r2()<0.4;
  const rightArmDetached=r2()<0.4;
  const leftLegDetached=r2()<0.25;
  const rightLegDetached=r2()<0.25;

  // scattered bones if limbs detached
  if(leftArmDetached||rightArmDetached||leftLegDetached||rightLegDetached){
    // random bone fragments
    for(let i=0;i<4;i++){
      const bx=1+Math.floor(r2()*(W-2)), by=1+Math.floor(r2()*(H-2));
      setPixel(grid,bx,by,jitter(BND,10,r2));
      if(r2()<0.5) setPixel(grid,bx+1,by,jitter(BNS,8,r2));
    }
  }

  // spine — always
  for(let y=5;y<13;y++) setPixel(grid,6,y,jitter(y%2===0?BN:BND,8,rng));

  // ribs
  [[6,6,2],[6,7,2],[6,8,2]].forEach(([cx,cy,len])=>{
    for(let dx=1;dx<=len;dx++){ setPixel(grid,cx+dx,cy,jitter(BND,8,rng)); setPixel(grid,cx-dx,cy,jitter(BND,8,rng)); }
  });

  // pelvis
  for(let dx=-2;dx<=2;dx++) setPixel(grid,6+dx,10,jitter(BN,8,rng));

  // skull
  if(!headDetached){
    for(let dx=-2;dx<=2;dx++) for(let dy=-2;dy<=2;dy++)
      if(Math.sqrt(dx*dx+dy*dy)<=2.2) setPixel(grid,6+dx,2+dy,jitter(BN,8,rng));
    setPixel(grid,5,2,[35,30,25,255]); setPixel(grid,7,2,[35,30,25,255]);
  } else {
    // detached skull offset
    const hx=r2()<0.5?1:9, hy=Math.floor(r2()*4);
    for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++)
      if(Math.sqrt(dx*dx+dy*dy)<=1.5) setPixel(grid,hx+dx,hy+dy,jitter(BN,8,rng));
    setPixel(grid,hx-1,hy,[28,24,20,255]); setPixel(grid,hx+1,hy,[28,24,20,255]);
    // stump mark
    setPixel(grid,6,4,jitter(BNS,5,rng));
  }

  // arms
  if(!leftArmDetached){
    for(let dx=1;dx<=3;dx++) setPixel(grid,6-dx,6,jitter(BND,8,rng));
  } else {
    const ax=1+Math.floor(r2()*3), ay=12+Math.floor(r2()*4);
    for(let dx=0;dx<3;dx++) setPixel(grid,ax+dx,ay,jitter(BND,10,rng));
  }
  if(!rightArmDetached){
    for(let dx=1;dx<=3;dx++) setPixel(grid,6+dx,6,jitter(BND,8,rng));
  } else {
    const ax=7+Math.floor(r2()*3), ay=12+Math.floor(r2()*4);
    for(let dx=0;dx<3;dx++) setPixel(grid,ax+dx,ay,jitter(BND,10,rng));
  }

  // legs
  if(!leftLegDetached){
    for(let y=11;y<17;y++) setPixel(grid,5,y,jitter(BND,8,rng));
    setPixel(grid,4,17,jitter(BN,6,rng)); setPixel(grid,5,17,jitter(BN,6,rng));
  } else {
    const lx=1+Math.floor(r2()*3), ly=1+Math.floor(r2()*3);
    for(let dy=0;dy<4;dy++) setPixel(grid,lx,ly+dy,jitter(BND,10,rng));
  }
  if(!rightLegDetached){
    for(let y=11;y<17;y++) setPixel(grid,7,y,jitter(BND,8,rng));
    setPixel(grid,7,17,jitter(BN,6,rng)); setPixel(grid,8,17,jitter(BN,6,rng));
  } else {
    const lx=8+Math.floor(r2()*3), ly=1+Math.floor(r2()*3);
    for(let dy=0;dy<4;dy++) setPixel(grid,lx,ly+dy,jitter(BND,10,rng));
  }

  return grid;
}

function makeDeadBody(seed) {
  const W=16,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const SK=[188,158,128,255],SKD=[148,118,88,255];
  const CL=jitter([[148,48,42,255],[48,88,148,255],[88,138,48,255],[108,88,148,255],[155,125,75,255]][Math.floor(rng()*5)],14,rng);
  const hair=jitter([[48,35,22,255],[215,185,100,255],[88,55,28,255],[42,42,42,255],[178,145,95,255]][Math.floor(rng()*5)],10,rng);
  const blood=[155,18,18,200],bloodD=[108,12,12,180];
  const r2=mulberry32(seed+3331);

  // blood pool — large splatter under body
  for(let dx=-4;dx<=4;dx++) for(let dy=-3;dy<=3;dy++){
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d<=3.5+r2()*1.5&&r2()<0.75) setPixel(grid,8+dx,11+dy,jitter(r2()<0.4?blood:bloodD,14,r2));
  }
  // blood splatter dots around
  for(let i=0;i<12;i++){
    const bx=2+Math.floor(r2()*12), by=3+Math.floor(r2()*14);
    if(r2()<0.5) setPixel(grid,bx,by,jitter(blood,12,r2));
  }

  // decide which limbs are detached
  const headDetached=r2()<0.4;
  const leftArmDetached=r2()<0.45;
  const rightArmDetached=r2()<0.45;
  const leftLegDetached=r2()<0.3;
  const rightLegDetached=r2()<0.3;

  // torso — always present
  for(let x=5;x<11;x++) for(let y=6;y<14;y++) setPixel(grid,x,y,jitter(CL,10,rng));

  // head — either attached or detached nearby
  if(!headDetached){
    for(let dx=-2;dx<=2;dx++) for(let dy=-2;dy<=2;dy++)
      if(Math.sqrt(dx*dx+dy*dy)<=2.2) setPixel(grid,8+dx,3+dy,jitter(SK,10,rng));
    for(let dx=-2;dx<=2;dx++) setPixel(grid,8+dx,1,jitter(hair,10,rng));
  } else {
    // detached head — offset to side with blood stump
    const hox=r2()<0.5?1:11, hoy=1+Math.floor(r2()*4);
    for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++)
      if(Math.sqrt(dx*dx+dy*dy)<=1.5) setPixel(grid,hox+dx,hoy+dy,jitter(SK,10,rng));
    for(let dx=-1;dx<=1;dx++) setPixel(grid,hox+dx,hoy-1,jitter(hair,8,rng));
    // stump on torso
    for(let dx=-1;dx<=1;dx++) setPixel(grid,8+dx,5,jitter(blood,8,rng));
  }

  // left arm
  if(!leftArmDetached){
    for(let dx=0;dx<3;dx++){ setPixel(grid,2+dx,7,jitter(SK,10,rng)); setPixel(grid,2+dx,8,jitter(CL,10,rng)); }
  } else {
    const ax=1+Math.floor(r2()*3), ay=14+Math.floor(r2()*4);
    for(let dx=0;dx<3;dx++) setPixel(grid,ax+dx,ay,jitter(SKD,10,rng));
    setPixel(grid,5,7,jitter(blood,8,rng));
  }

  // right arm
  if(!rightArmDetached){
    for(let dx=0;dx<3;dx++){ setPixel(grid,11+dx,7,jitter(SK,10,rng)); setPixel(grid,11+dx,8,jitter(CL,10,rng)); }
  } else {
    const ax=11+Math.floor(r2()*3), ay=14+Math.floor(r2()*4);
    for(let dx=0;dx<3;dx++) setPixel(grid,ax+dx,ay,jitter(SKD,10,rng));
    setPixel(grid,10,7,jitter(blood,8,rng));
  }

  // legs
  if(!leftLegDetached){
    for(let y=14;y<19;y++){ setPixel(grid,5,y,jitter(CL,10,rng)); setPixel(grid,6,y,jitter(CL,10,rng)); }
    setPixel(grid,5,19,jitter(SK,8,rng)); setPixel(grid,6,19,jitter(SK,8,rng));
  } else {
    const lx=1+Math.floor(r2()*4), ly=1+Math.floor(r2()*3);
    for(let dy=0;dy<4;dy++) setPixel(grid,lx,ly+dy,jitter(CL,10,rng));
    setPixel(grid,5,14,jitter(blood,8,rng)); setPixel(grid,6,14,jitter(blood,8,rng));
  }

  if(!rightLegDetached){
    for(let y=14;y<19;y++){ setPixel(grid,9,y,jitter(CL,10,rng)); setPixel(grid,10,y,jitter(CL,10,rng)); }
    setPixel(grid,9,19,jitter(SK,8,rng)); setPixel(grid,10,19,jitter(SK,8,rng));
  } else {
    const lx=11+Math.floor(r2()*4), ly=1+Math.floor(r2()*3);
    for(let dy=0;dy<4;dy++) setPixel(grid,lx,ly+dy,jitter(CL,10,rng));
    setPixel(grid,9,14,jitter(blood,8,rng)); setPixel(grid,10,14,jitter(blood,8,rng));
  }

  return grid;
}

function makeDirtHole(seed) {
  const W=16,H=14, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const DK=[22,18,14,255],D1=[55,40,22,255],D2=[72,52,28,255],D3=[95,68,38,255];
  const cx=8,cy=7,rx=7,ry=6;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy,dist=Math.sqrt((dx/rx)**2+(dy/ry)**2);
    if(dist<0.6) setPixel(grid,x,y,jitter(DK,5,rng));
    else if(dist<0.8) setPixel(grid,x,y,jitter(D1,10,rng));
    else if(dist<0.92) setPixel(grid,x,y,jitter(D2,12,rng));
    else if(dist<=1) setPixel(grid,x,y,jitter(D3,10,rng));
  }
  // shadow on bottom-right
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy,dist=Math.sqrt((dx/rx)**2+(dy/ry)**2);
    if(dist>=0.75&&dist<=1&&dx>0&&dy>0) setPixel(grid,x,y,lerp(grid[y][x]||D3,[15,12,8,255],0.5));
  }
  return grid;
}

// ─── NEW PLANT GENERATORS ────────────────────────────────────────────────────
function makePlant(type, seed) {
  const rng=mulberry32(seed);
  if(type==='fern'){
    const W=14,H=14, grid=createPixelGrid(W,H);
    const DG=[30,75,28,255],MG=[48,105,42,255],LG=[70,138,55,255];
    const cx=7,cy=7;
    for(let a=0;a<360;a+=40){
      const rad=a*Math.PI/180, len=4+Math.floor(rng()*2);
      for(let d=1;d<=len;d++){
        const x=Math.round(cx+Math.cos(rad)*d),y=Math.round(cy+Math.sin(rad)*d);
        setPixel(grid,x,y,jitter(d<len/2?LG:MG,12,rng));
        const sr=rad+Math.PI/2;
        if(d>1&&d<len){ setPixel(grid,Math.round(x+Math.cos(sr)),Math.round(y+Math.sin(sr)),jitter(LG,10,rng)); setPixel(grid,Math.round(x-Math.cos(sr)),Math.round(y-Math.sin(sr)),jitter(MG,10,rng)); }
      }
    }
    setPixel(grid,cx,cy,jitter(DG,6,rng));
    return grid;
  } else if(type==='reeds'){
    // top-down: cluster of reed tops seen from above — circles/dots in a group
    const W=14,H=14, grid=createPixelGrid(W,H);
    const G=[58,95,42,255],GL=[78,122,55,255],GD=[40,70,28,255];
    const TIP=[158,128,52,255],TIPD=[128,98,32,255]; // seed head colour
    // scattered reed top-down positions — each is a small circle (stem cross-section + seed head)
    const positions=[[4,4],[7,3],[10,5],[3,7],[6,7],[9,8],[5,10],[8,11],[11,7],[4,11]];
    const num=5+Math.floor(rng()*5);
    positions.slice(0,num).forEach(([rx,ry])=>{
      // stem cross section — small circle
      setPixel(grid,rx,ry,jitter(G,10,rng));
      if(rng()<0.5) setPixel(grid,rx+1,ry,jitter(GL,10,rng));
      if(rng()<0.5) setPixel(grid,rx,ry-1,jitter(GL,10,rng));
      // seed head — slightly wider darker dot
      setPixel(grid,rx,ry,jitter(TIP,8,rng));
      setPixel(grid,rx+1,ry,jitter(TIPD,8,rng));
    });
    return grid;
  } else if(type==='lily'){
    const W=14,H=14, grid=createPixelGrid(W,H);
    const LP=[48,105,55,255],LPD=[32,78,38,255],LPL=[65,138,62,255];
    const FW=[232,215,215,255],FP=[215,158,188,255];
    const cx=7,cy=7,r=5;
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const dx=x-cx,dy=y-cy,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<=r){ const lt=(dx/r*0.2+dy/r*0.2)*0.5+0.5; let c=lerp(LPL,LPD,lt); c=jitter(c,10,rng); setPixel(grid,x,y,c); }
    }
    for(let y=cy;y<cy+r;y++) setPixel(grid,cx,y,null);
    setPixel(grid,cx,cy,FW); setPixel(grid,cx-1,cy,FP); setPixel(grid,cx+1,cy,FP); setPixel(grid,cx,cy-1,FP);
    return grid;
  } else if(type==='vine'){
    const W=16,H=16, grid=createPixelGrid(W,H);
    const MG=[52,100,42,255],LG=[72,132,52,255];
    let x=Math.floor(W/2),y=0;
    for(let step=0;step<30;step++){
      setPixel(grid,x,y,jitter(MG,12,rng));
      if(rng()<0.4) setPixel(grid,x-1,y,jitter(LG,12,rng));
      if(rng()<0.4) setPixel(grid,x+1,y,jitter(LG,12,rng));
      x=Math.max(1,Math.min(W-2,x+Math.round((rng()-0.5)*3)));
      y=Math.min(H-1,y+1);
    }
    return grid;
  } else if(type==='cactus'){
    // top-down: cactus seen from directly above — circular main body + two arm circles
    const W=14,H=14, grid=createPixelGrid(W,H);
    const CG=[55,128,55,255],CGD=[35,95,35,255],CGL=[78,158,68,255],SP=[195,188,155,255];
    const cx=7,cy=7;
    // main body — large circle
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const dx=x-cx,dy=y-cy,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<=3.5){
        const lt=(dx/3.5*0.25+dy/3.5*0.25)*0.5+0.5;
        setPixel(grid,x,y,jitter(lerp(CGL,CGD,lt),10,rng));
      }
    }
    // left arm — smaller circle offset left
    for(let dx=-2;dx<=2;dx++) for(let dy=-2;dy<=2;dy++){
      if(Math.sqrt(dx*dx+dy*dy)<=2) setPixel(grid,cx-4+dx,cy+dy,jitter(lerp(CGL,CGD,0.5),10,rng));
    }
    // right arm — smaller circle offset right
    for(let dx=-2;dx<=2;dx++) for(let dy=-2;dy<=2;dy++){
      if(Math.sqrt(dx*dx+dy*dy)<=1.5) setPixel(grid,cx+4+dx,cy-1+dy,jitter(lerp(CGL,CGD,0.5),10,rng));
    }
    // spines — small dots around perimeter
    for(let a=0;a<360;a+=45){
      const rad=a*Math.PI/180;
      setPixel(grid,Math.round(cx+Math.cos(rad)*4),Math.round(cy+Math.sin(rad)*4),jitter(SP,8,rng));
    }
    // flower top
    setPixel(grid,cx,cy-1,jitter([218,80,80,255],10,rng));
    setPixel(grid,cx,cy,jitter([235,200,50,255],8,rng));
    return grid;
  }
  return createPixelGrid(12,12);
}

// ─── DYNAMIC WATER TILE ──────────────────────────────────────────────────────
function makeWaterTile(neighbours, seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const WD=[52,95,148,255],WL=[68,115,168,255],WH=[138,185,218,255],WD2=[38,78,128,255];
  const SHORE=[185,175,138,255],FOAM=[228,235,240,255];

  // base water
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const r=rng(); let c=r<0.45?WD:r<0.75?WL:WD2; c=jitter(c,10,rng);
    if((x+y)%6===0) c=lerp(c,WH,0.3);
    setPixel(grid,x,y,c);
  }

  // shore/foam edges for land neighbours
  const landTypes=new Set(['grass','sand','dirt','mud','cobble','farmland','forest_floor','rocky','cave','corrupt','snow','ice']);
  const shoreDepth=4;
  const sides2=[
    {key:'top',    getPixel:(d,s)=>({x:s,y:d})},
    {key:'bottom', getPixel:(d,s)=>({x:s,y:H-1-d})},
    {key:'left',   getPixel:(d,s)=>({x:d,y:s})},
    {key:'right',  getPixel:(d,s)=>({x:W-1-d,y:s})},
  ];
  sides2.forEach(side=>{
    const nb=neighbours[side.key];
    if(!nb||!landTypes.has(nb)) return;
    const edgeC=nb==='sand'?SHORE:nb==='snow'||nb==='ice'?FOAM:SHORE;
    for(let d=0;d<shoreDepth;d++){
      const t=d/shoreDepth, blendStr=(1-t)*0.8;
      for(let s=0;s<W;s++){
        const {x,y}=side.getPixel(d,s);
        const ex=grid[y]?.[x];
        if(ex) grid[y][x]=lerp(jitter(edgeC,12,rng),ex,1-blendStr);
      }
    }
    // foam line at very edge
    for(let s=0;s<W;s++){
      const {x,y}=side.getPixel(0,s);
      if(rng()<0.6) setPixel(grid,x,y,jitter(FOAM,8,rng));
    }
  });

  return grid;
}


// ─── NEW GENERATORS ───────────────────────────────────────────────────────────

// CRACKED EARTH terrain (20x20 tileable)
function makeCrackedEarth(seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const D1=[148,118,75,255],D2=[168,138,90,255],D3=[125,98,58,255],DK=[88,68,35,255];
  // dry dusty base
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const r=rng(); let c=r<0.4?D1:r<0.7?D2:D3; c=jitter(c,12,rng);
    setPixel(grid,x,y,c);
  }
  // crack network — dark jagged lines
  const numCracks=4+Math.floor(rng()*4);
  for(let i=0;i<numCracks;i++){
    let x=Math.floor(rng()*W), y=Math.floor(rng()*H);
    const len=4+Math.floor(rng()*8);
    for(let s=0;s<len;s++){
      setPixel(grid,x,y,DK);
      if(rng()<0.3&&x+1<W) setPixel(grid,x+1,y,jitter(DK,5,rng)); // slight width
      x=Math.max(0,Math.min(W-1,x+Math.round((rng()-0.4)*3)));
      y=Math.max(0,Math.min(H-1,y+Math.round((rng()-0.3)*3)));
    }
  }
  // pale highlight on crack edges
  for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++){
    if(grid[y][x]&&grid[y][x][0]===DK[0]&&grid[y-1]&&grid[y-1][x]&&grid[y-1][x][0]!==DK[0])
      setPixel(grid,x,y-1,lerp(grid[y-1][x],[215,198,162,255],0.3));
  }
  return grid;
}

// TENT (top-down: triangular canvas roof seen from above)
function makeTent(seed) {
  const W=24,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const canvasCols=[
    [185,165,120,255], // canvas tan
    [128,95,75,255],   // brown leather
    [95,118,85,255],   // green canvas
    [115,85,75,255],   // rust red
  ];
  const base=jitter(canvasCols[Math.floor(rng()*canvasCols.length)],14,rng);
  const baseD=lerp(base,[20,15,10,255],0.4);
  const baseL=lerp(base,[255,245,220,255],0.2);
  const pole=[95,72,38,255];
  const cx=W/2, cy=H/2;

  // tent body — triangular faces meeting at centre peak
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx, dy=y-cy;
    const angle=Math.atan2(dy,dx)*180/Math.PI;
    const dist=Math.min(1,Math.sqrt((dx/cx)**2+(dy/cy)**2));
    if(dist>1) continue;
    const lt=dist*0.6+(dx/cx*0.2+dy/cy*0.2)*0.5+0.5;
    let c=lerp(baseL,baseD,lt); c=jitter(c,10,rng);
    // canvas texture — subtle ripple lines
    if(Math.floor(dist*8)%2===0) c=lerp(c,baseD,0.12);
    setPixel(grid,x,y,c);
  }
  // ridge lines corner to peak
  [[0,0],[W-1,0],[0,H-1],[W-1,H-1]].forEach(([x2,y2])=>{
    const steps=Math.max(Math.abs(cx-x2),Math.abs(cy-y2));
    for(let s=0;s<=steps;s++){
      const t=s/Math.max(1,steps);
      setPixel(grid,Math.round(x2+(cx-x2)*t)|0,Math.round(y2+(cy-y2)*t)|0,lerp(baseD,[15,10,5,255],0.3));
    }
  });
  // centre pole
  setPixel(grid,cx|0,cy|0,pole); setPixel(grid,(cx+1)|0,cy|0,pole);
  // entrance flap — darker opening at bottom centre
  for(let dx=-2;dx<=2;dx++) setPixel(grid,(cx+dx)|0,H-2,jitter(baseD,6,rng));
  for(let dx=-1;dx<=1;dx++) setPixel(grid,(cx+dx)|0,H-1,[25,20,12,255]);
  return grid;
}

// TRAPDOOR (top-down: wooden door in floor with handle and hinge)
function makeTrapdoor(seed) {
  const W=14,H=14, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const WD=[108,75,35,255],WL=[138,102,52,255],WD2=[78,52,20,255];
  const MT=[92,85,75,255],MTL=[118,112,100,255];
  const DK=[22,18,14,255]; // dark opening hint

  // door frame — slightly raised border
  for(let x=0;x<W;x++) for(let y=0;y<H;y++) setPixel(grid,x,y,jitter(WD2,8,rng));
  // door panel — planks
  for(let x=1;x<W-1;x++) for(let y=1;y<H-1;y++){
    let c=jitter(rng()<0.5?WD:WL,12,rng);
    if(x%4===0) c=lerp(c,WD2,0.35); // plank seam
    setPixel(grid,x,y,c);
  }
  // hinges — left side
  [[1,2],[1,W-4]].forEach(([hx,hy])=>{
    for(let dx=0;dx<2;dx++) for(let dy=0;dy<2;dy++) setPixel(grid,hx+dx,hy+dy,jitter(MT,6,rng));
    setPixel(grid,hx,hy,jitter(MTL,5,rng));
  });
  // handle — small ring on right side centre
  const hx=W-3, hy=H/2|0;
  setPixel(grid,hx,hy-1,jitter(MTL,5,rng));
  setPixel(grid,hx,hy,jitter(MT,5,rng));
  setPixel(grid,hx,hy+1,jitter(MTL,5,rng));
  // shadow hint at edges
  for(let x=1;x<W-1;x++) setPixel(grid,x,H-2,lerp(grid[H-2][x]||WD,[15,12,8,255],0.25));
  for(let y=1;y<H-1;y++) setPixel(grid,W-2,y,lerp(grid[y][W-2]||WD,[15,12,8,255],0.2));
  return grid;
}

// DESK WITH PAPERS (top-down: rectangular desk, papers/quill/inkwell on surface)
function makeDesk(seed) {
  const W=20,H=14, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const rngW=mulberry32(seed+4441);
  const woodDesk=[
    {a:[108,78,38,255],b:[138,105,55,255],c:[82,55,22,255]},
    {a:[75,48,20,255],b:[98,65,32,255],c:[55,35,12,255]},
    {a:[188,152,88,255],b:[215,178,115,255],c:[158,118,62,255]},
  ][Math.floor(rngW()*3)];
  const WD=jitter(woodDesk.a,12,rng), WL=jitter(woodDesk.b,12,rng), WD2=jitter(woodDesk.c,10,rng);
  // desk surface
  for(let x=0;x<W;x++) for(let y=0;y<H;y++){
    let c=jitter(rng()<0.5?WD:WL,10,rng);
    if(x%5===0) c=lerp(c,WD2,0.25);
    setPixel(grid,x,y,c);
  }
  // border
  for(let x=0;x<W;x++){ setPixel(grid,x,0,jitter(WD2,4,rng)); setPixel(grid,x,H-1,jitter(WD2,4,rng)); }
  for(let y=0;y<H;y++){ setPixel(grid,0,y,jitter(WD2,4,rng)); setPixel(grid,W-1,y,jitter(WD2,4,rng)); }
  // papers — parchment rectangles
  const rng2=mulberry32(seed+8881);
  [[2,2,7,5],[10,3,6,4],[2,7,5,4]].forEach(([px,py,pw,ph],i)=>{
    if(rng2()<0.3) return; // randomly absent
    const pc=jitter([215,205,178,255],12,rng2);
    for(let dx=0;dx<pw;dx++) for(let dy=0;dy<ph;dy++) setPixel(grid,px+dx,py+dy,pc);
    // text lines on paper
    for(let line=1;line<ph-1;line+=2) for(let dx=1;dx<pw-1;dx+=2) if(rng2()<0.6) setPixel(grid,px+dx,py+line,jitter([95,82,55,255],8,rng2));
    setPixel(grid,px,py,jitter([175,162,132,255],6,rng2)); // corner shadow
  });
  // inkwell — small dark circle
  for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++) if(Math.sqrt(dx*dx+dy*dy)<=1.2) setPixel(grid,15+dx,4+dy,jitter([25,20,15,255],6,rng2));
  setPixel(grid,15,3,jitter([45,38,28,255],5,rng2)); // lid
  // quill — diagonal line
  [[17,2],[16,3],[15,4]].forEach(([x,y])=>setPixel(grid,x,y,jitter([218,205,155,255],10,rng2)));
  setPixel(grid,17,1,jitter([238,225,175,255],8,rng2));
  return grid;
}

// STOOL (top-down: small circular seat)
function makeStool(seed) {
  const W=10,H=10, rng=mulberry32(seed);
  const rngW=mulberry32(seed+5552);
  const woodS=[
    {a:[108,78,38,255],b:[138,105,55,255]},
    {a:[72,45,18,255],b:[95,62,28,255]},
    {a:[185,148,85,255],b:[215,178,112,255]},
    {a:[145,105,50,255],b:[178,135,72,255]},
  ][Math.floor(rngW()*4)];
  const grid=createPixelGrid(W,H);
  const cx=5,cy=5,r=4;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<=r){
      const lt=(dx/r*0.25+dy/r*0.25)*0.5+0.5;
      let c=lerp(jitter(woodS.b,14,rng),jitter(woodS.a,14,rng),lt);
      if(Math.floor(dist*2)%3===0) c=lerp(c,woodS.a,0.15); // grain
      setPixel(grid,x,y,c);
    }
    if(dist>=r-0.8&&dist<=r) setPixel(grid,x,y,jitter(woodS.a,6,rng)); // rim
  }
  // centre leg hint
  setPixel(grid,cx,cy,jitter([65,45,18,255],6,rng));
  return grid;
}

// WARDROBE (top-down: rectangular with two door panels and handles)
function makeWardrobe(seed) {
  // top-down: just a wooden rectangle — same principle as bookshelf/drawers
  const W=18,H=12, rng=mulberry32(seed);
  const rngW=mulberry32(seed+6663);
  const woodW=[
    {a:[105,72,35,255],b:[138,98,52,255],c:[75,50,18,255]},
    {a:[68,42,18,255],b:[88,58,28,255],c:[48,30,10,255]},
    {a:[178,142,85,255],b:[208,172,115,255],c:[148,112,58,255]},
    {a:[145,102,48,255],b:[178,132,72,255],c:[115,78,28,255]},
  ][Math.floor(rngW()*4)];
  const grid=createPixelGrid(W,H);
  const FR=jitter(woodW.a,12,rng), FRL=jitter(woodW.b,12,rng), FRD=jitter(woodW.c,10,rng);

  // flat top surface — wood grain running lengthwise
  for(let x=0;x<W;x++) for(let y=0;y<H;y++){
    const lt=(x/W*0.2+y/H*0.15);
    let c=lerp(FRL,FR,lt); c=jitter(c,12,rng);
    if(x%4===0) c=lerp(c,FRD,0.28); // grain line
    setPixel(grid,x,y,c);
  }
  // border shadow
  for(let x=0;x<W;x++){ setPixel(grid,x,0,jitter(FRD,4,rng)); setPixel(grid,x,H-1,jitter(FRD,4,rng)); }
  for(let y=0;y<H;y++){ setPixel(grid,0,y,jitter(FRD,4,rng)); setPixel(grid,W-1,y,jitter(FRD,4,rng)); }
  // top-left highlight
  for(let x=1;x<W-1;x++) setPixel(grid,x,1,jitter(FRL,5,rng));
  for(let y=1;y<H-1;y++) setPixel(grid,1,y,jitter(FRL,5,rng));
  return grid;
}

// STAIRS (top-down: parallel bands getting narrower = steps receding upward)
function makeStairs(seed) {
  const W=16,H=20, rng=mulberry32(seed);
  const rngW=mulberry32(seed+7774);
  const stairMats=[
    {l:[168,160,148,255],d:[72,68,62,255],j:[52,48,44,255]}, // stone
    {l:[188,152,88,255],d:[88,62,25,255],j:[62,42,15,255]},  // wood
    {l:[118,112,104,255],d:[48,44,40,255],j:[32,28,25,255]}, // dark stone
  ][Math.floor(rngW()*3)];
  const {l:SL,d:SD,j:SJ} = stairMats;
  const grid=createPixelGrid(W,H);
  const numSteps=5;
  const stepH=Math.floor(H/numSteps);

  for(let step=0;step<numSteps;step++){
    const y0=step*stepH;
    // gradient: light at top (step 0), dark at bottom (step 4)
    const t=step/(numSteps-1);
    const stepCol=lerp(SL,SD,t);
    for(let x=0;x<W;x++) for(let dy=0;dy<stepH-1;dy++)
      setPixel(grid,x,y0+dy,jitter(stepCol,8,rng));
    // subtle step edge line
    for(let x=0;x<W;x++) setPixel(grid,x,y0+stepH-1,jitter(lerp(SJ,SD,0.4),4,rng));
  }
  return grid;
}

// CROP ROWS (top-down tileable, 20x20)
function makeCropRow(cropType, stage, seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const soil=[105,75,40,255],soilD=[82,55,25,255],soilL=[128,95,55,255];

  // soil base with furrow lines
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    let c=jitter(rng()<0.4?soil:rng()<0.6?soilL:soilD,12,rng);
    setPixel(grid,x,y,c);
  }
  for(let y=0;y<H;y+=4) for(let x=0;x<W;x++) setPixel(grid,x,y,lerp(soilD,[60,40,15,255],0.3));

  if(stage==='harvested') return grid; // just bare soil

  const crops={
    wheat:{
      seedling:  {stem:[85,128,45,255],head:null,hw:1,hh:1},
      growing:   {stem:[95,148,45,255],head:[185,168,65,255],hw:1,hh:2},
      mature:    {stem:[155,138,45,255],head:[218,195,65,255],hw:2,hh:3},
    },
    corn:{
      seedling:  {stem:[68,118,48,255],head:null,hw:1,hh:1},
      growing:   {stem:[78,138,52,255],head:[92,155,58,255],hw:2,hh:2},
      mature:    {stem:[62,118,42,255],head:[215,178,45,255],hw:2,hh:3},
    },
    vegetables:{
      seedling:  {stem:[68,118,48,255],head:null,hw:1,hh:1},
      growing:   {stem:[55,138,55,255],head:[85,168,45,255],hw:2,hh:2},
      mature:    {stem:[45,118,38,255],head:[188,55,55,255],hw:3,hh:2},
    },
  };
  const c=crops[cropType]?.[stage]||crops.wheat.mature;

  // plant in rows every 4px, offset alternate rows
  for(let row=0;row<Math.ceil(H/4);row++){
    const py=row*4+1;
    const off=(row%2)*2;
    for(let col=0;col<Math.ceil(W/4);col++){
      const px=col*4+off+1;
      if(px>=W||py>=H) continue;
      // stem
      setPixel(grid,px,py,jitter(c.stem,14,rng));
      if(c.hh>1&&py-1>=0) setPixel(grid,px,py-1,jitter(c.stem,12,rng));
      // head/top
      if(c.head){
        for(let dx=0;dx<c.hw;dx++) for(let dy=0;dy<1;dy++)
          setPixel(grid,px+dx-Math.floor(c.hw/2),py-c.hh+dy,jitter(c.head,14,rng));
      }
    }
  }
  return grid;
}

function makeBasin(seed) {
  // top-down: stone basin/trough with water inside
  const W=16,H=12, rng=mulberry32(seed);
  const ST=[138,132,120,255],STL=[162,155,142,255],STD=[95,90,82,255],SJ=[65,60,54,255];
  const water=[55,105,148,255],waterL=[80,130,172,255];
  const grid=createPixelGrid(W,H);

  // stone surround — top-down rectangle
  for(let x=0;x<W;x++) for(let y=0;y<H;y++){
    const row=Math.floor(y/4),off=(row%2)*3,tu=(x+off)%6,tv=y%4;
    setPixel(grid,x,y,(tu===0||tv===0)?STD:jitter(rng()<0.5?ST:STL,10,rng));
  }
  // stone rim — slightly lighter border
  for(let x=0;x<W;x++){ setPixel(grid,x,0,jitter(STL,6,rng)); setPixel(grid,x,H-1,jitter(STD,5,rng)); }
  for(let y=0;y<H;y++){ setPixel(grid,0,y,jitter(STL,6,rng)); setPixel(grid,W-1,y,jitter(STD,5,rng)); }

  // water basin interior
  for(let x=2;x<W-2;x++) for(let y=2;y<H-2;y++){
    let c=jitter(rng()<0.4?water:waterL,12,rng);
    if((x+y)%5===0) c=lerp(c,[165,205,228,255],0.2); // ripple
    setPixel(grid,x,y,c);
  }

  // drain dot in centre
  const cx=W/2|0, cy=H/2|0;
  setPixel(grid,cx,cy,[32,28,24,255]);
  setPixel(grid,cx-1,cy,jitter(STD,5,rng));
  setPixel(grid,cx+1,cy,jitter(STD,5,rng));

  return grid;
}
function makeBloodSpatter(seed) {
  const W=16,H=16, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const blood=[155,18,18,200],bloodD=[108,12,12,180],bloodL=[188,45,45,180];
  const r2=mulberry32(seed+5553);

  // main pool — irregular blob
  const cx=8,cy=8;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy;
    const dist=Math.sqrt(dx*dx+dy*dy)+(r2()-0.5)*3;
    if(dist<4+r2()*2){
      let c=jitter(r2()<0.4?blood:r2()<0.7?bloodD:bloodL,14,r2);
      if(dist<2) c=jitter(bloodD,8,r2); // darker centre (depth)
      setPixel(grid,x,y,c);
    }
  }

  // splatter dots radiating outward
  for(let i=0;i<18;i++){
    const angle=r2()*Math.PI*2;
    const len=3+Math.floor(r2()*5);
    let x=Math.round(cx+Math.cos(angle)*3), y=Math.round(cy+Math.sin(angle)*3);
    for(let d=0;d<len;d++){
      if(x>=0&&x<W&&y>=0&&y<H&&r2()<0.8) setPixel(grid,x,y,jitter(blood,16,r2));
      x=Math.round(x+Math.cos(angle)*(0.8+r2()*0.4));
      y=Math.round(y+Math.sin(angle)*(0.8+r2()*0.4));
    }
  }

  // small isolated drops
  for(let i=0;i<8;i++){
    const dx2=Math.floor(r2()*W), dy2=Math.floor(r2()*H);
    if(!grid[dy2][dx2]) setPixel(grid,dx2,dy2,jitter(blood,12,r2));
  }

  return grid;
}
function makeBonesPile(seed) {
  const W=16,H=14, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const BN=[215,208,195,255],BND=[165,158,145,255],BNS=[128,122,110,255],BNY=[195,185,148,255];
  const r2=mulberry32(seed+6664);

  // scattered bones — various sizes and orientations
  const drawBone=(x,y,len,horiz)=>{
    for(let d=0;d<len;d++){
      const bx=horiz?x+d:x, by=horiz?y:y+d;
      if(bx>=0&&bx<W&&by>=0&&by<H) setPixel(grid,bx,by,jitter(BND,12,r2));
    }
    // knobby ends
    [[x,y],[horiz?x+len-1:x,horiz?y:y+len-1]].forEach(([ex,ey])=>{
      setPixel(grid,ex,ey,jitter(BN,8,r2));
      if(ex+1<W) setPixel(grid,ex+1,ey,jitter(BNS,8,r2));
    });
  };

  // scatter several bones
  const numBones=4+Math.floor(r2()*5);
  for(let i=0;i<numBones;i++){
    const bx=1+Math.floor(r2()*(W-6));
    const by=1+Math.floor(r2()*(H-4));
    const len=3+Math.floor(r2()*4);
    const horiz=r2()<0.5;
    drawBone(bx,by,len,horiz);
  }

  // skull fragment occasionally
  if(r2()<0.5){
    const sx=2+Math.floor(r2()*(W-5)), sy=2+Math.floor(r2()*(H-5));
    for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++)
      if(Math.sqrt(dx*dx+dy*dy)<=1.4) setPixel(grid,sx+dx,sy+dy,jitter(BN,10,r2));
    setPixel(grid,sx-1,sy,[35,30,25,255]); // eye socket
  }

  return grid;
}
// ─── PATH GENERATOR ──────────────────────────────────────────────────────────
function makePath(shape, surface, seed) {
  const W=20, H=20;
  const rng=mulberry32(seed), grid=createPixelGrid(W,H);
  // Transparent surround — no grass fill, just leave grid null

  const pathW=8, lo=Math.floor((W-pathW)/2), hi=lo+pathW;

  // Surface fill function
  const fillPath=(x,y)=>{
    let c;
    if (surface==='dirt') {
      const r=rng();
      c=r<0.4?[118,88,50,255]:r<0.75?[138,105,62,255]:[95,68,32,255];
      c=jitter(c,12,rng);
      if (rng()<0.06) c=jitter([148,130,100,255],8,rng); // pebble
    } else if (surface==='cobble') {
      const S1=[118,112,105,255],S2=[98,93,86,255],SJ=[65,60,55,255];
      const row=Math.floor(y/3), off=(row%2)*2;
      const tu=(x+off)%4, tv=y%3;
      c=(tu===0||tv===0)?SJ:jitter(rng()<0.5?S1:S2,8,rng);
    } else if (surface==='stone') {
      // larger irregular flagstones
      const S1=[138,132,122,255],S2=[115,110,102,255],SJ=[72,68,62,255];
      const row=Math.floor(y/5), off=(row%2)*3;
      const tu=(x+off)%6, tv=y%5;
      c=(tu===0||tv===0)?SJ:jitter(rng()<0.5?S1:S2,10,rng);
      if (rng()<0.04) c=jitter([95,90,82,255],6,rng); // lichen patch
    } else if (surface==='planks') {
      // wooden planks running along the path direction
      const PL=[138,98,52,255],PD=[105,72,35,255],PJ=[72,50,22,255];
      // plank runs horizontal
      const plankRow=Math.floor(y/2);
      const plankCol=Math.floor(x/7);
      // board seam every 2px height, plank seam every 7px width
      if (y%2===0) c=PJ;
      else if (x%7===0) c=PJ;
      else c=jitter(plankRow%2===0?PL:PD,12,rng);
      // knots
      if (rng()<0.03) c=jitter([88,58,28,255],6,rng);
    } else if (surface==='gravel') {
      const G=[148,138,118,255],GD=[115,108,90,255],GL=[168,158,138,255];
      c=jitter(rng()<0.4?G:rng()<0.6?GD:GL,14,rng);
      // individual pebble highlight dots
      if (rng()<0.12) c=jitter([178,168,148,255],6,rng);
    } else if (surface==='mud') {
      const M=[88,65,40,255],ML=[108,82,52,255],MD=[68,48,28,255];
      c=jitter(rng()<0.4?M:rng()<0.7?ML:MD,16,rng);
      // puddle pixels
      if (rng()<0.06) c=jitter([62,78,68,255],10,rng);
    } else {
      c=jitter([118,88,50,255],12,rng); // fallback dirt
    }
    setPixel(grid,x,y,c);
  };

  // Edge pixel — slightly darker than surface
  const edgeCol = surface==='planks'?[72,50,22,255]:surface==='cobble'||surface==='stone'?[55,50,45,255]:[75,58,35,255];
  const edgePx=(x,y)=>{ if(x>=0&&x<W&&y>=0&&y<H) setPixel(grid,x,y,jitter(edgeCol,5,rng)); };

  // Shape drawing — same geometry as before, just uses new fillPath/edgePx
  if (shape==='h') {
    for (let y=lo;y<hi;y++) for (let x=0;x<W;x++) fillPath(x,y);
    for (let x=0;x<W;x++) { edgePx(x,lo); edgePx(x,hi-1); }
  } else if (shape==='v') {
    for (let x=lo;x<hi;x++) for (let y=0;y<H;y++) fillPath(x,y);
    for (let y=0;y<H;y++) { edgePx(lo,y); edgePx(hi-1,y); }
  } else if (shape==='cross') {
    for (let y=lo;y<hi;y++) for (let x=0;x<W;x++) fillPath(x,y);
    for (let x=lo;x<hi;x++) for (let y=0;y<H;y++) fillPath(x,y);
    for (let x=0;x<W;x++) if (x<lo||x>=hi) { edgePx(x,lo); edgePx(x,hi-1); }
    for (let y=0;y<H;y++) if (y<lo||y>=hi) { edgePx(lo,y); edgePx(hi-1,y); }
  } else if (shape==='t_south') {
    for (let y=lo;y<hi;y++) for (let x=0;x<W;x++) fillPath(x,y);
    for (let x=lo;x<hi;x++) for (let y=hi;y<H;y++) fillPath(x,y);
    for (let x=0;x<W;x++) if (x<lo||x>=hi) edgePx(x,lo);
    for (let x=0;x<lo;x++) edgePx(x,hi-1);
    for (let x=hi;x<W;x++) edgePx(x,hi-1);
    for (let y=hi;y<H;y++) { edgePx(lo,y); edgePx(hi-1,y); }
  } else if (shape==='t_north') {
    for (let y=lo;y<hi;y++) for (let x=0;x<W;x++) fillPath(x,y);
    for (let x=lo;x<hi;x++) for (let y=0;y<lo;y++) fillPath(x,y);
    for (let x=0;x<W;x++) if (x<lo||x>=hi) edgePx(x,hi-1);
    for (let x=0;x<lo;x++) edgePx(x,lo);
    for (let x=hi;x<W;x++) edgePx(x,lo);
    for (let y=0;y<lo;y++) { edgePx(lo,y); edgePx(hi-1,y); }
  } else if (shape==='t_east') {
    for (let x=lo;x<hi;x++) for (let y=0;y<H;y++) fillPath(x,y);
    for (let y=lo;y<hi;y++) for (let x=hi;x<W;x++) fillPath(x,y);
    for (let y=0;y<H;y++) if (y<lo||y>=hi) edgePx(lo,y);
    for (let y=0;y<lo;y++) edgePx(hi-1,y);
    for (let y=hi;y<H;y++) edgePx(hi-1,y);
    for (let x=hi;x<W;x++) { edgePx(x,lo); edgePx(x,hi-1); }
  } else if (shape==='t_west') {
    for (let x=lo;x<hi;x++) for (let y=0;y<H;y++) fillPath(x,y);
    for (let y=lo;y<hi;y++) for (let x=0;x<lo;x++) fillPath(x,y);
    for (let y=0;y<H;y++) if (y<lo||y>=hi) edgePx(hi-1,y);
    for (let y=0;y<lo;y++) edgePx(lo,y);
    for (let y=hi;y<H;y++) edgePx(lo,y);
    for (let x=0;x<lo;x++) { edgePx(x,lo); edgePx(x,hi-1); }
  } else if (shape==='corner_se') {
    for (let x=lo;x<hi;x++) for (let y=lo;y<H;y++) fillPath(x,y);
    for (let y=lo;y<hi;y++) for (let x=lo;x<W;x++) fillPath(x,y);
    for (let y=lo;y<H;y++) edgePx(lo,y);
    for (let x=lo;x<W;x++) edgePx(x,lo);
    for (let x=lo;x<hi;x++) edgePx(x,H-1);
    for (let y=lo;y<hi;y++) edgePx(W-1,y);
  } else if (shape==='corner_sw') {
    for (let x=lo;x<hi;x++) for (let y=lo;y<H;y++) fillPath(x,y);
    for (let y=lo;y<hi;y++) for (let x=0;x<hi;x++) fillPath(x,y);
    for (let y=lo;y<H;y++) edgePx(hi-1,y);
    for (let x=0;x<hi;x++) edgePx(x,lo);
    for (let x=lo;x<hi;x++) edgePx(x,H-1);
    for (let y=lo;y<hi;y++) edgePx(0,y);
  } else if (shape==='corner_ne') {
    for (let x=lo;x<hi;x++) for (let y=0;y<hi;y++) fillPath(x,y);
    for (let y=lo;y<hi;y++) for (let x=lo;x<W;x++) fillPath(x,y);
    for (let y=0;y<hi;y++) edgePx(lo,y);
    for (let x=lo;x<W;x++) edgePx(x,hi-1);
    for (let x=lo;x<hi;x++) edgePx(x,0);
    for (let y=lo;y<hi;y++) edgePx(W-1,y);
  } else if (shape==='corner_nw') {
    for (let x=lo;x<hi;x++) for (let y=0;y<hi;y++) fillPath(x,y);
    for (let y=lo;y<hi;y++) for (let x=0;x<hi;x++) fillPath(x,y);
    for (let y=0;y<hi;y++) edgePx(hi-1,y);
    for (let x=0;x<hi;x++) edgePx(x,hi-1);
    for (let x=lo;x<hi;x++) edgePx(x,0);
    for (let y=lo;y<hi;y++) edgePx(0,y);
  }

  return grid;
}

// ─── TERRAIN GENERATOR ───────────────────────────────────────────────────────

// ─── TERRAIN BLEND COLOURS ───────────────────────────────────────────────────
// Representative edge colour for each terrain — used when blending neighbours
const TERRAIN_EDGE_COLS = {
  grass:        [62,90,42,255],
  sand:         [212,190,132,255],
  dirt:         [115,88,50,255],
  mud:          [85,62,38,255],
  cobble:       [108,102,95,255],
  farmland:     [112,82,45,255],
  swamp:        [48,72,55,255],
  water:        [58,95,145,255],
  snow:         [225,232,238,255],
  forest_floor: [48,65,30,255],
  lava:         [188,68,22,255],
  ice:          [185,212,228,255],
  corrupt:      [42,28,52,255],
  rocky:        [115,110,102,255],
  cave:         [52,48,44,255],
  shallow_water:[72,138,115,255],
};

function makeTerrain(type, seed, neighbours={}) {
  const W=20, H=20;
  const rng=mulberry32(seed), grid=createPixelGrid(W,H);

  const terrains = {
    grass: ()=>{
      const G1=[58,88,38,255],G2=[72,108,48,255],G3=[44,70,28,255],G4=[85,115,55,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){
        const r=rng(); let c=r<0.4?G1:r<0.7?G2:r<0.85?G3:G4; c=jitter(c,8,rng);
        if(rng()<0.05) c=lerp(c,[30,55,18,255],0.5);
        setPixel(grid,x,y,c);
      }
      for(let i=0;i<4;i++){
        const fx=Math.floor(rng()*W),fy=Math.floor(rng()*H);
        setPixel(grid,fx,fy,rng()<0.5?[200,185,80,255]:[185,210,90,255]);
      }
    },
    sand: ()=>{
      const S1=[210,188,130,255],S2=[225,205,148,255],S3=[195,172,110,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){
        const r=rng(); let c=r<0.45?S1:r<0.75?S2:S3; c=jitter(c,12,rng);
        setPixel(grid,x,y,c);
      }
      for(let i=0;i<3;i++){
        const ry2=2+Math.floor(rng()*(H-4));
        for(let x=1+Math.floor(rng()*4);x<W-2;x+=1) if(rng()<0.7) setPixel(grid,x,ry2,lerp(S3,[175,148,85,255],0.4));
      }
      for(let i=0;i<3;i++) setPixel(grid,Math.floor(rng()*W),Math.floor(rng()*H),[165,152,112,255]);
    },
    swamp: ()=>{
      const MG=[45,68,35,255],DG=[30,50,22,255],MR=[60,85,45,255];
      const W1=[55,82,68,255],W2=[42,65,55,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){
        const r=rng(); let c=r<0.25?jitter(W1,10,rng):r<0.45?jitter(W2,8,rng):r<0.65?jitter(MG,10,rng):r<0.82?jitter(DG,8,rng):jitter(MR,10,rng);
        setPixel(grid,x,y,c);
      }
      for(let i=0;i<4;i++) setPixel(grid,Math.floor(rng()*W),Math.floor(rng()*H),lerp(W1,[120,160,140,255],0.5));
      for(let i=0;i<3;i++){ const rx=Math.floor(rng()*W),ry=Math.floor(rng()*H); setPixel(grid,rx,ry,[80,105,45,255]); if(ry>0) setPixel(grid,rx,ry-1,[95,120,50,255]); }
    },
    farmland: ()=>{
      const D1=[118,82,42,255],D2=[138,100,55,255],D3=[95,65,30,255];
      for(let y=0;y<H;y++){
        const rowT=Math.floor(y/2)%2;
        for(let x=0;x<W;x++){
          let c=rowT===0?jitter(D1,10,rng):jitter(D2,10,rng);
          if(rng()<0.08) c=jitter(D3,8,rng);
          setPixel(grid,x,y,c);
        }
      }
      for(let y=1;y<H;y+=2) for(let x=0;x<W;x++) setPixel(grid,x,y,lerp(D3,[70,45,18,255],0.3));
      for(let y=0;y<H;y+=4) for(let x=1;x<W;x+=3) if(rng()<0.6) setPixel(grid,x,y,jitter([75,120,40,255],12,rng));
    },
    dirt: ()=>{
      const D1=[120,88,50,255],D2=[140,105,62,255],D3=[98,68,35,255],D4=[105,78,42,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){
        const r=rng(); let c=r<0.35?D1:r<0.65?D2:r<0.85?D3:D4; c=jitter(c,14,rng);
        setPixel(grid,x,y,c);
      }
      for(let i=0;i<2;i++){ const tx=3+Math.floor(rng()*(W-6)); for(let y=0;y<H;y++) if(rng()<0.8) setPixel(grid,tx,y,lerp(D3,[70,45,20,255],0.5)); }
      for(let i=0;i<5;i++) setPixel(grid,Math.floor(rng()*W),Math.floor(rng()*H),jitter([148,138,122,255],10,rng));
    },
    cobble: ()=>{
      const S1=[130,125,118,255],S2=[108,102,95,255],S3=[155,150,142,255],SJ=[75,70,65,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++) setPixel(grid,x,y,S2);
      const cw=4,ch=3;
      for(let row=0;row<Math.ceil(H/ch);row++){
        const off=(row%2)*(cw/2)|0;
        for(let col=0;col<Math.ceil(W/cw)+1;col++){
          const cx2=(col*cw-off+W)%W|0,cy2=row*ch;
          for(let dy=1;dy<ch-1;dy++) for(let dx=1;dx<cw-1;dx++){ const px=(cx2+dx)%W,py=cy2+dy; if(py<H) setPixel(grid,px,py,jitter(rng()<0.5?S1:S3,8,rng)); }
          for(let dx=0;dx<cw;dx++){ if(cy2<H) setPixel(grid,(cx2+dx)%W,cy2,SJ); }
          for(let dy=0;dy<ch;dy++){ if(cy2+dy<H) setPixel(grid,cx2%W,cy2+dy,SJ); }
        }
      }
    },
    snow: ()=>{
      const SN1=[230,238,242,255],SN2=[215,225,232,255],SN3=[198,208,218,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const r=rng(); let c=r<0.5?SN1:r<0.8?SN2:SN3; c=jitter(c,6,rng); setPixel(grid,x,y,c); }
      for(let i=0;i<6;i++) setPixel(grid,Math.floor(rng()*W),Math.floor(rng()*H),[248,252,255,255]);
      for(let i=0;i<2;i++){ const dy2=2+Math.floor(rng()*(H-4)); for(let x=Math.floor(rng()*8);x<W-2;x++) if(rng()<0.6) setPixel(grid,x,dy2,SN3); }
    },
    water: ()=>{
      const W1=[55,105,158,255],W2=[42,88,140,255],W3=[70,125,175,255],WH=[140,190,220,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const r=rng(); let c=r<0.45?W1:r<0.75?W2:W3; c=jitter(c,10,rng); setPixel(grid,x,y,c); }
      for(let ry2=1;ry2<H;ry2+=4){ const startX=Math.floor(rng()*6); for(let x=startX;x<W-1;x+=2) if(rng()<0.7) setPixel(grid,x,ry2,lerp(W3,WH,0.4)); }
    },
    mud: ()=>{
      const M1=[88,62,38,255],M2=[108,78,48,255],M3=[72,50,28,255],WP=[65,78,62,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const r=rng(); let c=r<0.4?M1:r<0.72?M2:M3; c=jitter(c,16,rng); setPixel(grid,x,y,c); }
      for(let i=0;i<2;i++){ const px=2+Math.floor(rng()*(W-6)),py=2+Math.floor(rng()*(H-6)); for(let dx=-1;dx<=2;dx++) for(let dy=0;dy<=2;dy++) if(rng()<0.7) setPixel(grid,px+dx,py+dy,jitter(WP,10,rng)); }
    },
    forest_floor: ()=>{
      const L1=[45,62,28,255],L2=[58,78,35,255],L3=[35,50,20,255],LF=[88,62,30,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const r=rng(); let c=r<0.4?L1:r<0.7?L2:r<0.88?L3:jitter(LF,12,rng); c=jitter(c,10,rng); setPixel(grid,x,y,c); }
      for(let i=0;i<6;i++){ const lx=Math.floor(rng()*W),ly=Math.floor(rng()*H); setPixel(grid,lx,ly,jitter([105,78,35,255],12,rng)); if(rng()<0.5&&lx+1<W) setPixel(grid,lx+1,ly,jitter([118,88,40,255],10,rng)); }
    },
    lava: ()=>{
      const L1=[188,68,22,255],L2=[215,108,28,255],L3=[148,38,12,255],LG=[38,32,28,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const r=rng(); let c=r<0.35?jitter(LG,8,rng):r<0.55?jitter(L3,10,rng):r<0.75?jitter(L1,12,rng):jitter(L2,14,rng); setPixel(grid,x,y,c); }
      for(let i=0;i<3;i++){ const sy=Math.floor(rng()*H); for(let x=0;x<W;x++){ const ly=Math.max(0,Math.min(H-1,sy+Math.round((rng()-0.5)*3))); setPixel(grid,x,ly,jitter([238,158,38,255],10,rng)); } }
      for(let i=0;i<4;i++){ const cx2=Math.floor(rng()*W),cy2=Math.floor(rng()*H); setPixel(grid,cx2,cy2,[255,218,55,255]); if(rng()<0.5&&cx2+1<W) setPixel(grid,cx2+1,cy2,[238,178,38,255]); }
    },
    ice: ()=>{
      const I1=[188,215,228,255],I2=[165,198,218,255],I3=[215,232,242,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const r=rng(); let c=r<0.4?jitter(I1,8,rng):r<0.7?jitter(I2,8,rng):jitter(I3,6,rng); setPixel(grid,x,y,c); }
      for(let i=0;i<3;i++){ const sx=Math.floor(rng()*W),sy=Math.floor(rng()*H); let cx2=sx,cy2=sy; for(let s=0;s<6;s++){ setPixel(grid,cx2,cy2,jitter([145,175,198,255],6,rng)); cx2=Math.max(0,Math.min(W-1,cx2+Math.round((rng()-0.5)*3))); cy2=Math.max(0,Math.min(H-1,cy2+Math.round((rng()-0.5)*3))); } }
      for(let i=0;i<5;i++) setPixel(grid,Math.floor(rng()*W),Math.floor(rng()*H),[245,252,255,255]);
    },
    corrupt: ()=>{
      const C1=[38,25,48,255],C2=[55,35,68,255],C3=[28,18,35,255],CV=[88,55,108,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const r=rng(); let c=r<0.4?jitter(C1,10,rng):r<0.7?jitter(C2,10,rng):jitter(C3,8,rng); if(rng()<0.06) c=jitter(CV,10,rng); setPixel(grid,x,y,c); }
      for(let i=0;i<3;i++){ const sx=Math.floor(rng()*W),sy=Math.floor(rng()*H); let cx2=sx,cy2=sy; for(let s=0;s<5;s++){ setPixel(grid,cx2,cy2,jitter([108,68,138,255],12,rng)); cx2=Math.max(0,Math.min(W-1,cx2+(Math.floor(rng()*3)-1))); cy2=Math.max(0,Math.min(H-1,cy2+(Math.floor(rng()*3)-1))); } }
    },
    rocky: ()=>{
      const R1=[118,112,102,255],R2=[95,90,82,255],R3=[142,136,124,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const r=rng(); let c=r<0.4?jitter(R1,10,rng):r<0.7?jitter(R2,8,rng):jitter(R3,10,rng); setPixel(grid,x,y,c); }
      for(let i=0;i<5;i++){ const rx=Math.floor(rng()*W),ry=Math.floor(rng()*H); setPixel(grid,rx,ry,jitter([158,152,140,255],8,rng)); if(rx+1<W) setPixel(grid,rx+1,ry,[72,68,62,255]); }
    },
    cave: ()=>{
      const C1=[48,44,40,255],C2=[62,58,52,255],C3=[35,32,28,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const r=rng(); setPixel(grid,x,y,jitter(r<0.4?C1:r<0.7?C2:C3,10,rng)); }
      for(let i=0;i<3;i++){ const wx=Math.floor(rng()*W),wy=Math.floor(rng()*H); setPixel(grid,wx,wy,jitter([52,65,78,255],10,rng)); }
      for(let x=0;x<W;x+=3) if(rng()<0.5) setPixel(grid,x,0,jitter([28,25,22,255],6,rng));
    },
    shallow_water: ()=>{
      const S1=[88,148,118,255],S2=[72,128,98,255],S3=[105,162,132,255];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const r=rng(); let c=r<0.4?jitter(S1,10,rng):r<0.7?jitter(S2,8,rng):jitter(S3,10,rng); if((x+y)%5===0) c=lerp(c,[178,218,198,255],0.25); setPixel(grid,x,y,c); }
      for(let i=0;i<4;i++) setPixel(grid,Math.floor(rng()*W),Math.floor(rng()*H),jitter([95,88,75,255],10,rng));
    },
  };

  (terrains[type]||terrains.grass)();

  // ── EDGE BLENDING ──────────────────────────────────────────────────────────
  // Blend edge pixels toward neighbour terrain colour over 4px depth
  const blendDepth = 4;
  const sides = [
    { key:'top',    xs:(x)=>x, ys:(d)=>d,       dir:'y' },
    { key:'bottom', xs:(x)=>x, ys:(d)=>H-1-d,   dir:'y' },
    { key:'left',   xs:(d)=>d, ys:(y)=>y,        dir:'x' },
    { key:'right',  xs:(d)=>W-1-d, ys:(y)=>y,    dir:'x' },
  ];

  sides.forEach(side=>{
    const neighbourType = neighbours[side.key];
    if(!neighbourType) return;
    const edgeCol = TERRAIN_EDGE_COLS[neighbourType] || TERRAIN_EDGE_COLS.grass;

    for(let d=0;d<blendDepth;d++){
      // t=0 at outermost edge (strong blend), t=1 at inner (no blend)
      const t = d / blendDepth;
      const blendStr = (1-t) * 0.65; // max 65% blend at very edge
      const span = side.dir==='y' ? W : H;
      for(let s=0;s<span;s++){
        const x = side.dir==='y' ? side.xs(s) : side.xs(d);
        const y = side.dir==='y' ? side.ys(d) : side.ys(s);
        const existing = grid[y]?.[x];
        if(existing){
          grid[y][x] = lerp(edgeCol, existing, 1-blendStr);
        }
      }
    }
  });

  return grid;
}


// ─── NEW BUILDING VARIANTS ────────────────────────────────────────────────────
function makeCastleWall(type, seed) {
  // type: straight_h, straight_v, corner_se, corner_sw, corner_ne, corner_nw
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const SL=[148,140,128,255],SM=[118,112,102,255],SD=[85,80,72,255],SS=[55,52,46,255];
  const battle=[168,160,148,255];
  const wallPx=(x,y)=>setPixel(grid,x,y,jitter(rng()<0.5?SL:SM,10,rng));
  const merlonPx=(x,y)=>setPixel(grid,x,y,jitter(battle,8,rng));

  if(type==='straight_h'){
    for(let y=7;y<13;y++) for(let x=0;x<W;x++) wallPx(x,y);
    for(let x=0;x<W;x++){ setPixel(grid,x,7,jitter(SD,6,rng)); setPixel(grid,x,12,jitter(SS,6,rng)); }
    // battlements top
    for(let x=0;x<W;x+=4){ for(let dy=0;dy<3;dy++) merlonPx(x,7-dy); merlonPx(x+1,7-2); }
  } else if(type==='straight_v'){
    for(let x=7;x<13;x++) for(let y=0;y<H;y++) wallPx(x,y);
    for(let y=0;y<H;y++){ setPixel(grid,7,y,jitter(SD,6,rng)); setPixel(grid,12,y,jitter(SS,6,rng)); }
    for(let y=0;y<H;y+=4){ for(let dx=0;dx<3;dx++) merlonPx(12+dx,y); merlonPx(12+2,y+1); }
  } else {
    // corner pieces — fill L-shape
    const inH=(type==='corner_se'||type==='corner_sw');
    for(let y=7;y<13;y++) for(let x=0;x<W;x++) wallPx(x,y);
    for(let x=7;x<13;x++) for(let y=0;y<H;y++) wallPx(x,y);
    for(let x=0;x<W;x++){ setPixel(grid,x,7,jitter(SD,6,rng)); }
    for(let y=0;y<H;y++){ setPixel(grid,12,y,jitter(SS,6,rng)); }
  }
  return grid;
}

function makeGate(seed) {
  const W=40,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const SL=[148,140,128,255],SM=[118,112,102,255],SD=[85,80,72,255];
  const arch=[38,32,28,255]; // dark archway
  const wood=[95,65,28,255],woodL=[128,88,42,255];
  // full wall
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) setPixel(grid,x,y,jitter(rng()<0.5?SL:SM,10,rng));
  // archway opening
  for(let x=13;x<27;x++) for(let y=5;y<H;y++) setPixel(grid,x,y,arch);
  // arch curve top
  for(let x=13;x<27;x++){
    const mid=20,d=Math.abs(x-mid),h=Math.round(5-Math.sqrt(Math.max(0,25-d*d))*0.8);
    for(let y=h;y<5;y++) setPixel(grid,x,y,arch);
  }
  // portcullis bars
  for(let x=14;x<26;x+=3) for(let y=6;y<H;y++) setPixel(grid,x,y,jitter([72,68,62,255],6,rng));
  for(let y=8;y<H;y+=3) for(let x=14;x<26;x++) setPixel(grid,x,y,jitter([72,68,62,255],4,rng));
  // battlements
  for(let x=0;x<W;x+=4){ for(let dy=0;dy<3;dy++) setPixel(grid,x,dy,jitter([168,160,148,255],8,rng)); }
  for(let y=0;y<H;y++) setPixel(grid,0,y,jitter(SD,6,rng));
  for(let y=0;y<H;y++) setPixel(grid,W-1,y,jitter(SD,6,rng));
  return grid;
}

function makeRuins(w, h, RL, RM, RD, RS, seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(w,h);
  // Partial roof — lots of missing sections
  const cx=w/2,cy=h/2;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const dx=x-cx,dy=y-cy,angle=Math.atan2(dy,dx)*180/Math.PI;
    const dist=Math.min(1,Math.sqrt((dx/cx)**2+(dy/cy)**2));
    // skip ~40% of tiles to simulate ruin holes
    if(rng()<0.38) continue;
    let faceBase,u;
    const v=Math.round(dist*Math.min(cx,cy));
    if(angle>=-135&&angle<-45){faceBase=lerp(RL,RM,dist);u=x;}
    else if(angle>=-45&&angle<45){faceBase=lerp(RM,RD,dist);u=y;}
    else if(angle>=45&&angle<135){faceBase=lerp(RD,lerp(RD,RS,0.4),dist);u=x;}
    else{faceBase=lerp(lerp(RM,RD,0.5),RS,dist);u=y;}
    setPixel(grid,x,y,tileAlong(u,v,faceBase,RS,rng));
  }
  // broken wall stubs around edge
  const SW=[128,120,108,255],SD2=[85,80,72,255];
  for(let i=0;i<8;i++){
    const ex=Math.floor(rng()*w),ey=Math.floor(rng()*h);
    if(rng()<0.5) for(let dy=0;dy<3;dy++) setPixel(grid,ex,Math.min(h-1,ey+dy),jitter(SW,10,rng));
    else for(let dx=0;dx<3;dx++) setPixel(grid,Math.min(w-1,ex+dx),ey,jitter(SW,10,rng));
  }
  return grid;
}

function makeWindmill(seed) {
  const W=40,H=40, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const RL=[195,128,65,255],RM=[155,85,35,255],RD=[105,48,14,255],RS=[62,28,5,255];
  // circular tower roof
  const cx=20,cy=20,r=16;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<=r){
      const angle=Math.atan2(dy,dx)*180/Math.PI;
      const t=dist/r;
      let c=angle>=-135&&angle<-45?lerp(RL,RM,t):angle>=45&&angle<135?lerp(RD,RS,t):lerp(RM,RD,t);
      setPixel(grid,x,y,tileAlong(x,y,c,RS,rng));
    }
  }
  // sails — 4 arms radiating
  const sailCol=[188,178,155,255],sailD=[138,128,108,255];
  [[0,-1],[1,0],[0,1],[-1,0]].forEach(([dx,dy],i)=>{
    for(let d=6;d<=18;d++){
      const sx=Math.round(cx+dx*d),sy=Math.round(cy+dy*d);
      const sw=Math.round(4-d*0.15);
      for(let perp=-sw;perp<=sw;perp++){
        const px=sx+(dy!==0?perp:0),py=sy+(dx!==0?perp:0);
        setPixel(grid,px,py,jitter(d%3===0?sailD:sailCol,10,rng));
      }
    }
  });
  return grid;
}

function makeWatchtower(seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const SL=[148,140,128,255],SM=[118,112,102,255],SD=[85,80,72,255];
  const RL=[142,118,102,255],RM=[98,78,68,255],RD=[62,48,42,255],RS=[30,22,20,255];
  // circular stone tower
  const cx=10,cy=10;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<=9&&dist>=6) setPixel(grid,x,y,jitter(rng()<0.5?SL:SM,10,rng));
    else if(dist<6){
      const angle=Math.atan2(dy,dx)*180/Math.PI;
      const t=dist/6;
      let c=angle>=-135&&angle<-45?lerp(RL,RM,t):angle>=45&&angle<135?lerp(RD,RS,t):lerp(RM,RD,t);
      setPixel(grid,x,y,tileAlong(x,y,c,RS,rng));
    }
  }
  // battlements
  for(let a=0;a<360;a+=30){
    const r=9,rad=a*Math.PI/180;
    const bx=Math.round(cx+Math.cos(rad)*r),by=Math.round(cy+Math.sin(rad)*r);
    setPixel(grid,bx,by,jitter([168,160,148,255],8,rng));
  }
  // shadow
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<=9&&dist>=6) if(!grid[y][x+1]||x===W-1) setPixel(grid,x,y,jitter(SD,4,rng));
  }
  return grid;
}

function makeDungeonEntrance(seed) {
  const W=16,H=16, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const SF=[88,82,72,255],SL=[118,112,102,255],DK=[22,18,14,255];
  // stone floor surround
  for(let y=3;y<H;y++) for(let x=1;x<W-1;x++) setPixel(grid,x,y,jitter(rng()<0.5?SF:SL,10,rng));
  // dark pit/opening
  for(let x=4;x<12;x++) for(let y=6;y<H;y++) setPixel(grid,x,y,jitter(DK,4,rng));
  // arched stonework
  for(let x=3;x<13;x++){
    const mid=8,d=Math.abs(x-mid),archY=Math.round(6-Math.sqrt(Math.max(0,16-d*d))*0.6);
    for(let y=archY;y<6;y++) setPixel(grid,x,y,jitter(SL,8,rng));
    setPixel(grid,x,archY,jitter([148,140,128,255],6,rng));
  }
  // keystone
  setPixel(grid,8,3,jitter([168,160,148,255],6,rng));
  // shadows in pit
  for(let x=4;x<12;x++) for(let y=6;y<8;y++) setPixel(grid,x,y,lerp(DK,[45,38,30,255],0.5));
  return grid;
}

// ─── NEW NATURE SPRITES ───────────────────────────────────────────────────────
function makeMushroom(size, seed) {
  // top-down: scattered field of small mushroom caps
  const W=size==='lg'?20:16, H=W;
  const rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const capCols=[[165,45,35,255],[185,135,35,255],[85,125,45,255],[125,75,155,255],[45,105,145,255],[165,95,35,255]];
  const spot=[232,222,205,255];
  const drawCap=(cx,cy,r,col)=>{
    const capD=lerp(col,[18,12,8,255],0.45);
    const capL=lerp(col,[248,235,215,255],0.28);
    for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<=r&&cx+dx>=0&&cx+dx<W&&cy+dy>=0&&cy+dy<H){
        const t=dist/r;
        const lt=t*0.7+(dx/r*0.15+dy/r*0.15)*0.3+0.15;
        let c=lerp(capL,capD,Math.min(1,lt));
        c=jitter(c,10,rng);
        if(rng()<0.1) c=jitter(spot,8,rng);
        setPixel(grid,cx+dx,cy+dy,c);
      }
    }
    // stem dot
    setPixel(grid,cx,cy,jitter([185,165,125,255],8,rng));
  };
  const num=size==='lg'?7:5;
  const placed=[];
  let attempts=0;
  while(placed.length<num&&attempts<60){
    attempts++;
    const r=1+Math.floor(rng()*2);
    const cx=r+1+Math.floor(rng()*(W-r*2-2));
    const cy=r+1+Math.floor(rng()*(H-r*2-2));
    // avoid overlap
    const overlap=placed.some(([px,py,pr])=>Math.sqrt((cx-px)**2+(cy-py)**2)<r+pr+1);
    if(!overlap){
      placed.push([cx,cy,r]);
      const col=capCols[Math.floor(rng()*capCols.length)];
      drawCap(cx,cy,r,col);
    }
  }
  return grid;
}

function makeFallenLog(seed) {
  const W=24,H=10, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const LB=[108,72,32,255],LD=[78,50,20,255],LL=[138,98,48,255],bark=[88,60,25,255];
  const cx=W/2,cy=H/2,rx=W/2-1,ry=H/2-1;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy,dist=Math.sqrt((dx/rx)**2+(dy/ry)**2);
    if(dist<=1){
      // lighting: top-left bright, bottom-right dark
      const lt=(dx/rx*0.3+dy/ry*0.5)*0.5+0.5;
      let c=lerp(LL,LD,lt*dist+dist*0.2);
      c=jitter(c,12,rng);
      // bark grain running lengthwise
      if(x%3===0) c=jitter(bark,8,rng);
      setPixel(grid,x,y,c);
    }
  }
  // end grain rings at each end
  for(let dy=-2;dy<=2;dy++) for(let dz=0;dz<2;dz++){
    if(Math.abs(dy)<=1+dz){
      setPixel(grid,1+dz,cy+dy|0,jitter([88,55,22,255],8,rng));
      setPixel(grid,W-2-dz,cy+dy|0,jitter([88,55,22,255],8,rng));
    }
  }
  // moss on top half
  for(let x=3;x<W-3;x++) for(let y=0;y<cy;y++){
    if(grid[y]?.[x]&&rng()<0.12) setPixel(grid,x,y,jitter([52,85,35,255],12,rng));
  }
  return grid;
}

function makeFlowerPatch(seed) {
  const W=16,H=16, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const flowerCols=[[172,142,88,255],[152,118,128,255],[128,148,98,255],[142,128,82,255],[118,138,148,255]];
  const stem=[52,82,38,255],stemD=[38,62,25,255];
  const numF=5+Math.floor(rng()*6);
  for(let i=0;i<numF;i++){
    const fx=1+Math.floor(rng()*(W-3)),fy=2+Math.floor(rng()*(H-4));
    const fc=flowerCols[Math.floor(rng()*flowerCols.length)];
    // stem
    setPixel(grid,fx,fy+1,jitter(stem,8,rng));
    setPixel(grid,fx,fy+2,jitter(stemD,8,rng));
    // petals
    setPixel(grid,fx,fy,jitter(fc,16,rng));
    if(rng()<0.6) setPixel(grid,fx-1,fy,jitter(fc,14,rng));
    if(rng()<0.6) setPixel(grid,fx+1,fy,jitter(fc,14,rng));
    if(rng()<0.4) setPixel(grid,fx,fy-1,jitter(fc,14,rng));
    // centre
    setPixel(grid,fx,fy,jitter([215,195,128,255],10,rng));
  }
  return grid;
}

function makeThicket(seed) {
  const W=24,H=24, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const DG=[28,62,22,255],MG=[45,88,35,255],LG=[68,112,48,255];
  const twig=[88,62,28,255];
  // dense bush mass
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-W/2,dy=y-H/2;
    const dist=Math.sqrt(dx*dx+dy*dy)+(rng()-0.5)*6;
    if(dist<W*0.46){
      const t=dist/(W*0.46);
      let c=lerp(LG,DG,t);
      c=jitter(c,12,rng);
      if(rng()<0.05) c=jitter(twig,8,rng);
      setPixel(grid,x,y,c);
    }
  }
  return grid;
}

function makeGiantRoots(seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const R1=[95,65,28,255],R2=[118,82,38,255],R3=[72,48,18,255];
  const cx=10,cy=10;
  // central trunk bump
  for(let dx=-2;dx<=2;dx++) for(let dy=-2;dy<=2;dy++)
    if(Math.sqrt(dx*dx+dy*dy)<=2.5) setPixel(grid,cx+dx,cy+dy,jitter(R2,8,rng));
  // radiating roots
  for(let a=0;a<360;a+=40+Math.floor(rng()*20)){
    const rad=a*Math.PI/180;
    const len=6+Math.floor(rng()*5);
    for(let d=2;d<=len;d++){
      const rx=Math.round(cx+Math.cos(rad)*d),ry=Math.round(cy+Math.sin(rad)*d);
      const thick=Math.max(1,Math.round(2.5-d*0.2));
      for(let perp=-thick;perp<=thick;perp++){
        const px=rx+Math.round(Math.sin(rad)*perp),py=ry-Math.round(Math.cos(rad)*perp);
        setPixel(grid,px,py,jitter(d%3===0?R3:R1,12,rng));
      }
      // occasional branch
      if(d===Math.floor(len*0.6)&&rng()<0.5){
        const brad=(a+(rng()<0.5?30:-30))*Math.PI/180;
        for(let bd=1;bd<=3;bd++){
          const bx=Math.round(rx+Math.cos(brad)*bd),by=Math.round(ry+Math.sin(brad)*bd);
          setPixel(grid,bx,by,jitter(R1,10,rng));
        }
      }
    }
  }
  return grid;
}

// ─── NEW EXTRAS ───────────────────────────────────────────────────────────────
function makeChest(seed) {
  const W=14,H=12, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const WD=[118,82,38,255],WL=[148,105,52,255],WD2=[85,55,20,255];
  const MT=[175,148,52,255],MTD=[128,105,32,255]; // metal fittings
  const DK=[35,25,12,255];
  // lid
  for(let x=1;x<W-1;x++) for(let y=0;y<5;y++) setPixel(grid,x,y,jitter(rng()<0.5?WD:WL,10,rng));
  // body
  for(let x=1;x<W-1;x++) for(let y=5;y<H-1;y++) setPixel(grid,x,y,jitter(rng()<0.5?WD2:WD,10,rng));
  // metal band
  for(let x=1;x<W-1;x++) setPixel(grid,x,5,jitter(MT,8,rng));
  for(let x=1;x<W-1;x++) setPixel(grid,x,H-2,jitter(MTD,6,rng));
  // corner fittings
  [[1,0],[W-2,0],[1,H-2],[W-2,H-2]].forEach(([x,y])=>setPixel(grid,x,y,jitter(MT,6,rng)));
  // lock
  setPixel(grid,Math.floor(W/2),5,jitter(MT,4,rng));
  setPixel(grid,Math.floor(W/2),6,jitter(MTD,4,rng));
  // shadow
  for(let y=0;y<H-1;y++) setPixel(grid,W-2,y,jitter(WD2,4,rng));
  return grid;
}

function makeCampsite(seed) {
  const W=24,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const BR=[125,85,58,255],BRL=[155,112,78,255],BRD=[92,60,35,255];
  // bedroll — flat rectangle viewed from above, stripe pattern
  for(let x=1;x<13;x++) for(let y=3;y<15;y++){
    const stripe=Math.floor((x-1)/2)%2;
    setPixel(grid,x,y,jitter(stripe===0?BR:BRL,10,rng));
  }
  // pillow — slightly lighter rounded end
  for(let x=1;x<13;x++) for(let y=3;y<6;y++) setPixel(grid,x,y,jitter([162,142,112,255],10,rng));
  // bedroll border/shadow
  for(let x=1;x<13;x++){ setPixel(grid,x,3,jitter(BRD,6,rng)); setPixel(grid,x,14,jitter(BRD,6,rng)); }
  for(let y=3;y<15;y++){ setPixel(grid,1,y,jitter(BRD,6,rng)); setPixel(grid,12,y,jitter(BRD,6,rng)); }
  // campfire — top-down: log ring with ember centre
  const fx=18,fy=12;
  const logs=[[fx-2,fy],[fx+2,fy],[fx,fy-2],[fx,fy+2],[fx-1,fy-1],[fx+1,fy+1],[fx-1,fy+1],[fx+1,fy-1]];
  logs.forEach(([x,y])=>setPixel(grid,x,y,jitter([95,62,25,255],10,rng)));
  setPixel(grid,fx,fy,[175,72,18,255]);
  setPixel(grid,fx-1,fy,[215,128,25,255]); setPixel(grid,fx+1,fy,[215,128,25,255]);
  setPixel(grid,fx,fy-1,[238,185,35,255]); setPixel(grid,fx,fy+1,[195,95,20,255]);
  // ash ring
  for(let dx=-3;dx<=3;dx++) for(let dy=-3;dy<=3;dy++){
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d>=2.5&&d<=3.2) setPixel(grid,fx+dx,fy+dy,jitter([88,82,75,255],8,rng));
  }
  return grid;
}

function makeAltar(seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const SL=[148,140,128,255],SM=[118,112,102,255],SD=[85,80,72,255];
  const gold=[188,158,52,255],goldD=[138,112,32,255];
  const crystal=[88,148,188,255],crystalL=[138,188,218,255];
  // stone base slab
  for(let x=2;x<W-2;x++) for(let y=5;y<H-2;y++) setPixel(grid,x,y,jitter(rng()<0.5?SL:SM,10,rng));
  // raised altar top
  for(let x=4;x<W-4;x++) for(let y=2;y<7;y++) setPixel(grid,x,y,jitter(SM,8,rng));
  // gold trim
  for(let x=3;x<W-3;x++){ setPixel(grid,x,5,jitter(gold,8,rng)); setPixel(grid,x,H-3,jitter(goldD,6,rng)); }
  for(let y=5;y<H-2;y++){ setPixel(grid,2,y,jitter(goldD,6,rng)); setPixel(grid,W-3,y,jitter(goldD,6,rng)); }
  // crystal/gem on top
  [[10,1],[10,2],[9,2],[11,2]].forEach(([x,y])=>setPixel(grid,x,y,jitter(crystalL,8,rng)));
  [[10,3],[9,3],[11,3]].forEach(([x,y])=>setPixel(grid,x,y,jitter(crystal,8,rng)));
  // runes/markings
  for(let i=0;i<4;i++){
    const rx=5+Math.floor(rng()*10),ry=7+Math.floor(rng()*8);
    setPixel(grid,rx,ry,jitter(gold,10,rng));
  }
  // shadow
  for(let x=3;x<W-2;x++) setPixel(grid,x,H-3,jitter(SD,4,rng));
  return grid;
}

function makeGallows(seed) {
  // top-down: flat L-shaped wooden structure on ground
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const WD=[92,62,25,255],WL=[125,85,40,255],WD2=[68,45,15,255];
  const rope=[145,125,85,255],ropeD=[105,85,52,255];
  // platform — flat raised rectangle (lighter edge = top face)
  for(let x=1;x<W-1;x++) for(let y=13;y<H-1;y++) setPixel(grid,x,y,jitter(rng()<0.5?WD:WL,10,rng));
  for(let x=1;x<W-1;x++) setPixel(grid,x,13,jitter(WD2,5,rng));
  for(let y=13;y<H-1;y++){ setPixel(grid,1,y,jitter(WD2,5,rng)); setPixel(grid,W-2,y,jitter(WD2,5,rng)); }
  // plank grain on platform
  for(let x=2;x<W-2;x+=2) for(let y=14;y<H-2;y++) if(rng()<0.15) setPixel(grid,x,y,jitter(WD2,5,rng));
  // post — top-down: wide rectangle running vertically (the tall post casts a shadow footprint)
  for(let x=3;x<6;x++) for(let y=2;y<14;y++) setPixel(grid,x,y,jitter(rng()<0.5?WD:WL,10,rng));
  for(let x=3;x<6;x++){ setPixel(grid,x,2,jitter(WD2,5,rng)); }
  for(let y=2;y<14;y++){ setPixel(grid,3,y,jitter(WD2,5,rng)); setPixel(grid,5,y,jitter(WD2,5,rng)); }
  // crossbeam — wide horizontal rectangle at top
  for(let x=3;x<W-2;x++) for(let y=2;y<5;y++) setPixel(grid,x,y,jitter(rng()<0.5?WD:WL,10,rng));
  for(let x=3;x<W-2;x++) setPixel(grid,x,2,jitter(WD2,5,rng));
  for(let y=2;y<5;y++){ setPixel(grid,W-3,y,jitter(WD2,5,rng)); }
  // diagonal brace
  for(let d=0;d<6;d++){ setPixel(grid,5+d,5+d,jitter(WD,8,rng)); setPixel(grid,5+d,6+d,jitter(WD2,6,rng)); }
  // noose circle on platform
  const nx=15,ny=16;
  for(let dx=-2;dx<=2;dx++) for(let dy=-2;dy<=2;dy++){
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d>=1.2&&d<=2.2) setPixel(grid,nx+dx,ny+dy,jitter(rope,8,rng));
  }
  // rope line from beam down to noose (top-down: just a line)
  for(let y=5;y<14;y++) setPixel(grid,15,y,jitter(rope,7,rng));
  return grid;
}

function makeStocks(seed) {
  const W=20,H=14, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const WD=[92,62,25,255],WL=[125,85,40,255],WD2=[68,45,15,255];
  const MT=[90,85,78,255],MTL=[115,110,100,255];
  // two parallel boards (top-down view — wide flat planks)
  for(let bx=2;bx<W-2;bx++) for(let by=3;by<6;by++) setPixel(grid,bx,by,jitter(rng()<0.5?WD:WL,10,rng));
  for(let bx=2;bx<W-2;bx++) for(let by=8;by<11;by++) setPixel(grid,bx,by,jitter(rng()<0.5?WD:WL,10,rng));
  // board edges/shadows
  for(let bx=2;bx<W-2;bx++){ setPixel(grid,bx,3,jitter(WD2,5,rng)); setPixel(grid,bx,10,jitter(WD2,5,rng)); }
  for(let by=3;by<6;by++){ setPixel(grid,2,by,jitter(WD2,5,rng)); setPixel(grid,W-3,by,jitter(WD2,5,rng)); }
  for(let by=8;by<11;by++){ setPixel(grid,2,by,jitter(WD2,5,rng)); setPixel(grid,W-3,by,jitter(WD2,5,rng)); }
  // neck + wrist holes — ovals cut through both boards
  [[7,3],[13,3],[7,8],[13,8]].forEach(([x,y])=>{
    for(let dx=-1;dx<=1;dx++) for(let dy=0;dy<3;dy++) setPixel(grid,x+dx,y+dy,[20,14,8,255]);
  });
  // metal hinges at ends
  [[2,4],[W-3,4],[2,9],[W-3,9]].forEach(([x,y])=>{
    setPixel(grid,x,y,jitter(MT,6,rng)); setPixel(grid,x,y+1,jitter(MTL,6,rng));
  });
  // support legs (top-down: small squares)
  [[3,1],[W-4,1],[3,11],[W-4,11]].forEach(([x,y])=>{
    for(let dx=0;dx<2;dx++) for(let dy=0;dy<2;dy++) setPixel(grid,x+dx,y+dy,jitter(WD2,8,rng));
  });
  return grid;
}

function makeTorch(seed) {
  const W=10,H=10, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const IR=[68,65,62,255],IRL=[92,88,82,255];
  const WD=[92,62,25,255];
  const fire1=[212,115,20,255],fire2=[235,175,32,255],fire3=[250,218,52,255];
  // iron bracket — top-down L-shape mount
  for(let y=4;y<8;y++){ setPixel(grid,0,y,jitter(IR,6,rng)); setPixel(grid,1,y,jitter(IRL,5,rng)); }
  setPixel(grid,2,5,jitter(IR,5,rng)); setPixel(grid,2,6,jitter(IR,5,rng));
  // handle stub
  for(let dx=2;dx<5;dx++){ setPixel(grid,dx,5,jitter(WD,8,rng)); setPixel(grid,dx,6,jitter(WD,8,rng)); }
  // flame — top-down glow circle
  const fx=6,fy=5;
  setPixel(grid,fx,fy,fire3);
  setPixel(grid,fx-1,fy,fire2); setPixel(grid,fx+1,fy,fire2);
  setPixel(grid,fx,fy-1,fire2); setPixel(grid,fx,fy+1,fire2);
  setPixel(grid,fx-1,fy-1,fire1); setPixel(grid,fx+1,fy-1,fire1);
  setPixel(grid,fx-1,fy+1,fire1); setPixel(grid,fx+1,fy+1,fire1);
  // outer heat glow (semi-transparent orange)
  [[fx-2,fy],[fx+2,fy],[fx,fy-2],[fx,fy+2]].forEach(([x,y])=>{
    if(x>=0&&x<W&&y>=0&&y<H) setPixel(grid,x,y,[188,88,15,160]);
  });
  return grid;
}

function makeDungeonBars(seed) {
  const W=20,H=16, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const IR=[68,65,62,255],IRL=[92,88,82,255],IRD=[45,42,40,255];
  const stone=[112,106,95,255],stoneD=[82,78,70,255];
  const dark=[22,18,14,255]; // cell interior
  // stone threshold — top half is cell floor (dark), bottom half is outside floor
  for(let y=0;y<7;y++) for(let x=0;x<W;x++) setPixel(grid,x,y,jitter(dark,5,rng));
  for(let y=7;y<H;y++) for(let x=0;x<W;x++){
    const row=Math.floor(y/4),off=(row%2)*3,tu=(x+off)%6,tv=y%4;
    setPixel(grid,x,y,(tu===0||tv===0)?stoneD:jitter(stone,8,rng));
  }
  // stone door frame sides
  for(let y=0;y<H;y++) for(let dx=0;dx<2;dx++){
    setPixel(grid,dx,y,jitter(stone,8,rng)); setPixel(grid,W-1-dx,y,jitter(stone,8,rng));
  }
  // iron bars — vertical lines across the threshold
  for(let x=3;x<W-3;x+=3) for(let y=0;y<H;y++){
    setPixel(grid,x,y,jitter(IR,6,rng)); setPixel(grid,x+1,y,jitter(IRL,5,rng));
  }
  // crossbar
  for(let x=2;x<W-2;x++) setPixel(grid,x,7,jitter(IRD,5,rng));
  return grid;
}

function makeCatapult(seed) {
  const W=24,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const WD=[92,62,25,255],WL=[125,85,40,255],WD2=[68,45,15,255];
  const MT=[88,82,75,255],MTL=[115,108,98,255];
  const rope=[145,125,85,255];
  // side beams of frame
  for(let x=3;x<W-3;x++) for(let y=8;y<11;y++) setPixel(grid,x,y,jitter(rng()<0.5?WD:WL,10,rng));
  for(let x=3;x<W-3;x++) for(let y=13;y<16;y++) setPixel(grid,x,y,jitter(rng()<0.5?WD:WL,10,rng));
  // cross braces
  for(let y=8;y<16;y++){ setPixel(grid,3,y,jitter(WD2,8,rng)); setPixel(grid,W-4,y,jitter(WD2,8,rng)); }
  // four wheels — top-down circles
  [[5,7],[5,16],[W-6,7],[W-6,16]].forEach(([cx,cy])=>{
    for(let dx=-3;dx<=3;dx++) for(let dy=-3;dy<=3;dy++){
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<=3) setPixel(grid,cx+dx,cy+dy,jitter(d<=1.2?MT:WD2,8,rng));
      if(d>=2.2&&d<=3) setPixel(grid,cx+dx,cy+dy,jitter(WD2,6,rng)); // rim
    }
    // spokes
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>setPixel(grid,cx+dx,cy+dy,jitter(MT,5,rng)));
  });
  // throwing arm — diagonal plank across centre
  for(let d=-8;d<=8;d++){
    const ax=Math.round(12+d*0.7),ay=Math.round(12-d*0.7);
    setPixel(grid,ax,ay,jitter(WD,10,rng)); setPixel(grid,ax+1,ay,jitter(WL,10,rng));
  }
  // pivot
  setPixel(grid,12,12,jitter(MT,5,rng)); setPixel(grid,13,12,jitter(MTL,5,rng));
  // sling bucket (tip of arm)
  for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++) setPixel(grid,4+dx,18+dy,jitter(WD2,8,rng));
  // counterweight (other end)
  for(let dx=-2;dx<=2;dx++) for(let dy=-2;dy<=2;dy++) setPixel(grid,20+dx,6+dy,jitter([95,90,82,255],10,rng));
  return grid;
}

function makeBoat(seed) {
  const W=28,H=14, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const WD=[92,62,25,255],WL=[125,85,40,255],WD2=[68,45,15,255];
  const water=[52,88,128,255],waterL=[70,108,148,255];
  const cx=W/2,cy=H/2,rx=W/2-1,ry=H/2-1;
  // hull — top-down oval
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy,dist=Math.sqrt((dx/rx)**2+(dy/ry)**2);
    if(dist<=1){
      // planks run lengthwise (vertical grain at each x)
      const lt=(dx/rx*0.2+dy/ry*0.3)*0.5+0.5;
      let c=lerp(WL,WD,lt);
      c=jitter(c,12,rng);
      if(x%3===0) c=jitter(WD2,7,rng); // plank seam
      setPixel(grid,x,y,c);
    }
    // water around hull
    if(dist>1&&dist<=1.4) setPixel(grid,x,y,jitter(rng()<0.4?water:waterL,12,rng));
  }
  // hull rim
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy,dist=Math.sqrt((dx/rx)**2+(dy/ry)**2);
    if(dist>=0.88&&dist<=1) setPixel(grid,x,y,jitter(WD2,6,rng));
  }
  // mast — top-down: small circle with shadow
  const mx=Math.floor(cx),my=Math.floor(cy);
  for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++) setPixel(grid,mx+dx,my+dy,jitter([55,40,18,255],6,rng));
  setPixel(grid,mx,my,jitter([75,58,28,255],5,rng));
  setPixel(grid,mx+1,my+1,[30,22,10,180]); setPixel(grid,mx+2,my+1,[30,22,10,120]);
  // benches across hull
  [Math.floor(W*0.3),Math.floor(W*0.5),Math.floor(W*0.7)].forEach(bx=>{
    const bdy=Math.round(ry*Math.sqrt(Math.max(0,1-((bx-cx)/rx)**2))-1);
    for(let dy=-bdy;dy<=bdy;dy++) if(grid[my+dy]?.[bx]) setPixel(grid,bx,my+dy,jitter(WD2,8,rng));
  });
  return grid;
}

function makeBridge(seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const WD=[105,75,35,255],WL=[135,98,50,255],WD2=[78,52,20,255];
  const stone=[125,118,108,255],stoneD=[85,80,72,255];
  const water=[52,88,128,255],waterL=[68,108,148,255];
  // water (transparent-ish — this sprite sits over water terrain)
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) setPixel(grid,x,y,jitter(rng()<0.4?water:waterL,12,rng));
  // stone abutments at top and bottom
  for(let y=0;y<4;y++) for(let x=4;x<W-4;x++) setPixel(grid,x,y,jitter(rng()<0.5?stone:stoneD,8,rng));
  for(let y=H-4;y<H;y++) for(let x=4;x<W-4;x++) setPixel(grid,x,y,jitter(rng()<0.5?stone:stoneD,8,rng));
  // planks running top to bottom (top-down: plank seams horizontal)
  for(let y=4;y<H-4;y++) for(let x=4;x<W-4;x++){
    setPixel(grid,x,y,jitter(y%3===0?WD2:rng()<0.5?WD:WL,10,rng));
  }
  // railing posts — dots at intervals on each side
  for(let y=5;y<H-5;y+=3){
    setPixel(grid,4,y,jitter([145,125,85,255],8,rng));
    setPixel(grid,W-5,y,jitter([145,125,85,255],8,rng));
  }
  // railing lines connecting posts
  for(let y=4;y<H-4;y++){
    setPixel(grid,4,y,jitter([128,108,68,255],6,rng));
    setPixel(grid,W-5,y,jitter([128,108,68,255],6,rng));
  }
  return grid;
}

function makeMagicCircle(seed) {
  const W=20,H=20, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const cx=10,cy=10;
  // circle colours — varied arcane styles
  const arcCols=[[88,148,188,255],[148,88,188,255],[188,148,48,255],[88,188,128,255]];
  const arc=jitter(arcCols[Math.floor(rng()*arcCols.length)],10,rng);
  const arcL=lerp(arc,[255,255,255,255],0.3);
  const arcD=lerp(arc,[0,0,0,255],0.3);
  // outer ring
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist>=7.5&&dist<=8.5) setPixel(grid,x,y,jitter(arc,8,rng));
    if(dist>=5.5&&dist<=6.5) setPixel(grid,x,y,jitter(arcD,8,rng));
  }
  // pentagram-ish lines
  for(let a=0;a<360;a+=72){
    const rad=a*Math.PI/180;
    const x1=Math.round(cx+Math.cos(rad)*7),y1=Math.round(cy+Math.sin(rad)*7);
    const rad2=(a+144)*Math.PI/180;
    const x2=Math.round(cx+Math.cos(rad2)*7),y2=Math.round(cy+Math.sin(rad2)*7);
    const steps=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));
    for(let s=0;s<=steps;s++){
      const t=s/steps;
      setPixel(grid,Math.round(x1+(x2-x1)*t),Math.round(y1+(y2-y1)*t),jitter(arcL,10,rng));
    }
  }
  // rune dots at points
  for(let a=0;a<360;a+=72){
    const rad=a*Math.PI/180;
    setPixel(grid,Math.round(cx+Math.cos(rad)*7),Math.round(cy+Math.sin(rad)*7),jitter(arcL,4,rng));
  }
  // centre glow
  setPixel(grid,cx,cy,arcL); setPixel(grid,cx-1,cy,arc); setPixel(grid,cx+1,cy,arc); setPixel(grid,cx,cy-1,arc); setPixel(grid,cx,cy+1,arc);
  return grid;
}

function makeShrine(seed) {
  // top-down: small square building with full hip roof + glowing offering on top
  const W=16,H=16, rng=mulberry32(seed), grid=createPixelGrid(W,H);
  const gold=[185,155,50,255],glow=[215,185,80,255];
  const RL=[142,118,102,255],RM=[98,78,68,255],RD=[62,48,42,255],RS=[30,22,20,255];
  const cx=W/2,cy=H/2;
  // full hip roof covering entire footprint
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-cx,dy=y-cy;
    const angle=Math.atan2(dy,dx)*180/Math.PI;
    const dist=Math.min(1,Math.sqrt((dx/cx)**2+(dy/cy)**2));
    let faceBase,u;
    const v=Math.round(dist*Math.min(cx,cy));
    if(angle>=-135&&angle<-45){faceBase=lerp(RL,RM,dist);u=x;}
    else if(angle>=-45&&angle<45){faceBase=lerp(RM,RD,dist);u=y;}
    else if(angle>=45&&angle<135){faceBase=lerp(RD,lerp(RD,RS,0.4),dist);u=x;}
    else{faceBase=lerp(lerp(RM,RD,0.5),RS,dist);u=y;}
    setPixel(grid,x,y,tileAlong(u,v,faceBase,RS,rng));
  }
  // ridge lines
  [[0,0],[W-1,0],[0,H-1],[W-1,H-1]].forEach(([x2,y2])=>{
    const steps=Math.max(Math.abs(cx-x2),Math.abs(cy-y2));
    for(let s=0;s<=steps;s++){
      const t=s/Math.max(1,steps);
      setPixel(grid,Math.round(x2+(cx-x2)*t)|0,Math.round(y2+(cy-y2)*t)|0,lerp(RS,[15,10,8,255],0.4));
    }
  });
  // offering glow on centre of roof
  setPixel(grid,cx|0,cy|0,glow);
  [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx,dy])=>setPixel(grid,(cx+dx)|0,(cy+dy)|0,gold));
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy])=>setPixel(grid,(cx+dx)|0,(cy+dy)|0,jitter([165,130,45,200],10,rng)));
  return grid;
}


// ─── IRREGULAR BUILDING SHAPES ───────────────────────────────────────────────
// These generate L, T, and irregular footprints with proper roofs per section

function makeIrregularRoof(footprintType, w, h, pattern, RL, RM, RD, RS, chimneys, seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(w,h);

  // Fill a rectangular section with a hip roof
  const fillHipSection=(x0,y0,sw,sh,lightMult=1)=>{
    const cx=x0+sw/2, cy=y0+sh/2;
    for(let y=y0;y<y0+sh;y++) for(let x=x0;x<x0+sw;x++){
      const dx=x-cx,dy=y-cy;
      const angle=Math.atan2(dy,dx)*180/Math.PI;
      const dist=Math.min(1,Math.sqrt((dx/(sw/2))**2+(dy/(sh/2))**2));
      let faceBase,u;
      const v=Math.round(dist*Math.min(sw/2,sh/2));
      if(angle>=-135&&angle<-45){faceBase=lerp(RL,RM,dist);u=x;}
      else if(angle>=-45&&angle<45){faceBase=lerp(RM,RD,dist);u=y;}
      else if(angle>=45&&angle<135){faceBase=lerp(RD,lerp(RD,RS,0.4),dist);u=x;}
      else{faceBase=lerp(lerp(RM,RD,0.5),RS,dist);u=y;}
      setPixel(grid,x,y,applyTilePattern(pattern,x,y,u,v,faceBase,RS,dist,angle,rng));
    }
    // ridge lines for this section
    [[x0,y0],[x0+sw-1,y0],[x0,y0+sh-1],[x0+sw-1,y0+sh-1]].forEach(([cx2,cy2])=>{
      const rdx=Math.round(cx)-cx2,rdy=Math.round(cy)-cy2;
      const steps=Math.max(Math.abs(rdx),Math.abs(rdy));
      for(let s=0;s<=steps;s++){
        const t=s/Math.max(1,steps);
        const rx=Math.round(cx2+rdx*t)|0,ry=Math.round(cy2+rdy*t)|0;
        if(rx>=x0&&rx<x0+sw&&ry>=y0&&ry<y0+sh) setPixel(grid,rx,ry,lerp(RS,[18,14,10,255],0.4));
      }
    });
  };

  // Fill a rectangular section with a ridge roof
  const fillRidgeSection=(x0,y0,sw,sh)=>{
    const ridgeY=y0+Math.floor(sh/2);
    for(let y=y0;y<y0+sh;y++) for(let x=x0;x<x0+sw;x++){
      const t=y<ridgeY?(y-y0)/Math.max(1,sh/2):(y-ridgeY)/Math.max(1,sh/2);
      const fc=y<ridgeY?lerp(RL,RM,t):lerp(RM,RD,t);
      const dist=t, angle=y<ridgeY?270:90;
      setPixel(grid,x,y,applyTilePattern(pattern,x,y,x,y,fc,RD,dist,angle,rng));
    }
    for(let x=x0;x<x0+sw;x++) setPixel(grid,x,ridgeY,lerp(RS,[18,14,10,255],0.35));
  };

  if(footprintType==='L'){
    // L-shape: main body + wing on bottom-left
    // Main section: full width, top 60%
    const mainH=Math.round(h*0.6);
    const wingW=Math.round(w*0.5);
    const wingH=h-mainH;
    fillRidgeSection(0,0,w,mainH);
    fillHipSection(0,mainH,wingW,wingH);
    // Shadow/valley where sections meet
    for(let x=0;x<w;x++) if(grid[mainH]?.[x]) setPixel(grid,x,mainH,lerp(grid[mainH][x],RS,0.4));
    for(let x=wingW;x<w;x++) for(let y=mainH;y<h;y++) grid[y][x]=null; // transparent overhang area
  } else if(footprintType==='T'){
    // T-shape: wide top bar + centre stem
    const barH=Math.round(h*0.45);
    const stemW=Math.round(w*0.45);
    const stemX=Math.round((w-stemW)/2);
    const stemH=h-barH;
    fillRidgeSection(0,0,w,barH);
    fillHipSection(stemX,barH,stemW,stemH);
    for(let x=0;x<w;x++) if(grid[barH]?.[x]) setPixel(grid,x,barH,lerp(grid[barH][x],RS,0.4));
    // transparent sides of stem
    for(let y=barH;y<h;y++) for(let x=0;x<stemX;x++) grid[y][x]=null;
    for(let y=barH;y<h;y++) for(let x=stemX+stemW;x<w;x++) grid[y][x]=null;
  } else if(footprintType==='irregular'){
    // Random 5-6 sided polygon footprint using 3 overlapping rectangles
    const r2=mulberry32(seed+9977);
    // Main block
    const mw=Math.round(w*0.65+r2()*w*0.2), mh=Math.round(h*0.6+r2()*h*0.2);
    const mx=Math.round(r2()*(w-mw)), my=Math.round(r2()*(h-mh));
    fillHipSection(mx,my,mw,mh);
    // Annexe 1
    const aw1=Math.round(w*0.35+r2()*w*0.2), ah1=Math.round(h*0.35+r2()*h*0.15);
    const ax1=r2()<0.5?0:w-aw1, ay1=Math.round(r2()*(h-ah1));
    fillHipSection(ax1,ay1,aw1,ah1);
    // Clear pixels outside any filled section (transparency)
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const inMain=(x>=mx&&x<mx+mw&&y>=my&&y<my+mh);
      const inAnnexe=(x>=ax1&&x<ax1+aw1&&y>=ay1&&y<ay1+ah1);
      if(!inMain&&!inAnnexe) grid[y][x]=null;
    }
  }

  // Chimneys
  chimneys.forEach(([chx,chy])=>{
    if(grid[chy]?.[chx]){
      for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++)
        if(grid[chy+dy]?.[chx+dx]) setPixel(grid,chx+dx,chy+dy,(dx||dy)?[70,62,54,255]:[45,38,33,255]);
      setPixel(grid,chx+1,chy-1,[98,88,74,255]);
    }
  });
  return grid;
}

function makeIrregularThatch(footprintType, w, h, chimneys, seed) {
  const rng=mulberry32(seed), grid=createPixelGrid(w,h);
  const TL=[198,172,80,255],TM=[168,140,54,255],TD=[128,104,34,255],TS=[90,70,20,255];

  const thatchPx=(x,y,angle)=>{
    const streak=(x*Math.cos(angle*Math.PI/180+0.5)+y*Math.sin(angle*Math.PI/180+0.5));
    const bundle=Math.floor(streak/2)%3;
    let c=bundle===0?jitter(TL,16,rng):bundle===1?jitter(TM,14,rng):jitter(TD,12,rng);
    if(rng()<0.12) c=lerp(c,TS,rng()*0.5+0.2);
    return c;
  };

  const fillThatchSection=(x0,y0,sw,sh)=>{
    const ridgeY=y0+Math.floor(sh/2);
    for(let y=y0;y<y0+sh;y++) for(let x=x0;x<x0+sw;x++){
      setPixel(grid,x,y,thatchPx(x,y,y<ridgeY?270:90));
    }
    for(let x=x0;x<x0+sw;x++){
      setPixel(grid,x,ridgeY,jitter(TS,6,rng));
      if(ridgeY-1>=y0) setPixel(grid,x,ridgeY-1,jitter(TD,8,rng));
    }
  };

  if(footprintType==='L'){
    const mainH=Math.round(h*0.6), wingW=Math.round(w*0.5), wingH=h-mainH;
    fillThatchSection(0,0,w,mainH);
    fillThatchSection(0,mainH,wingW,wingH);
    for(let x=wingW;x<w;x++) for(let y=mainH;y<h;y++) grid[y][x]=null;
  } else if(footprintType==='T'){
    const barH=Math.round(h*0.45), stemW=Math.round(w*0.45), stemX=Math.round((w-stemW)/2), stemH=h-barH;
    fillThatchSection(0,0,w,barH);
    fillThatchSection(stemX,barH,stemW,stemH);
    for(let y=barH;y<h;y++) for(let x=0;x<stemX;x++) grid[y][x]=null;
    for(let y=barH;y<h;y++) for(let x=stemX+stemW;x<w;x++) grid[y][x]=null;
  } else {
    const r2=mulberry32(seed+9977);
    const mw=Math.round(w*0.65+r2()*w*0.2), mh=Math.round(h*0.6+r2()*h*0.2);
    const mx=Math.round(r2()*(w-mw)), my=Math.round(r2()*(h-mh));
    fillThatchSection(mx,my,mw,mh);
    const aw1=Math.round(w*0.35+r2()*w*0.2), ah1=Math.round(h*0.35+r2()*h*0.15);
    const ax1=r2()<0.5?0:w-aw1, ay1=Math.round(r2()*(h-ah1));
    fillThatchSection(ax1,ay1,aw1,ah1);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      if(!(x>=mx&&x<mx+mw&&y>=my&&y<my+mh)&&!(x>=ax1&&x<ax1+aw1&&y>=ay1&&y<ay1+ah1)) grid[y][x]=null;
    }
  }

  chimneys.forEach(([chx,chy])=>{
    if(grid[chy]?.[chx]){ for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++) if(grid[chy+dy]?.[chx+dx]) setPixel(grid,chx+dx,chy+dy,(dx||dy)?[70,62,54,255]:[45,38,33,255]); }
  });
  return grid;
}

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const ROOF_STYLES = [
  // Warm reds & oranges
  {id:"red",       label:"Red Tile",     RL:[215,108,68,255], RM:[175,75,42,255],  RD:[120,42,22,255], RS:[68,22,8,255]},
  {id:"reddk",     label:"Dark Red",     RL:[185,72,45,255],  RM:[145,48,25,255],  RD:[100,28,12,255], RS:[58,15,5,255]},
  {id:"orange",    label:"Orange",       RL:[225,158,70,255], RM:[185,112,35,255], RD:[135,72,15,255], RS:[80,40,5,255]},
  {id:"amber",     label:"Amber",        RL:[235,185,60,255], RM:[195,145,30,255], RD:[148,102,15,255],RS:[90,60,5,255]},
  // Browns & terracotta
  {id:"brown",     label:"Brown",        RL:[198,128,65,255], RM:[155,85,35,255],  RD:[105,48,14,255], RS:[62,28,5,255]},
  {id:"dkbrown",   label:"Dark Brown",   RL:[165,98,45,255],  RM:[125,68,22,255],  RD:[85,42,10,255],  RS:[48,22,4,255]},
  {id:"terra",     label:"Terracotta",   RL:[195,138,88,255], RM:[155,100,55,255], RD:[108,65,25,255], RS:[62,35,10,255]},
  {id:"sand",      label:"Sandy",        RL:[218,188,125,255],RM:[182,152,90,255], RD:[138,108,55,255],RS:[88,65,28,255]},
  // Greys & stone
  {id:"slate",     label:"Slate",        RL:[145,120,105,255],RM:[100,80,70,255],  RD:[64,50,44,255],  RS:[32,24,20,255]},
  {id:"darkslate", label:"Dark Slate",   RL:[108,92,82,255],  RM:[75,62,55,255],   RD:[48,38,34,255],  RS:[25,18,15,255]},
  {id:"blueslate", label:"Blue Slate",   RL:[115,125,138,255],RM:[82,92,108,255],  RD:[52,60,75,255],  RS:[28,32,45,255]},
  {id:"limestone", label:"Limestone",    RL:[205,198,178,255],RM:[168,160,140,255],RD:[125,118,100,255],RS:[78,72,58,255]},
  // Greens
  {id:"green",     label:"Mossy Green",  RL:[105,142,80,255], RM:[75,112,55,255],  RD:[50,80,32,255],  RS:[28,50,16,255]},
  {id:"dkgreen",   label:"Dark Moss",    RL:[78,112,52,255],  RM:[55,85,35,255],   RD:[35,58,20,255],  RS:[18,35,10,255]},
  // Weathered & special
  {id:"aged",      label:"Aged Clay",    RL:[178,148,108,255],RM:[138,110,75,255], RD:[95,72,42,255],  RS:[55,40,20,255]},
  {id:"blackened", label:"Blackened",    RL:[88,80,72,255],   RM:[60,54,48,255],   RD:[38,34,30,255],  RS:[18,16,14,255]},
  {id:"thatch",    label:"🌾 Thatch",     RL:[195,168,78,255], RM:[165,138,52,255], RD:[125,102,32,255], RS:[88,68,18,255], isThatch:true},
];


const BUILDING_TYPES = [
  {id:"standard",    label:"Standard"},
  {id:"watchtower",  label:"Watchtower"},
  {id:"windmill",    label:"Windmill"},
  {id:"gate",        label:"Gate"},
  {id:"castle_wall", label:"Castle Wall"},
  {id:"dungeon_ent", label:"Dungeon Entrance"},
  {id:"ruins",       label:"Ruins"},
  {id:"l_shape",     label:"L-Shape"},
  {id:"t_shape",     label:"T-Shape"},
  {id:"irregular",   label:"Irregular"},
];

const ROOF_SHAPES = [
  {id:"hip",     label:"Hip"},
  {id:"ridge",   label:"Ridge"},
  {id:"pyramid", label:"Pyramid"},
  {id:"mansard", label:"Mansard"},
  {id:"gambrel", label:"Gambrel"},
  {id:"conical", label:"Conical"},
];

const TILE_PATTERNS = [
  {id:"default", label:"Tile"},
  {id:"fish",    label:"Fish Scale"},
  {id:"diamond", label:"Diamond"},
  {id:"slate",   label:"Flagstone"},
  {id:"shake",   label:"Shake"},
];

const SIZE_OPTIONS = [20, 40, 60, 80];
const YARD_POS_OPTIONS = [{id:"none",label:"No Yard"},{id:"bottom",label:"Bottom"},{id:"top",label:"Top"},{id:"left",label:"Left"},{id:"right",label:"Right"}];

// ─── NON-BUILDING CATEGORIES ─────────────────────────────────────────────────
const CASTLE_WALL_SHAPES = [
  {id:"straight_h",label:"━ Straight H"},
  {id:"straight_v",label:"┃ Straight V"},
  {id:"corner_se", label:"┏ Corner SE"},
  {id:"corner_sw", label:"┓ Corner SW"},
  {id:"corner_ne", label:"┗ Corner NE"},
  {id:"corner_nw", label:"┛ Corner NW"},
];

const OTHER_CATEGORIES = {
  trees: {
    label:"Trees", icon:"🌲",
    types:[
      {id:"oak_s",  label:"Oak (sm)",  w:20,h:20, gen:(s,seed)=>makeTopDownTree(20,20,"oak",seed)},
      {id:"oak_l",  label:"Oak (lg)",  w:32,h:32, gen:(s,seed)=>makeTopDownTree(32,32,"oak",seed)},
      {id:"pine_s", label:"Pine (sm)", w:20,h:20, gen:(s,seed)=>makeTopDownTree(20,20,"pine",seed)},
      {id:"pine_l", label:"Pine (lg)", w:32,h:32, gen:(s,seed)=>makeTopDownTree(32,32,"pine",seed)},
      {id:"palm",   label:"Palm",      w:24,h:24, gen:(s,seed)=>makeTopDownTree(24,24,"palm",seed)},
      {id:"dead",   label:"Dead Tree", w:24,h:24, gen:(s,seed)=>makeTopDownTree(24,24,"dead",seed)},
      {id:"thicket",  label:"Thicket",     w:24,h:24, gen:(s,seed)=>makeThicket(seed)},
      {id:"giant_roots",label:"Giant Roots",w:20,h:20, gen:(s,seed)=>makeGiantRoots(seed)},
      {id:"bush_sm",  label:"Bushes (sm)", w:16,h:16, gen:(s,seed)=>makeBushField("sm",seed)},
      {id:"bush_lg",  label:"Bushes (lg)", w:24,h:24, gen:(s,seed)=>makeBushField("lg",seed)},
    ]
  },
  nature: {
    label:"Nature", icon:"🪨",
    types:[
      {id:"rock_s",  label:"Rock",       w:12,h:10, gen:(s,seed)=>makeRock(12,10,"small",seed)},
      {id:"boulder", label:"Boulder",    w:20,h:18, gen:(s,seed)=>makeRock(20,18,"boulder",seed)},
      {id:"mossy",   label:"Mossy Rock", w:18,h:16, gen:(s,seed)=>makeRock(18,16,"mossy",seed)},
      {id:"pond_s",  label:"Pond (sm)",  w:24,h:20, gen:(s,seed)=>makePond(24,20,seed)},
      {id:"pond_l",  label:"Pond (lg)",  w:40,h:32, gen:(s,seed)=>makePond(40,32,seed)},
      {id:"mush_sm",  label:"Mushroom (sm)",w:10,h:10, gen:(s,seed)=>makeMushroom("sm",seed)},
      {id:"mush_lg",  label:"Mushroom (lg)",w:16,h:16, gen:(s,seed)=>makeMushroom("lg",seed)},
      {id:"fallen_log",label:"Fallen Log",  w:24,h:12, gen:(s,seed)=>makeFallenLog(seed)},
      {id:"flowers",  label:"Flower Patch", w:16,h:16, gen:(s,seed)=>makeFlowerPatch(seed)},
      {id:"fern",     label:"Fern",          w:14,h:14, gen:(s,seed)=>makePlant("fern",seed)},
      {id:"reeds",    label:"Reeds",         w:12,h:16, gen:(s,seed)=>makePlant("reeds",seed)},
      {id:"lily",     label:"Lily Pad",      w:14,h:14, gen:(s,seed)=>makePlant("lily",seed)},
      {id:"vine",     label:"Vine",          w:16,h:16, gen:(s,seed)=>makePlant("vine",seed)},
      {id:"cactus_p", label:"Cactus",        w:12,h:18, gen:(s,seed)=>makePlant("cactus",seed)},
      {id:"crop_wheat",  label:"Wheat",          w:20,h:20, isCrop:true, cropType:"wheat"},
      {id:"crop_corn",   label:"Corn",           w:20,h:20, isCrop:true, cropType:"corn"},
      {id:"crop_veg",    label:"Vegetables",     w:20,h:20, isCrop:true, cropType:"vegetables"},
    ]
  },
  extras: {
    label:"Extras", icon:"⚗️",
    types:[
      {id:"well",       label:"Well",          w:16,h:16, gen:(s,seed)=>makeWell(16,16,seed)},
      {id:"haystack",   label:"Haystack",       w:18,h:14, gen:(s,seed)=>makeHaystack(18,14,seed)},
      {id:"graveyard",  label:"Graveyard",      w:40,h:40, dynamic:true, gen:(s,seed,w,h)=>makeGraveyard(w||40,h||40,seed)},
      {id:"campfire",   label:"Campfire",       w:16,h:16, gen:(s,seed)=>makeCampfire(seed)},
      {id:"stall",      label:"Market Stall",   w:24,h:20, isStall:true},
      {id:"fence",      label:"Stockade Fence", w:20,h:12, gen:(s,seed)=>makeStockadeFence(seed)},
      {id:"signpost",   label:"Signpost",       w:14,h:18, gen:(s,seed)=>makeSignpost(seed)},
      {id:"anvil",      label:"Forge & Anvil",  w:16,h:14, gen:(s,seed)=>makeAnvil(seed)},
      {id:"logpile",    label:"Log Pile",       w:20,h:14, gen:(s,seed)=>makeLogPile(seed)},
      {id:"barrels",    label:"Barrel Cluster", w:18,h:16, gen:(s,seed)=>makeBarrelCluster(seed)},
      {id:"noticeboard",label:"Notice Board",   w:16,h:16, gen:(s,seed)=>makeNoticeboard(seed)},
      {id:"trough",     label:"Trough",         w:18,h:10, gen:(s,seed)=>makeTrough(seed)},
      {id:"coop",       label:"Chicken Coop",   w:20,h:18, gen:(s,seed)=>makeChickenCoop(seed)},
      {id:"chest",      label:"Chest",          w:14,h:12, gen:(s,seed)=>makeChest(seed)},
      {id:"campsite",   label:"Campsite",        w:24,h:20, gen:(s,seed)=>makeCampsite(seed)},
      {id:"altar",      label:"Altar",           w:20,h:20, gen:(s,seed)=>makeAltar(seed)},
      {id:"stocks",     label:"Stocks",          w:20,h:12, gen:(s,seed)=>makeStocks(seed)},
      {id:"torch",      label:"Torch",           w:8,h:16,  gen:(s,seed)=>makeTorch(seed)},
      {id:"dungeon_bars",label:"Dungeon Bars",   w:16,h:20, gen:(s,seed)=>makeDungeonBars(seed)},
      {id:"catapult",   label:"Catapult",        w:24,h:20, gen:(s,seed)=>makeCatapult(seed)},
      {id:"boat",       label:"Boat",            w:28,h:16, gen:(s,seed)=>makeBoat(seed)},
      {id:"bridge",     label:"Bridge",          w:20,h:20, gen:(s,seed)=>makeBridge(seed)},
      {id:"magic_circle",label:"Magic Circle",   w:20,h:20, gen:(s,seed)=>makeMagicCircle(seed)},
      {id:"shrine",     label:"Shrine",          w:16,h:16, gen:(s,seed)=>makeShrine(seed)},
      {id:"gold_pile",  label:"Gold Pile",       w:16,h:12, gen:(s,seed)=>makeGoldPile(seed)},
      {id:"cart",       label:"Cart",            w:22,h:18, gen:(s,seed)=>makeCart(seed)},
      {id:"skeleton",   label:"Skeleton",        w:10,h:18, gen:(s,seed)=>makeSkeleton(seed)},
      {id:"dead_body",  label:"Dead Body",       w:12,h:20, gen:(s,seed)=>makeDeadBody(seed)},
      {id:"dirt_hole",  label:"Dirt Hole",       w:16,h:14, gen:(s,seed)=>makeDirtHole(seed)},
      {id:"blood_spatter",label:"Blood Spatter",  w:16,h:16, gen:(s,seed)=>makeBloodSpatter(seed)},
      {id:"bones_pile", label:"Bones Pile",       w:16,h:14, gen:(s,seed)=>makeBonesPile(seed)},
      {id:"tent",       label:"Tent",            w:24,h:20, gen:(s,seed)=>makeTent(seed)},
      {id:"trapdoor",   label:"Trapdoor",        w:14,h:14, gen:(s,seed)=>makeTrapdoor(seed)},
    ]
  },
  furniture: {
    label:"Furniture", icon:"🪑",
    types:[
      {id:"bed_s",      label:"Bed (single)",   w:14,h:24, gen:(s,seed)=>makeBed("single",seed)},
      {id:"bed_d",      label:"Bed (double)",   w:20,h:24, gen:(s,seed)=>makeBed("double",seed)},
      {id:"table_r",    label:"Table (round)",  w:16,h:16, gen:(s,seed)=>makeTable("round",seed)},
      {id:"table_l",    label:"Table (long)",   w:24,h:16, gen:(s,seed)=>makeTable("long",seed)},
      {id:"chair",      label:"Chair",          w:12,h:14, gen:(s,seed)=>makeChair("chair",seed)},
      {id:"throne",     label:"Throne",         w:18,h:20, gen:(s,seed)=>makeChair("throne",seed)},
      {id:"bookshelf",  label:"Bookshelf",      w:20,h:16, gen:(s,seed)=>makeBookshelf(seed)},
      {id:"drawers",    label:"Chest of Drawers",w:18,h:14, gen:(s,seed)=>makeDrawers(seed)},
      {id:"cauldron",   label:"Cauldron",       w:14,h:14, gen:(s,seed)=>makeCauldron(seed)},
      {id:"weaponrack", label:"Weapon Rack",    w:20,h:16, gen:(s,seed)=>makeWeaponRack(seed)},
      {id:"desk",       label:"Desk",            w:20,h:14, gen:(s,seed)=>makeDesk(seed)},
      {id:"stool",      label:"Stool",           w:10,h:10, gen:(s,seed)=>makeStool(seed)},
      {id:"wardrobe",   label:"Wardrobe",        w:18,h:12, gen:(s,seed)=>makeWardrobe(seed)},
      {id:"stairs",     label:"Stairs",          w:16,h:20, gen:(s,seed)=>makeStairs(seed)},
      {id:"basin",      label:"Stone Basin",     w:16,h:12, gen:(s,seed)=>makeBasin(seed)},
    ]
  },
  terrain: {
    label:"Terrain", icon:"🌿",
    types:[
      {id:"t_grass",   label:"Grass",           w:20,h:20, gen:(s,seed,nb)=>makeTerrain("grass",seed,nb||{})},
      {id:"t_sand",    label:"Sand",             w:20,h:20, gen:(s,seed,nb)=>makeTerrain("sand",seed,nb||{})},
      {id:"t_dirt",    label:"Dirt",             w:20,h:20, gen:(s,seed,nb)=>makeTerrain("dirt",seed,nb||{})},
      {id:"t_mud",     label:"Mud",              w:20,h:20, gen:(s,seed,nb)=>makeTerrain("mud",seed,nb||{})},
      {id:"t_cobble",  label:"Cobblestone",      w:20,h:20, gen:(s,seed,nb)=>makeTerrain("cobble",seed,nb||{})},
      {id:"t_farm",    label:"Farmland",         w:20,h:20, gen:(s,seed,nb)=>makeTerrain("farmland",seed,nb||{})},
      {id:"t_swamp",   label:"Swamp",            w:20,h:20, gen:(s,seed,nb)=>makeTerrain("swamp",seed,nb||{})},
      {id:"t_water",   label:"Water",            w:20,h:20, gen:(s,seed,nb)=>makeTerrain("water",seed,nb||{})},
      {id:"t_snow",    label:"Snow",             w:20,h:20, gen:(s,seed,nb)=>makeTerrain("snow",seed,nb||{})},
      {id:"t_forest",  label:"Forest Floor",     w:20,h:20, gen:(s,seed,nb)=>makeTerrain("forest_floor",seed,nb||{})},
      {id:"t_cracked", label:"Cracked Earth", w:20,h:20, gen:(s,seed)=>makeCrackedEarth(seed)},
      {id:"t_lava",    label:"Lava",            w:20,h:20, gen:(s,seed,nb)=>makeTerrain("lava",seed,nb||{})},
      {id:"t_ice",     label:"Ice",             w:20,h:20, gen:(s,seed,nb)=>makeTerrain("ice",seed,nb||{})},
      {id:"t_corrupt", label:"Corrupted",       w:20,h:20, gen:(s,seed,nb)=>makeTerrain("corrupt",seed,nb||{})},
      {id:"t_rocky",   label:"Rocky",           w:20,h:20, gen:(s,seed,nb)=>makeTerrain("rocky",seed,nb||{})},
      {id:"t_cave",    label:"Cave Floor",      w:20,h:20, gen:(s,seed,nb)=>makeTerrain("cave",seed,nb||{})},
      {id:"t_shallow", label:"Shallow Water",   w:20,h:20, gen:(s,seed,nb)=>makeTerrain("shallow_water",seed,nb||{})},
      {id:"floor_h",     label:"Planks H",      w:20,h:20, gen:(s,seed)=>makeFloorboard("h",seed)},
      {id:"floor_v",     label:"Planks V",      w:20,h:20, gen:(s,seed)=>makeFloorboard("v",seed)},
      {id:"floor_hbone", label:"Herringbone",   w:20,h:20, gen:(s,seed)=>makeFloorboard("herringbone",seed)},
      {id:"floor_diag",  label:"Diagonal",      w:20,h:20, gen:(s,seed)=>makeFloorboard("diagonal",seed)},
      {id:"floor_parq",  label:"Parquet",       w:20,h:20, gen:(s,seed)=>makeFloorboard("parquet",seed)},
      {id:"floor_stone", label:"Stone Tile",    w:20,h:20, gen:(s,seed)=>makeFloorboard("stone",seed)},
      {id:"water_tile",label:"Water (dynamic)",w:20,h:20, isWaterTile:true},
      {id:"stone_wall",label:"Stone Wall", w:20,h:20, isStoneWall:true},
      {id:"fence",    label:"Wood Fence", w:20,h:20, isFence:true},
      {id:"cart_track",label:"Cart Track",w:20,h:20, isCartTrack:true},
      {id:"path",   label:"Path",   w:20,h:20, isPath:true},
      {id:"hedge",  label:"Hedge",  w:20,h:20, isHedge:true},
    ]
  }
};

// ─── CANVAS RENDERER ─────────────────────────────────────────────────────────
function renderGridToCanvas(grid, canvas, scale=1) {
  if (!grid||!canvas) return;
  const h=grid.length, w=grid[0].length;
  canvas.width=w*scale; canvas.height=h*scale;
  const ctx=canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
    const col=grid[y][x];
    if (col) { ctx.fillStyle=hex(col); ctx.fillRect(x*scale,y*scale,scale,scale); }
  }
}

function gridToDataURL(grid, scale=1) {
  const c=document.createElement("canvas");
  renderGridToCanvas(grid,c,scale);
  return c.toDataURL("image/png");
}

function makeSpritesheetURL(grids, cols, scale=1) {
  if (!grids.length) return null;
  const maxW=Math.max(...grids.map(g=>g[0].length));
  const maxH=Math.max(...grids.map(g=>g.length));
  const rows=Math.ceil(grids.length/cols);
  const c=document.createElement("canvas");
  c.width=cols*(maxW*scale+2); c.height=rows*(maxH*scale+2);
  const ctx=c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
  grids.forEach((grid,i)=>{
    const col=i%cols, row=Math.floor(i/cols);
    const tmp=document.createElement("canvas");
    renderGridToCanvas(grid,tmp,scale);
    ctx.drawImage(tmp,col*(maxW*scale+2),row*(maxH*scale+2));
  });
  return c.toDataURL("image/png");
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────
global.MapForge = {
  // Primitives
  mulberry32, lerp, jitter, hex,
  createPixelGrid, setPixel, getPixel,
  renderGridToCanvas, gridToDataURL, makeSpritesheetURL,
  rotateGrid,
  // Terrain
  makeTerrain, makeWaterTile, makeCrackedEarth,
  makeFloorboard, makePath,
  TERRAIN_EDGE_COLS,
  // Nature / objects
  makeTopDownTree, makeRock, makePond, makeWell, makeHaystack,
  makeBushField, makeHedge, makeMushroom, makeFallenLog,
  makeFlowerPatch, makeThicket, makeGiantRoots,
  makeGarden, makeChickenCoop,
  // Buildings / structures
  makeRoofByShape, makeThatchRoof, makeHipRoof, makeRidgeRoof,
  makeIrregularRoof, makeIrregularThatch,
  makeWatchtower, makeWindmill, makeGate, makeCastleWall,
  makeDungeonEntrance, makeRuins,
  makeStoneWall, makeWoodenFence, makeCartTrack,
  makeYard, composeWithYard, autoChimneys,
  // Furniture / interior
  makeBed, makeTable, makeChair, makeBookshelf,
  makeFireplace, makeDrawers, makeCauldron,
  makeWeaponRack, makeDesk, makeStool, makeWardrobe,
  makeStairs, makeBasin,
  // Outdoor props
  makeGraveyard, makeCampfire, makeMarketStall,
  makeStockadeFence, makeSignpost, makeAnvil,
  makeLogPile, makeBarrelCluster, makeNoticeboard,
  makeTrough, makeGoldPile, makeCart, makeSkeleton,
  makeDeadBody, makeDirtHole, makePlant, makeTent,
  makeTrapdoor, makeCropRow, makeBloodSpatter, makeBonesPile,
  // Wilderness
  makeMagicCircle, makeShrine, makeAltar, makeGallows,
  makeStocks, makeTorch, makeDungeonBars, makeCatapult,
  makeBoat, makeBridge, makeCampsite, makeChest,
  // Constants
  ROOF_STYLES: [
    {id:"red",       label:"Red Tile",     RL:[215,108,68,255], RM:[175,75,42,255],  RD:[120,42,22,255], RS:[68,22,8,255]},
    {id:"reddk",     label:"Dark Red",     RL:[185,72,45,255],  RM:[145,48,25,255],  RD:[100,28,12,255], RS:[58,15,5,255]},
    {id:"orange",    label:"Orange",       RL:[225,158,70,255], RM:[185,112,35,255], RD:[135,72,15,255], RS:[80,40,5,255]},
    {id:"amber",     label:"Amber",        RL:[235,185,60,255], RM:[195,145,30,255], RD:[148,102,15,255],RS:[90,60,5,255]},
    {id:"brown",     label:"Brown",        RL:[198,128,65,255], RM:[155,85,35,255],  RD:[105,48,14,255], RS:[62,28,5,255]},
    {id:"dkbrown",   label:"Dark Brown",   RL:[165,98,45,255],  RM:[125,68,22,255],  RD:[85,42,10,255],  RS:[48,22,4,255]},
    {id:"terra",     label:"Terracotta",   RL:[195,138,88,255], RM:[155,100,55,255], RD:[108,65,25,255], RS:[62,35,10,255]},
    {id:"sand",      label:"Sandy",        RL:[218,188,125,255],RM:[182,152,90,255], RD:[138,108,55,255],RS:[88,65,28,255]},
    {id:"slate",     label:"Slate",        RL:[145,120,105,255],RM:[100,80,70,255],  RD:[64,50,44,255],  RS:[32,24,20,255]},
    {id:"darkslate", label:"Dark Slate",   RL:[108,92,82,255],  RM:[75,62,55,255],   RD:[48,38,34,255],  RS:[25,18,15,255]},
    {id:"blueslate", label:"Blue Slate",   RL:[115,125,138,255],RM:[82,92,108,255],  RD:[52,60,75,255],  RS:[28,32,45,255]},
    {id:"limestone", label:"Limestone",    RL:[205,198,178,255],RM:[168,160,140,255],RD:[125,118,100,255],RS:[78,72,58,255]},
    {id:"green",     label:"Mossy Green",  RL:[105,142,80,255], RM:[75,112,55,255],  RD:[50,80,32,255],  RS:[28,50,16,255]},
    {id:"dkgreen",   label:"Dark Moss",    RL:[78,112,52,255],  RM:[55,85,35,255],   RD:[35,58,20,255],  RS:[18,35,10,255]},
    {id:"aged",      label:"Aged Clay",    RL:[178,148,108,255],RM:[138,110,75,255], RD:[95,72,42,255],  RS:[55,40,20,255]},
    {id:"blackened", label:"Blackened",    RL:[88,80,72,255],   RM:[60,54,48,255],   RD:[38,34,30,255],  RS:[18,16,14,255]},
    {id:"thatch",    label:"Thatch",       RL:[195,168,78,255], RM:[165,138,52,255], RD:[125,102,32,255],RS:[88,68,18,255],isThatch:true},
  ],
};

})(window);
