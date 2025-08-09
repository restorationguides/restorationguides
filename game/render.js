import { SPR } from './sprites.js';

export function drawScene(ctx, scale, camera, canvas, world, player){
  // Clear
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Camera space
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-camera.x, -camera.y);

  // Parallax
  drawParallax(ctx, scale, camera, canvas);

  // Tiles & spikes
  for (const t of world.tiles){
    if (t.type==='#' || t.type==='=') SPR.block(ctx, scale, t.x, t.y, t.type);
    if (t.type==='^') SPR.spike(ctx, scale, t.x, t.y+16);
  }

  // Door
  SPR.door(ctx, scale, world.door.x, world.door.y);

  // Coins
  for (const c of world.coins){
    if (!c.collected) SPR.coin(ctx, scale, c.x, c.y);
  }

  // Items
  for (const it of world.items){
    if (!it.held) SPR.item(ctx, scale, it.x, it.y);
  }

  // Monsters
  for (const m of world.monsters){
    if (m.alive) SPR.goober(ctx, scale, m.x, m.y, m.w, m.h);
  }

  // Sword
  if (player.swingTimer>0){
    const sx = player.facing>0 ? player.x+player.w : player.x-18;
    const sy = player.y + (player.crouch? player.h-14 : 4);
    ctx.fillStyle = '#ffd86b';
    ctx.fillRect(sx, sy, 18, 3);
  }

  // Player
  SPR.player(ctx, scale, player.x, player.y, player.w, player.h, player.facing<0, player.crouch, !!player.holding);

  ctx.restore();
}

function drawParallax(ctx, scale, camera, canvas){
  const w = canvas.width/scale;
  const x = camera.x*0.5;
  ctx.fillStyle = '#0b1220';
  for (let i=0;i<6;i++){
    const bx = (i*280 - (x%280));
    ctx.fillRect(bx, 40, 180, 24);
    ctx.fillRect(bx+120, 90, 140, 18);
  }
}