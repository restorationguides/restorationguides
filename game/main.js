import { TILE, GRAVITY, MOVE_SPEED, AIR_ACCEL, JUMP_VELOCITY, MAX_FALL_SPEED, CAM_LERP, clamp } from './config.js';
import { parseLevel } from './levels.js';
import { initInput, input, blendKeyboard, clearOneShots } from './input.js';
import { moveWithCollisions, rectsOverlap } from './physics.js';
import { initHUD, updateHUD } from './hud.js';
import { drawScene } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let scale = 1;

function resize() {
  const maxW = Math.min(1100, window.innerWidth);
  const maxH = window.innerHeight;
  const logicalW = 960;
  const logicalH = 540;
  const s = Math.min(maxW / logicalW, maxH / logicalH);
  scale = s;
  canvas.width = Math.floor(logicalW * s);
  canvas.height = Math.floor(logicalH * s);
  ctx.imageSmoothingEnabled = false;
}
addEventListener('resize', resize, { passive:true });
resize();

// World / player state
let levelIndex = 0;
let world = parseLevel(levelIndex);

const player = {
  x: world.playerSpawn.x, y: world.playerSpawn.y,
  w: 20, h: 28,
  vx: 0, vy: 0,
  facing: 1,
  onGround: false,
  crouch: false,
  hearts: 3,
  coins: 0,
  holding: null,
  swingTimer: 0
};

let camera = { x: 0, y: 0 };

// Init systems
initInput();
initHUD();
updateHUD(levelIndex, player);

// Loop
let last = 0;
requestAnimationFrame(loop);
function loop(t){
  const dt = Math.min(32, t-last);
  last = t;

  blendKeyboard();
  update(dt/16);
  drawScene(ctx, scale, camera, canvas, world, player);
  clearOneShots();

  requestAnimationFrame(loop);
}

function update(mult){
  // Movement desire
  const want = input.ax;
  const accel = player.onGround ? 0.6 : AIR_ACCEL;
  player.vx += (want*MOVE_SPEED - player.vx) * accel * mult;

  if (Math.abs(want) > 0.05) player.facing = want > 0 ? 1 : -1;
  player.crouch = input.crouch && player.onGround;
  const targetH = player.crouch ? 20 : 28;
  player.h += (targetH - player.h)*0.6;

  // Jump
  if (input.jump && player.onGround){
    player.vy = -JUMP_VELOCITY;
    player.onGround = false;
  }

  // Gravity
  player.vy = Math.min(MAX_FALL_SPEED, player.vy + GRAVITY*mult);

  // Physics
  moveWithCollisions(player, world.tiles);

  // Coins
  for (const coin of world.coins){
    if (!coin.collected && rectsOverlap(player, {x:coin.x+4,y:coin.y+4,w:24,h:24})){
      coin.collected = true;
      player.coins++;
      updateHUD(levelIndex, player);
    }
  }

  // Items pick/drop
  if (input.pick){
    if (player.holding){
      player.holding.x = player.x + (player.facing>0?player.w+4:-12);
      player.holding.y = player.y + player.h - 18;
      player.holding.held = false;
      player.holding = null;
    } else {
      for (const it of world.items){
        if (!it.held && rectsOverlap(player, {x:it.x,y:it.y,w:22,h:22})){
          it.held = true;
          player.holding = it;
          break;
        }
      }
    }
  }

  // Swing
  if (input.swing && player.swingTimer<=0){
    player.swingTimer = 10;
  }
  if (player.swingTimer>0) player.swingTimer--;

  // Carry follow
  if (player.holding){
    player.holding.x = player.x + (player.facing>0 ? player.w+2 : -18);
    player.holding.y = player.y + (player.crouch? player.h-16 : 6);
  }

  // Monsters
  for (const m of world.monsters){
    if (!m.alive) continue;
    m.vy = Math.min(MAX_FALL_SPEED, m.vy + GRAVITY*mult);
    if (m.x < m.patrolLeft) m.vx = Math.abs(m.vx);
    if (m.x > m.patrolRight) m.vx = -Math.abs(m.vx);
    m.dir = m.vx>=0 ? 1 : -1;

    moveWithCollisions(m, world.tiles);

    // Monster vs player
    if (rectsOverlap(player, m)){
      if (player.vy > 2){
        m.alive = false;
        player.vy = -8;
      } else if (m.hitCooldown<=0){
        player.hearts = Math.max(0, player.hearts-1);
        m.hitCooldown = 40;
        if (player.hearts<=0) respawn();
        updateHUD(levelIndex, player);
      }
    }
    if (m.hitCooldown>0) m.hitCooldown--;
  }

  // Swing hitbox vs monsters
  if (player.swingTimer>0){
    const sx = player.facing>0 ? player.x+player.w : player.x-18;
    const sy = player.y + (player.crouch? player.h-14 : 4);
    const sword = {x:sx, y:sy, w:18, h:12};
    for (const m of world.monsters){
      if (m.alive && rectsOverlap(sword, m)){
        m.alive = false;
      }
    }
  }

  // Spikes
  for (const t of world.tiles){
    if (t.type==='^' && rectsOverlap(player, {x:t.x,y:t.y,w:TILE,h:TILE})){
      player.hearts = Math.max(0, player.hearts-1);
      if (player.hearts<=0) respawn();
      updateHUD(levelIndex, player);
    }
  }

  // Door
  if (rectsOverlap(player, {x:world.door.x+4, y:world.door.y+4, w:TILE-8, h:TILE-8})){
    nextLevel();
    return;
  }

  // Camera follow
  const vw = canvas.width/scale, vh = canvas.height/scale;
  const targetCamX = clamp(player.x - vw*0.4, 0, Math.max(0, world.width - vw));
  const targetCamY = clamp(player.y - vh*0.6, 0, Math.max(0, world.height - vh));
  camera.x += (targetCamX - camera.x) * CAM_LERP;
  camera.y += (targetCamY - camera.y) * CAM_LERP;
}

function nextLevel(){
  levelIndex = (levelIndex+1) % 2;
  world = parseLevel(levelIndex);
  player.x = world.playerSpawn.x;
  player.y = world.playerSpawn.y;
  player.vx = player.vy = 0;
  player.holding = null;
  player.coins = 0;
  updateHUD(levelIndex, player);
}

function respawn(){
  player.hearts = 3;
  player.x = world.playerSpawn.x;
  player.y = world.playerSpawn.y;
  player.vx = player.vy = 0;
  player.holding = null;
  updateHUD(levelIndex, player);
}