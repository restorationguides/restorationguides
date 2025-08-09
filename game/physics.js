import { TILE } from './config.js';

export function rectsOverlap(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

function tileRect(x,y){ return {x,y,w:TILE,h:TILE}; }

export function moveWithCollisions(ent, tiles){
  // Horizontal
  ent.x += ent.vx;
  const collX = collidingTiles(ent, tiles);
  for (const t of collX){
    if (ent.vx > 0) ent.x = t.x - ent.w;
    if (ent.vx < 0) ent.x = t.x + TILE;
    ent.vx = 0;
  }
  // Vertical
  ent.y += ent.vy;
  ent.onGround = false;
  const collY = collidingTiles(ent, tiles);
  for (const t of collY){
    if (ent.vy > 0){ ent.y = t.y - ent.h; ent.vy = 0; ent.onGround = true; }
    if (ent.vy < 0){ ent.y = t.y + TILE; ent.vy = 0; }
  }
}

export function collidingTiles(r, tiles){
  const hits = [];
  for (const t of tiles){
    if (t.type==='#' && rectsOverlap(r, tileRect(t.x,t.y))){
      hits.push(t);
    }
  }
  return hits;
}