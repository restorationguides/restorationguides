(() => {
  // ---- Utilities ----
  const COLORS = ['red','yellow','green','blue'];
  const ACTIONS = ['skip','reverse','draw2'];
  const WILDS = ['wild','wild4','circle']; // added circle

  const qs = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));
  const el = id => document.getElementById(id);

  const wait = ms => new Promise(res => setTimeout(res, ms));
  const rand = (min, max) => Math.floor(Math.random()*(max-min+1))+min;

  function shuffle(a){
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()* (i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  function toast(msg, duration=1500){
    const t = el('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(()=> t.classList.remove('show'), duration);
  }

  // ---- Game State ----
  const state = {
    players: [],
    current: 0,
    direction: 1,
    deck: [],
    discard: [],
    activeColor: null,
    pendingDraw: 0,
    pendingSkip: false,

    turnCount: 0,
    round: 1,

    // Human turn helpers
    hasDrawnThisTurn: false,
    humanCanPass: false,
    lock: false,

    pendingWild: null, // { playerIndex, cardId, type }
  };

  // ---- Setup ----
  function createDeck(){
    const deck = [];
    let id = 1;
    for(const color of COLORS){
      deck.push({ id: id++, color, value: '0' });
      for(let n=1; n<=9; n++){
        deck.push({ id: id++, color, value: String(n) });
        deck.push({ id: id++, color, value: String(n) });
      }
      for(const act of ACTIONS){
        deck.push({ id: id++, color, value: act });
        deck.push({ id: id++, color, value: act });
      }
    }
    for(let i=0;i<4;i++) deck.push({ id: id++, color: 'wild', value: 'wild' });
    for(let i=0;i<4;i++) deck.push({ id: id++, color: 'wild', value: 'wild4' });
    // NEW: Wild Circle of Life ×4
    for(let i=0;i<4;i++) deck.push({ id: id++, color: 'wild', value: 'circle' });
    return shuffle(deck);
  }

  function newPlayers(){
    return [
      { id:0, name:'You', isHuman:true, hand:[], unoDeclared:false },
      { id:1, name:'Bot Luna', isHuman:false, hand:[], unoDeclared:false },
      { id:2, name:'Bot Kato', isHuman:false, hand:[], unoDeclared:false },
      { id:3, name:'Bot Zed', isHuman:false, hand:[], unoDeclared:false },
    ];
  }

  function deal(){
    state.deck = createDeck();
    state.discard = [];
    state.players = newPlayers();
    state.direction = 1;
    state.pendingDraw = 0;
    state.pendingSkip = false;
    state.turnCount = 0;
    state.hasDrawnThisTurn = false;
    state.humanCanPass = false;
    state.lock = false;
    state.pendingWild = null;

    // Deal 7 each
    for(let r=0;r<7;r++){
      for(const p of state.players){
        p.hand.push(state.deck.pop());
      }
    }

    // Flip a starting discard (avoid wild4 as first)
    let first = state.deck.pop();
    while(first.value === 'wild4'){
      state.deck.unshift(first);
      shuffle(state.deck);
      first = state.deck.pop();
    }
    state.discard.push(first);
    state.activeColor = (first.color === 'wild') ? COLORS[rand(0,3)] : first.color;

    // We'll start with a random player
    state.current = rand(0, state.players.length - 1);

    // Handle first-card effects
    if(first.value === 'reverse'){
      if(state.players.length === 2){
        state.pendingSkip = true;
      } else {
        state.direction *= -1;
      }
    } else if(first.value === 'skip'){
      state.pendingSkip = true;
    } else if(first.value === 'draw2'){
      state.pendingDraw = 2;
      state.pendingSkip = true;
    } else if(first.value === 'wild'){
      state.activeColor = COLORS[rand(0,3)];
    } else if(first.value === 'circle'){ // NEW
      passOneLeft();
      state.activeColor = COLORS[rand(0,3)];
    }
  }

  // ---- Rendering ----
  function cardLabel(value){
    switch(value){
      case 'skip': return '🚫';
      case 'reverse': return '⟲';
      case 'draw2': return '+2';
      case 'wild': return 'WILD';
      case 'wild4': return '+4';
      case 'circle': return 'CIRCLE'; // NEW
      default: return value;
    }
  }

  function cardHTML(card, { small=false, playable=false, faceDown=false } = {}){
    if(faceDown){
      return `<div class="card small" style="background: repeating-linear-gradient(135deg,#23374d 0 9px,#2c3e50 9px 18px);border:3px solid rgba(0,0,0,.35);"></div>`;
    }
    const isWild = (card.color === 'wild');
    const cls = ['card', small ? 'small' : '', isWild ? 'wild' : card.color, playable ? 'playable' : ''].filter(Boolean).join(' ');
    const label = cardLabel(card.value);
    const corners = (card.value === 'wild' || card.value === 'wild4' || card.value === 'circle') ? '' : `
      <div class="corner tl">${label}</div>
      <div class="corner br">${label}</div>`;
    const pips = isWild ? `
      <div class="pips">
        <span class="pip red"></span>
        <span class="pip yellow"></span>
        <span class="pip green"></span>
        <span class="pip blue"></span>
      </div>` : '';
    return `
      <div class="${cls}" data-id="${card.id}" data-color="${card.color}" data-value="${card.value}">
        ${corners}
        <div class="center">${label}</div>
        ${pips}
      </div>
    `;
  }

  function renderOpponents(){
    const wrap = el('opponents');
    wrap.innerHTML = state.players.slice(1).map((p, idx) => {
      const isTurn = state.current === p.id;
      const uno = p.hand.length === 1;
      return `
        <div class="opponent ${isTurn ? 'turn' : ''}">
          <div class="name">${p.name}</div>
          <div class="row">
            <span class="badge"><span class="mini-back"></span> ${p.hand.length} cards</span>
            <span class="badge">ID ${p.id}</span>
          </div>
          ${uno ? `<div class="uno-flag">UNO!</div>` : ''}
          <div class="turn-indicator"></div>
        </div>
      `;
    }).join('');
  }

  function renderPiles(){
    el('deck-count').textContent = state.deck.length;
    const top = state.discard[state.discard.length - 1];
    el('discard-pile').innerHTML = cardHTML(top, { small:false });
    // current color dot
    const dot = el('color-dot');
    dot.className = `dot ${state.activeColor || ''}`;
    // direction
    el('dir-ind').textContent = state.direction === 1 ? '↻ clockwise' : '↺ counter-clockwise';
    // deck interactivity
    const deckEl = el('draw-pile').querySelector('.deck');
    deckEl.setAttribute('aria-disabled', String(!(getCurrent().isHuman)));
  }

  function renderHand(){
    const you = state.players[0];
    const wrap = el('hand');
    const playableIds = you.hand.filter(c => isPlayable(c)).map(c => c.id);
    wrap.innerHTML = you.hand.map(c => cardHTML(c, { playable: playableIds.includes(c.id) })).join('');
    el('hand-count').textContent = `${you.hand.length} card${you.hand.length===1?'':'s'}`;

    // Controls
    el('btn-uno').disabled = !(state.current === 0 && you.hand.length === 2);
    el('btn-pass').disabled = !(state.current === 0 && state.hasDrawnThisTurn);
    el('btn-draw').disabled = !(state.current === 0);
  }

  function renderStatus(msg){
    el('status').textContent = msg;
  }

  function renderAll(){
    el('round-label').textContent = `Round ${state.round}`;
    renderOpponents();
    renderPiles();
    renderHand();
  }

  // ---- Rules ----
  function getCurrent(){ return state.players[state.current]; }
  function nextIndex(idx = state.current){
    const n = state.players.length;
    return (idx + state.direction + n) % n;
  }

  function isPlayable(card){
    const top = state.discard[state.discard.length - 1];
    const activeColor = state.activeColor;
    if(card.color === 'wild') return true; // wild, wild4, circle
    return card.color === activeColor || card.value === top.value;
  }

  function drawCard(player, count=1){
    const drawn = [];
    for(let i=0;i<count;i++){
      if(state.deck.length === 0) reshuffle();
      const card = state.deck.pop();
      if(!card){ break; } // extremely rare, but guard
      player.hand.push(card);
      drawn.push(card);
    }
    return drawn;
  }

  function reshuffle(){
    const top = state.discard.pop();
    let pool = state.discard.splice(0);
    shuffle(pool);
    state.deck = pool;
    state.discard.push(top);
  }

  async function beginTurn(){
    const player = getCurrent();
    state.turnCount++;
    state.hasDrawnThisTurn = false;
    state.humanCanPass = false;
    state.lock = false;
    state.pendingWild = null;

    renderAll();

    // Start-of-turn penalties
    if(state.pendingDraw > 0){
      renderStatus(`${player.name} must draw ${state.pendingDraw} and is skipped`);
      await wait(600);
      drawCard(player, state.pendingDraw);
      state.pendingDraw = 0;
      state.pendingSkip = false;
      renderAll();
      await wait(400);
      return endTurn(); // skip turn
    }
    if(state.pendingSkip){
      renderStatus(`${player.name} is skipped`);
      state.pendingSkip = false;
      await wait(600);
      return endTurn();
    }

    if(player.isHuman){
      renderStatus(`Your turn${hasPlayable(player) ? ' — play a card' : ' — draw a card'}`);
      if(!hasPlayable(player)) toast('No playable card. Draw one.');
    } else {
      renderStatus(`${player.name}'s turn`);
      await wait(650);
      await aiTakeTurn(player);
    }
  }

  function hasPlayable(player){
    return player.hand.some(c => isPlayable(c));
  }

  function removeFromHand(player, cardId){
    const idx = player.hand.findIndex(c => c.id === cardId);
    if(idx >= 0) return player.hand.splice(idx,1)[0];
    return null;
  }

  // NEW: Circle of Life helper
  function passOneLeft(){
    // Everyone passes ONE random card to the player on their left (turn order independent of direction per rule variant).
    const taken = state.players.map(p => {
      if(p.hand.length === 0) return null;
      const idx = Math.floor(Math.random() * p.hand.length);
      return p.hand.splice(idx, 1)[0];
    });
    for(let i=0;i<state.players.length;i++){
      const giveTo = state.players[(i + 1) % state.players.length];
      if(taken[i]) giveTo.hand.push(taken[i]);
    }
  }

  async function playCard(player, card, chosenColor=null){
    // Validate & set color
    if(card.color === 'wild'){
      if(!chosenColor) {
        // Must be provided (modal/AI path)
        return false;
      }
      state.activeColor = chosenColor;
    } else {
      state.activeColor = card.color;
    }

    state.discard.push(card);

    // Effects
    if(card.value === 'reverse'){
      if(state.players.length === 2){
        state.pendingSkip = true;
      } else {
        state.direction *= -1;
      }
    } else if(card.value === 'skip'){
      state.pendingSkip = true;
    } else if(card.value === 'draw2'){
      state.pendingDraw += 2;
      state.pendingSkip = true;
    } else if(card.value === 'wild4'){
      state.pendingDraw += 4;
      state.pendingSkip = true;
    } else if(card.value === 'circle'){ // NEW: Lion King rule
      passOneLeft();
      renderAll();
      toast('Circle of Life! Everyone passed one card left.', 1400);
      await wait(300);
    }

    renderAll();
    await wait(200);

    // UNO check (penalty if human didn't press UNO when going to 1 card)
    if(player.hand.length === 1){
      if(player.isHuman){
        if(!player.unoDeclared){
          toast('You forgot to press UNO! +2 penalty', 1600);
          await wait(300);
          drawCard(player, 2);
          renderAll();
          await wait(200);
        }
      } else {
        player.unoDeclared = true;
      }
    }

    // Win check
    if(player.hand.length === 0){
      return endGame(player);
    }

    // Reset UNO toggle after playing
    player.unoDeclared = false;

    await wait(300);
    endTurn();
    return true;
  }

  function endTurn(){
    state.current = nextIndex();
    beginTurn();
  }

  // ---- Human Interactions ----
  function onCardClick(e){
    if(state.lock) return;
    const cardEl = e.target.closest('.card');
    if(!cardEl) return;
    if(state.current !== 0) return; // not your turn
    const you = state.players[0];
    const cardId = Number(cardEl.dataset.id);
    const card = you.hand.find(c => c.id === cardId);
    if(!card) return;

    if(!isPlayable(card)){
      toast('That card cannot be played.');
      return;
    }

    // Wild / Circle / +4 → choose color
    if(card.color === 'wild'){
      state.pendingWild = { playerIndex: 0, cardId: card.id };
      openColorModal(async (colorChosen) => {
        if(colorChosen){
          const real = removeFromHand(you, card.id);
          await playCard(you, real, colorChosen);
        }
        state.pendingWild = null;
      });
      return;
    }

    // Normal play
    const real = removeFromHand(you, card.id);
    playCard(you, real);
  }

  function onDeckClick(){
    if(state.lock) return;
    if(state.current !== 0) return;
    if(state.hasDrawnThisTurn){
      toast('You can draw only once per turn.');
      return;
    }
    state.hasDrawnThisTurn = true;
    const you = state.players[0];
    drawCard(you, 1);
    renderAll();
    const drawn = you.hand[you.hand.length - 1];
    if(isPlayable(drawn)){
      renderStatus('You drew a playable card: you may play or pass.');
      toast('You can play the drawn card (or any playable).', 1500);
    } else {
      renderStatus('No play after draw. You may pass.');
    }
    state.humanCanPass = true;
    el('btn-pass').disabled = false;
  }

  function onUNOClick(){
    if(state.current !== 0) return;
    const you = state.players[0];
    if(you.hand.length !== 2){
      toast('Press UNO when you have exactly 2 cards.');
      return;
    }
    you.unoDeclared = true;
    toast('UNO declared!');
    el('btn-uno').disabled = true;
  }

  function onPassClick(){
    if(state.current !== 0) return;
    if(!state.humanCanPass){
      toast('You can pass only after drawing.');
      return;
    }
    state.humanCanPass = false;
    endTurn();
  }

  // ---- AI ----
  async function aiTakeTurn(bot){
    // Pick a playable card
    let playable = bot.hand.filter(c => isPlayable(c));

    if(playable.length === 0){
      renderStatus(`${bot.name} draws a card`);
      await wait(500);
      drawCard(bot, 1);
      renderAll();
      await wait(250);
      playable = bot.hand.filter(c => isPlayable(c));
      if(playable.length === 0){
        renderStatus(`${bot.name} passes`);
        await wait(400);
        return endTurn();
      }
    }

    // Heuristic: prefer non-wilds, then draw2/skip/reverse, keep wild4 for emergencies
    playable.sort((a,b)=> {
      const score = (c)=>{
        if(c.color === 'wild' && c.value === 'wild4') return 0;
        if(c.color === 'wild' && c.value === 'circle') return 1; // a bit more aggressive than plain wild
        if(c.color === 'wild') return 2;
        if(c.value === 'draw2') return 5;
        if(c.value === 'skip') return 4;
        if(c.value === 'reverse') return 3;
        if(!isNaN(Number(c.value))) return 6;
        return 1;
      };
      return score(b) - score(a);
    });

    const card = playable[0];

    if(card.color === 'wild'){
      // Choose best color from hand composition
      const counts = { red:0, yellow:0, green:0, blue:0 };
      for(const c of bot.hand){
        if(counts[c.color] !== undefined) counts[c.color]++;
      }
      let best = 'red', bestCnt=-1;
      for(const col of COLORS){
        if(counts[col] > bestCnt){ bestCnt = counts[col]; best = col; }
      }
      removeFromHand(bot, card.id);
      const wildName = (card.value === 'wild4') ? 'Wild +4' : (card.value === 'circle' ? 'Wild Circle of Life' : 'Wild');
      renderStatus(`${bot.name} plays ${wildName} (chooses ${best})`);
      await wait(450);
      await playCard(bot, card, best);
    } else {
      removeFromHand(bot, card.id);
      renderStatus(`${bot.name} plays ${prettyCard(card)}`);
      await wait(450);
      await playCard(bot, card, null);
    }
  }

  function prettyCard(card){
    const colorName = card.color[0].toUpperCase() + card.color.slice(1);
    const label = cardLabel(card.value);
    if(card.value === 'circle') return 'Wild Circle of Life'; // NEW
    if(card.color === 'wild') return (card.value==='wild4' ? 'Wild +4' : 'Wild');
    if(['skip','reverse','draw2'].includes(card.value)) return `${colorName} ${label}`;
    return `${colorName} ${label}`;
  }

  // ---- Modals ----
  function openColorModal(onChoose){
    const modal = el('color-modal');
    modal.classList.add('show');
    const handler = (e)=>{
      const btn = e.target.closest('.color-choice');
      if(!btn) return;
      modal.classList.remove('show');
      qsa('.color-choice').forEach(b => b.removeEventListener('click', handler));
      onChoose(btn.dataset.color);
    };
    qsa('.color-choice').forEach(b => b.addEventListener('click', handler));
  }

  // ---- End Game ----
  function endGame(winner){
    const modal = el('end-modal');
    el('end-title').textContent = winner.isHuman ? 'You win! 🎉' : `${winner.name} wins!`;
    const others = state.players.filter(p => p.id !== winner.id);
    const points = others.reduce((sum,p)=> sum + handPoints(p.hand), 0);
    el('end-desc').textContent = `Round score: ${points} points`;
    modal.classList.add('show');
  }

  function handPoints(hand){
    let total = 0;
    for(const c of hand){
      if(!isNaN(Number(c.value))) total += Number(c.value);
      else if(c.value === 'draw2' || c.value === 'skip' || c.value === 'reverse') total += 20;
      else if(c.value === 'wild' || c.value === 'wild4' || c.value === 'circle') total += 50; // include circle
    }
    return total;
  }

  // ---- Events ----
  function onCardClick(e){
    if(state.lock) return;
    const cardEl = e.target.closest('.card');
    if(!cardEl) return;
    if(state.current !== 0) return; // not your turn
    const you = state.players[0];
    const cardId = Number(cardEl.dataset.id);
    const card = you.hand.find(c => c.id === cardId);
    if(!card) return;

    if(!isPlayable(card)){
      toast('That card cannot be played.');
      return;
    }

    if(card.color === 'wild'){
      state.pendingWild = { playerIndex: 0, cardId: card.id };
      openColorModal(async (colorChosen) => {
        if(colorChosen){
          const real = removeFromHand(you, card.id);
          await playCard(you, real, colorChosen);
        }
        state.pendingWild = null;
      });
      return;
    }

    const real = removeFromHand(you, card.id);
    playCard(you, real);
  }

  function onDeckClick(){
    if(state.lock) return;
    if(state.current !== 0) return;
    if(state.hasDrawnThisTurn){
      toast('You can draw only once per turn.');
      return;
    }
    state.hasDrawnThisTurn = true;
    const you = state.players[0];
    drawCard(you, 1);
    renderAll();
    const drawn = you.hand[you.hand.length - 1];
    if(isPlayable(drawn)){
      renderStatus('You drew a playable card: you may play or pass.');
      toast('You can play the drawn card (or any playable).', 1500);
    } else {
      renderStatus('No play after draw. You may pass.');
    }
    state.humanCanPass = true;
    el('btn-pass').disabled = false;
  }

  function onUNOClick(){
    if(state.current !== 0) return;
    const you = state.players[0];
    if(you.hand.length !== 2){
      toast('Press UNO when you have exactly 2 cards.');
      return;
    }
    you.unoDeclared = true;
    toast('UNO declared!');
    el('btn-uno').disabled = true;
  }

  function onPassClick(){
    if(state.current !== 0) return;
    if(!state.humanCanPass){
      toast('You can pass only after drawing.');
      return;
    }
    state.humanCanPass = false;
    endTurn();
  }

  function bindEvents(){
    el('hand').addEventListener('click', onCardClick);
    el('draw-pile').addEventListener('click', onDeckClick);
    el('btn-draw').addEventListener('click', onDeckClick);
    el('btn-pass').addEventListener('click', onPassClick);
    el('btn-uno').addEventListener('click', onUNOClick);

    el('btn-again').addEventListener('click', () => {
      el('end-modal').classList.remove('show');
      state.round++;
      initGame();
    });
    el('btn-close').addEventListener('click', () => {
      el('end-modal').classList.remove('show');
    });

    el('new-game').addEventListener('click', () => {
      state.round = 1;
      initGame();
    });

    el('hand').addEventListener('touchmove', (e)=>{}, {passive:true});
  }

  function initGame(){
    deal();
    renderAll();
    beginTurn();
  }

  // Boot
  bindEvents();
  initGame();

})();