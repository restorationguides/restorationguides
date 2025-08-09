/* Mossy Metro: Pocket Platformer
 * - Mobile analog stick + action buttons
 * - Keyboard fallback
 * - Tile collisions, coins, items, melee swing, simple monster AI, door to next level
 * Dylan, this is written to be hackable—tweak TILE, SPEED, maps, and sprites below.
*/

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const levelNameEl = document.getElementById('levelName');
  const heartsEl = document.getElementById('hearts');
  const coinsEl = document.getElementById('coins');
  const heldItemEl = document.getElementById('heldItem');

  // Controls
  const stick = document.getElementById('stick');
  const stickBase = document.getElementById('stick-base');
  const stickKnob = document.getElementById('stick-knob');
  const btnJump = document.getElementById('btnJump');
  const btnCrouch = document.getElementById('btnCrouch');
  const btnPick = document.getElementById('btnPick');
  const btnSwing = document.getElementById('btnSwing');

  // --------------------------------------------------
  // Game constants
  const TILE = 32;                 // tile size in world units (logical)
  const GRAVITY = 0.6;
  const MOVE_SPEED = 2.5;
  const AIR_ACCEL = 0.25;
  const FRICTION = 0.75;
  const JUMP_VELOCITY = 10.25;
  const MAX_FALL_SPEED = 16;
  const CAM_LERP = 0.12;

  // Viewport & scaling for crisp pixels on all screens
  let scale = 1;
  function resize() {
    const maxW = Math.min(1100, window.innerWidth);
    const maxH = window.innerHeight;
    // Logical resolution (world pixels we draw) – keep ~16:9
    const logicalW = 960;
    const logicalH = 540;
    // Scale to fit container
    const s = Math.min(maxW / logicalW, maxH / logicalH);
    scale = s;
    canvas.width = Math.floor(logicalW * s);
    canvas.height = Math.floor(logicalH * s);
    ctx.imageSmoothingEnabled = false;
  }
  addEventListener('resize', resize, { passive:true });
  resize();

  // --------------------------------------------------
  // Tiny "sprite system" as colored shapes / emoji
  const SPR = {
    player: (x,y,w,h,flip,crouch,holding) => {
      ctx.save();
      ctx.translate(x*scale, y*scale);
      ctx.scale(scale, scale);
      if (flip) ctx.scale(-1,1);

      // body
      ctx.fillStyle = '#6be67a';
      ctx.fillRect(flip?-w:0, 0, w, h);

      // visor
      ctx.fillStyle = '#202a36';
      ctx.fillRect(flip?-(w-4):4, 6, w-8, 12);

      // item indicator
      if (holding) {
        ctx.fillStyle = '#ffd86b';
        ctx.fillRect(flip?-(w+6): (w-6), crouch? h-14 : 10, 6, 6);
      }
      ctx.restore();
    },
    goober: (x,y,w,h) => {
      ctx.save();
      ctx.translate(x*scale, y*scale);
      ctx.scale(scale, scale);
      // lil mushroom gremlin
      ctx.fillStyle = '#c67bff';
      ctx.fillRect(0, 6, w, h-6);
      ctx.fillStyle = '#854df0';
      ctx.fillRect(-2, 0, w+4, 10);
      ctx.restore();
    },
    coin: (x,y) => {
      drawEmoji('🪙', x, y);
    },
    spike: (x,y) => {
      ctx.save();
      ctx.translate(x*scale, y*scale);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#9bb3c9';
      ctx.beginPath();
      for(let i=0;i<4;i++){
        ctx.moveTo(i*8,16);
        ctx.lineTo(i*8+4,0);
        ctx.lineTo(i*8+8,16);
      }
      ctx.fill();
      ctx.restore();
    },
    block: (x,y,type) => {
      ctx.save();
      ctx.translate(x*scale, y*scale);
      ctx.scale(scale, scale);
      if (type === '#') {
        ctx.fillStyle = '#2b3c4f';
        ctx.fillRect(0,0,TILE,TILE);
        ctx.fillStyle = '#3a4f66';
        ctx.fillRect(2,2,TILE-4,TILE-4);
      } else if (type === '=') {
        ctx.fillStyle = '#283a2d';
        ctx.fillRect(0,0,TILE,TILE);
        ctx.fillStyle = '#2f6142';
        ctx.fillRect(0,TILE-8,TILE,8);
      }
      ctx.restore();
    },
    door: (x,y,open=true) => {
      ctx.save();
      ctx.translate(x*scale, y*scale);
      ctx.scale(scale, scale);
      ctx.fillStyle = open ? '#8cc7ff' : '#32465a';
      ctx.fillRect(4,4,TILE-8,TILE-4);
      ctx.fillStyle = '#1b2736';
      ctx.fillRect(8,8,TILE-16,TILE-12);
      ctx.restore();
    },
    item: (x,y) => {
      drawEmoji('🪓', x, y);
    }
  };

  function drawEmoji(char, x, y) {
    const px = x*scale, py = y*scale;
    ctx.save();
    ctx.font = `${Math.floor(24*scale)}px system-ui,apple color emoji,Segoe UI Emoji`;
    ctx.textBaseline = 'top';
    ctx.fillText(char, px+4, py+4);
    ctx.restore();
  }

  // --------------------------------------------------
  // Levels: 32x16-ish maps, tiles are 32px
  // Legend:
  //  # solid | = ground deco | ^ spikes | c coin | m monster | i item | D door | P player
  const LEVELS = [
`                                
  c      m           c           
###########     #######     #####
=                              D#
=   c       m     c      m     #
=###########################  ###
=                             ###
=   c        i                 ##
=         ######               ##
=   m                    c     ##
=#############       ######### ##
=                              ##
=   c    m       c        i    ##
=################################
P                               `,
`                                
 m      c     i      m      c   
#############        #########  
=                               
=    c      m     c      m    D#
=############################# ##
=                               #
=   c           i               #
=         #######               #
=   m                    c      #
=###########      ###############
=                               #
=   c    m       c              #
=################################
P                               `];

  // Parse level into objects
  function parseLevel(idx) {
    const lines = LEVELS[idx].split('\n');
    const solids = new Set(['#']);
    const spikes = new Set(['^']);
    const width = Math.max(...lines.map(l => l.length));
    const height = lines.length;
    const tiles = [];
    let playerSpawn = {x: 32, y: 0};
    const coins = [];
    const monsters = [];
    const items = [];
    let door = {x: (width-2)*TILE, y:(3)*TILE};

    for (let y=0;y<height;y++){
      for (let x=0;x<width;x++){
        const ch = (lines[y][x] || ' ');
        const px = x*TILE, py = y*TILE;
        if (ch === 'P') playerSpawn = {x:px, y:py};
        if (ch === 'D') door = {x:px, y:py};
        if (ch === '#') tiles.push({x:px,y:py,type:'#'});
        if (ch === '=') tiles.push({x:px,y:py,type:'='});
        if (ch === '^') tiles.push({x:px,y:py,type:'^'});
        if (ch === 'c') coins.push({x:px,y:py,collected:false});
        if (ch === 'm') monsters.push(spawnMonster(px, py));
        if (ch === 'i') items.push({x:px,y:py,held:false});
      }
    }
    return { width: width*TILE, height: height*TILE, tiles, coins, monsters, items, door, playerSpawn };
  }

  function spawnMonster(x,y){
    return {
      x, y, w:22, h:26, vx: (Math.random()<.5?-1:1)*1.1, vy:0, onGround:false, dir:1, alive:true, patrolLeft:x-80, patrolRight:x+80, hitCooldown:0
    };
  }

  // --------------------------------------------------
  // Simple physics + collisions
  function rectsOverlap(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }
  function tileRect(x,y){ return {x,y,w:TILE,h:TILE}; }

  // World state
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

  // Input state
  const keys = new Set();
  const input = { ax: 0, ay: 0, jump:false, crouch:false, pick:false, swing:false };

  // Keyboard
  addEventListener('keydown', (e)=>{
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
    keys.add(e.key.toLowerCase());
  });
  addEventListener('keyup', (e)=> keys.delete(e.key.toLowerCase()));

  // Buttons
  function holdButton(btn, flag){
    let active = false;
    const set = (v)=>{ active=v; input[flag]=v; };
    const down = (e)=>{ e.preventDefault(); set(true); };
    const up = (e)=>{ e.preventDefault(); set(false); };

    btn.addEventListener('touchstart', down, {passive:false});
    btn.addEventListener('touchend', up, {passive:false});
    btn.addEventListener('touchcancel', up, {passive:false});
    btn.addEventListener('mousedown', down);
    addEventListener('mouseup', up);
  }
  holdButton(btnJump,'jump');
  holdButton(btnCrouch,'crouch');
  holdButton(btnPick,'pick');
  holdButton(btnSwing,'swing');

  // Analog stick
  (function initStick(){
    let tracking = false;
    let center = { x:0, y:0 };
    let maxR = stick.clientWidth/2 - 8;

    function setKnob(dx,dy){
      const r = Math.hypot(dx,dy);
      const clamped = Math.min(r, maxR);
      const ang = Math.atan2(dy,dx) || 0;
      const kx = Math.cos(ang)*clamped;
      const ky = Math.sin(ang)*clamped;
      stickKnob.style.transform = `translate(${kx}px, ${ky}px)`;
      // Normalize to [-1,1]
      input.ax = (kx / maxR);
      input.ay = (ky / maxR);
    }
    function resetKnob(){
      stickKnob.style.transform = `translate(0px,0px)`;
      input.ax = 0; input.ay = 0;
    }
    function pointer(e, down){
      if (down){
        tracking = true;
        const rect = stickBase.getBoundingClientRect();
        center.x = rect.left + rect.width/2;
        center.y = rect.top + rect.height/2;
      }
      if (!tracking) return;
      const t = (e.touches ? e.touches[0] : e);
      const dx = t.clientX - center.x;
      const dy = t.clientY - center.y;
      setKnob(dx, dy);
    }
    function end(){
      tracking = false;
      resetKnob();
    }
    stickBase.addEventListener('touchstart', e=>{ e.preventDefault(); pointer(e,true); }, {passive:false});
    stickBase.addEventListener('touchmove', e=>{ e.preventDefault(); pointer(e,false); }, {passive:false});
    stickBase.addEventListener('touchend', e=>{ e.preventDefault(); end(); }, {passive:false});
    stickBase.addEventListener('touchcancel', e=>{ e.preventDefault(); end(); }, {passive:false});
    stickBase.addEventListener('mousedown', e=>pointer(e,true));
    addEventListener('mousemove', e=>pointer(e,false));
    addEventListener('mouseup', end);
    addEventListener('resize', ()=>{ maxR = stick.clientWidth/2 - 8; });
  })();

  // --------------------------------------------------
  // Update loop
  let last = 0;
  requestAnimationFrame(loop);
  function loop(t){
    const dt = Math.min(32, t-last); // cap
    last = t;

    readKeyboard();
    update(dt/16);
    draw();

    requestAnimationFrame(loop);
  }

  function readKeyboard(){
    const left = keys.has('a') || keys.has('arrowleft');
    const right = keys.has('d') || keys.has('arrowright');
    const up = keys.has('w') || keys.has('arrowup') || keys.has(' ');
    const down = keys.has('s') || keys.has('arrowdown');

    // Horizontal blend keyboard with stick (take whichever magnitude is larger)
    const kbAx = (left?-1:0) + (right?1:0);
    if (Math.abs(kbAx) > Math.abs(input.ax)) input.ax = kbAx;

    input.jump = input.jump || up;
    input.crouch = input.crouch || down;
    input.pick = input.pick || keys.has('e');
    input.swing = input.swing || keys.has('f');
  }

  function update(mult){
    // Player physics
    const want = input.ax;
    const accel = player.onGround ? 0.6 : AIR_ACCEL;
    player.vx += (want*MOVE_SPEED - player.vx) * accel * mult;

    // Facing and crouch
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

    // Apply motion with collisions
    moveWithCollisions(player, world.tiles);

    // Coins
    for (const coin of world.coins){
      if (!coin.collected && rectsOverlap(player, {x:coin.x+4,y:coin.y+4,w:24,h:24})){
        coin.collected = true;
        player.coins++;
        updateHUD();
      }
    }

    // Items pick/drop
    if (input.pick){
      if (player.holding){
        // drop
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
      player.swingTimer = 10; // frames
    }
    if (player.swingTimer>0) player.swingTimer--;

    // Carry item follows player
    if (player.holding){
      player.holding.x = player.x + (player.facing>0 ? player.w+2 : -18);
      player.holding.y = player.y + (player.crouch? player.h-16 : 6);
    }

    // Monsters
    for (const m of world.monsters){
      if (!m.alive) continue;
      m.vy = Math.min(MAX_FALL_SPEED, m.vy + GRAVITY*mult);
      // simple patrol
      if (m.x < m.patrolLeft) m.vx = Math.abs(m.vx);
      if (m.x > m.patrolRight) m.vx = -Math.abs(m.vx);
      m.dir = m.vx>=0 ? 1 : -1;
      moveWithCollisions(m, world.tiles);

      // Monster vs player
      if (rectsOverlap(player, m)){
        // If player falling onto monster -> bonk it
        if (player.vy > 2){
          m.alive = false;
          player.vy = -8;
        } else if (m.hitCooldown<=0){
          player.hearts = Math.max(0, player.hearts-1);
          m.hitCooldown = 40;
          if (player.hearts<=0) respawn();
          updateHUD();
        }
      }
      if (m.hitCooldown>0) m.hitCooldown--;
    }

    // Swing hitbox
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

    // Spikes damage
    for (const t of world.tiles){
      if (t.type==='^'){
        if (rectsOverlap(player, {x:t.x,y:t.y,w:TILE,h:TILE})){
          player.hearts = Math.max(0, player.hearts-1);
          if (player.hearts<=0) respawn();
          updateHUD();
        }
      }
    }

    // Door: next level if enough coins (or just touch)
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

    // Clear one-shot inputs
    input.pick = false;
    input.swing = false;
    input.jump = false;
  }

  function moveWithCollisions(ent, tiles){
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
  function collidingTiles(r, tiles){
    const hits = [];
    for (const t of tiles){
      if (t.type==='#' && rectsOverlap(r, tileRect(t.x,t.y))){
        hits.push(t);
      }
    }
    return hits;
  }

  // --------------------------------------------------
  // Draw
  function draw(){
    // Clear
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Transform to camera space
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(-camera.x, -camera.y);

    // Sky parallax
    drawParallax();

    // Tiles
    for (const t of world.tiles){
      if (t.type==='#' || t.type==='=') SPR.block(t.x, t.y, t.type);
      if (t.type==='^') SPR.spike(t.x, t.y+16);
    }

    // Door
    SPR.door(world.door.x, world.door.y);

    // Coins
    for (const c of world.coins){
      if (!c.collected) SPR.coin(c.x, c.y);
    }

    // Items
    for (const it of world.items){
      if (!it.held) SPR.item(it.x, it.y);
    }

    // Monsters
    for (const m of world.monsters){
      if (m.alive) SPR.goober(m.x, m.y, m.w, m.h);
    }

    // Player + sword
    if (player.swingTimer>0){
      const sx = player.facing>0 ? player.x+player.w : player.x-18;
      const sy = player.y + (player.crouch? player.h-14 : 4);
      ctx.fillStyle = '#ffd86b';
      ctx.fillRect(sx, sy, 18, 3);
    }
    SPR.player(player.x, player.y, player.w, player.h, player.facing<0, player.crouch, !!player.holding);

    ctx.restore();
  }

  function drawParallax(){
    // distant blobs for vibes
    const w = canvas.width/scale, h = canvas.height/scale;
    const x = camera.x*0.5;
    ctx.fillStyle = '#0b1220';
    for (let i=0;i<6;i++){
      const bx = (i*280 - (x%280));
      ctx.fillRect(bx, 40, 180, 24);
      ctx.fillRect(bx+120, 90, 140, 18);
    }
  }

  // --------------------------------------------------
  // Level flow
  function updateHUD(){
    levelNameEl.textContent = `Level ${levelIndex+1}–${levelIndex===0?'Fungal Fields':'Night Spores'}`;
    heartsEl.textContent = '❤'.repeat(player.hearts) + '♡'.repeat(Math.max(0,3-player.hearts));
    coinsEl.textContent = `🪙${player.coins}`;
    heldItemEl.textContent = player.holding ? '🪓 held' : '—';
  }
  function nextLevel(){
    levelIndex = (levelIndex+1) % LEVELS.length;
    world = parseLevel(levelIndex);
    player.x = world.playerSpawn.x;
    player.y = world.playerSpawn.y;
    player.vx = player.vy = 0;
    player.holding = null;
    player.coins = 0;
    updateHUD();
  }
  function respawn(){
    player.hearts = 3;
    player.x = world.playerSpawn.x;
    player.y = world.playerSpawn.y;
    player.vx = player.vy = 0;
    player.holding = null;
    updateHUD();
  }
  updateHUD();

  // --------------------------------------------------
  // Helpers
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
})();