'use strict';
(function(){
  // ====== Tiny DOM helpers ======
  const $ = sel => document.querySelector(sel);

  // ====== Audio (original, WebAudio) ======
  const AudioKit = (()=>{ 
    let ctx,gain,timer,isOn=false; 
    const melody=[0,7,4,9,7,12,9,7,4]; 
    const note=f=>220*Math.pow(2,f/12);
    function tick(i){ 
      if(!isOn) return; 
      const t=ctx.currentTime; 
      const o=ctx.createOscillator(); 
      const g=ctx.createGain(); 
      o.type='triangle'; 
      o.frequency.value=note(melody[i%melody.length]); 
      g.gain.value=0.0001; 
      g.gain.linearRampToValueAtTime(0.06,t+0.01); 
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.35); 
      o.connect(g).connect(gain); 
      o.start(t); 
      o.stop(t+0.4); 
      timer=setTimeout(()=>tick(i+1), Number($('#speed').value)); 
    }
    return { 
      toggle(){ 
        if(!ctx){ 
          ctx=new (window.AudioContext||window.webkitAudioContext)(); 
          gain=ctx.createGain(); 
          gain.gain.value=0.4; 
          gain.connect(ctx.destination);
        } 
        isOn=!isOn; 
        if(isOn) tick(0); else clearTimeout(timer); 
        return isOn; 
      }, 
      stop(){ isOn=false; clearTimeout(timer);} 
    }
  })();

  // ====== Game Data ======
  const COLORS=['blue','orange','green','purple'];
  const SCORE={draw2:20, reverse:20, skip:20, wild:50, wild4:50, circle:50};
  const logEl=$('#log');
  const toast=(m)=>{ const t=$('#toast'); t.textContent=m; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1200); }
  const log=(m)=>{ logEl.innerHTML='<div>'+m+'</div>'+logEl.innerHTML; }
  const rpick=a=>a[Math.floor(Math.random()*a.length)];
  const uid=()=>Math.random().toString(36).slice(2,9);
  const mod=(n,m)=>(n % m + m) % m;

  function card(color,value){ return {id:uid(), color, value} }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a }
  function buildDeck(){
    const d=[];
    for(const c of COLORS){
      d.push(card(c,'0'));
      for(let v=1; v<=9; v++){ d.push(card(c,String(v)), card(c,String(v))); }
      for(const a of ['skip','reverse','draw2']) d.push(card(c,a), card(c,a));
    }
    for(let i=0;i<4;i++){ d.push(card(null,'wild'), card(null,'wild4'), card(null,'circle')); }
    return shuffle(d);
  }

  const state={ players:[], turn:0, dir:1, drawPile:[], discard:[], scores:new Map(), target:500, botspeed:600 };

  // ====== Render helpers ======
  function cardGradient(color){
    const c=color||'wild';
    const map={
      blue:'var(--blue)', orange:'var(--orange)', green:'var(--green)', purple:'var(--purple)',
      wild:'linear-gradient(145deg, var(--orange), var(--blue), var(--green), var(--purple))'
    };
    const v=map[c];
    return c==='wild'? v : `linear-gradient(145deg, ${v}, #111)`;
  }
  function renderCardFace(c){
    const face=document.createElement('div'); face.className='face';
    const ring=document.createElement('div'); ring.className='ring'; face.appendChild(ring);
    const badge=document.createElement('div'); badge.className='badge'; badge.textContent=(c.color||'WILD').toUpperCase(); face.appendChild(badge);
    const n=document.createElement('div'); n.className='n'; n.textContent=(c.value==='draw2'?'+2': c.value==='wild4'?'+4': c.value==='circle'?'CIRCLE': c.value.toUpperCase()); face.appendChild(n);
    face.style.background=cardGradient(c.color);
    const sym=document.createElement('div'); sym.className='sym';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('viewBox','0 0 100 100');
    const use=document.createElementNS('http://www.w3.org/2000/svg','use');
    const map={skip:'#ico-skip', reverse:'#ico-rev', draw2:'#ico-draw2', wild:'#ico-wild', wild4:'#ico-wild4', circle:'#ico-circle'};
    use.setAttribute('href', map[c.value]||'#ico-num'); svg.appendChild(use); sym.appendChild(svg); face.appendChild(sym);
    return face;
  }
  function cardBack(){ const b=document.createElement('div'); b.className='face back'; const s=document.createElement('span'); s.textContent='UNO'; b.appendChild(s); return b; }
  function renderBotBack(){ 
    const wrap=document.createElement('div'); wrap.className='card'; 
    const inner=document.createElement('div'); inner.className='inner'; wrap.appendChild(inner); 
    const back=cardBack(); back.classList.add('back'); inner.appendChild(back); 
    inner.style.transform='rotateY(180deg)'; 
    return wrap; 
  }
  function renderCard(owner,c){
    const wrap=document.createElement('div'); wrap.className='card';
    const inner=document.createElement('div'); inner.className='inner'; wrap.appendChild(inner);
    const face=renderCardFace(c); face.classList.add('face');
    const back=cardBack(); back.classList.add('back');
    inner.appendChild(face); inner.appendChild(back);
    if(owner.human){ 
      wrap.addEventListener('click',()=> onPlayAttempt(owner,c,wrap)); 
    } else {
      // hide bot cards: show back only
      inner.style.transform='rotateY(180deg)';
    }
    return wrap;
  }
  function drawPileEl(){
    const el=$('#drawPile'); el.innerHTML='';
    const back=cardBack(); back.style.transform='translateY(-2px)'; el.appendChild(back);
    const count=document.createElement('div'); count.textContent= state.drawPile.length+' cards';
    count.style.opacity='.7'; count.style.fontSize='.8rem'; count.style.marginTop='6px';
    el.appendChild(count);
  }
  function discardPileEl(){
    const el=$('#discardPile'); el.innerHTML='';
    const top=state.discard[state.discard.length-1]; if(!top) return;
    el.appendChild(renderCardFace(top));
    const label=document.createElement('div'); label.style.opacity='.7'; label.style.fontSize='.8rem'; label.style.marginTop='6px'; label.textContent=cardLabel(top);
    el.appendChild(label);
  }
  function render(){
    const top=$('#topRow'), bottom=$('#bottomRow'); top.innerHTML=''; bottom.innerHTML='';
    for(let i=0;i<state.players.length;i++){
      const p=state.players[i];
      const zone=p.human? bottom: top;
      const row=document.createElement('div'); row.className='hand';
      const label=document.createElement('div'); label.style.width='100%'; label.style.textAlign='center'; label.style.margin='4px 0 6px'; label.style.opacity='.8';
      const count = (!p.human? ` (${p.hand.length} cards)` : '');
      label.textContent = p.name + (i===state.turn?' • Turn':'') + (p.human?' (You)':'') + (p.persona? ' — '+p.persona.name:'') + count;
      zone.appendChild(label); zone.appendChild(row);
      if(p.human){
        p.hand.forEach(c=> row.appendChild(renderCard(p,c)));
      } else {
        // bots: only backs
        for(let k=0;k<p.hand.length;k++){ row.appendChild(renderBotBack()); }
      }
    }
    drawPileEl(); discardPileEl();
  }

  // ====== Rules & Flow ======
  const canPlay=(top,c)=> c.value==='wild'||c.value==='wild4'||c.value==='circle'||c.color===top.color||c.value===top.value;
  const cardLabel=c=> (['wild','wild4','circle'].includes(c.value)? c.value.toUpperCase() : `${c.color} ${c.value}`);

  function chooseColor(p){
    const counts={blue:0,orange:0,green:0,purple:0};
    for(const k of p.hand){ if(k.color && counts[k.color]>=0) counts[k.color]++; }
    let best='blue', n=-1; for(const col of COLORS){ if(counts[col]>n){ best=col; n=counts[col]; } }
    return n<=0? rpick(COLORS): best;
  }
  function drawCards(player,n){ 
    for(let i=0;i<n;i++){ 
      if(state.drawPile.length===0) reshuffle(); 
      player.hand.push(state.drawPile.pop()); 
    } 
  }
  function reshuffle(){ 
    const last=state.discard.pop(); 
    state.drawPile=shuffle(state.discard); 
    state.discard=[last]; 
    log('Draw pile empty. Reshuffling.'); 
  }

  function onPlayAttempt(player,c,wrap){
    if(state.players[state.turn]!==player) return toast('Not your turn');
    const top=state.discard[state.discard.length-1];
    if(!canPlay(top,c)) return toast("Can't play that");
    playCard(player,c,wrap);
  }

  function playCard(player,c,wrap){
    const idx=player.hand.findIndex(k=>k.id===c.id); 
    if(idx>-1) player.hand.splice(idx,1);
    if(wrap){ 
      // flip animation
      wrap.classList.add('playing'); 
      setTimeout(()=>{ state.discard.push(c); afterPlay(player,c); render(); },400);
    } else { 
      state.discard.push(c); afterPlay(player,c); render(); 
    }
  }

  function promptColor(player){
    const guess=chooseColor(player);
    const ans=prompt('Pick a color: blue, orange, green, purple', guess);
    const pick=(ans||'').toLowerCase();
    return COLORS.includes(pick)? pick : guess;
  }

  function passOneLeft(){
    const taken=state.players.map(p=> p.hand.length? p.hand.splice(Math.floor(Math.random()*p.hand.length),1)[0]: null);
    for(let i=0;i<state.players.length;i++){
      const giveTo=state.players[mod(i+1,state.players.length)];
      if(taken[i]) giveTo.hand.push(taken[i]);
    }
  }

  function afterPlay(player,c){
    log((player.human?'You':player.name)+' played '+cardLabel(c));
    if(player.hand.length===1){ toast('UNO!'); }

    if(c.value==='reverse'){ state.dir*=-1; }
    else if(c.value==='skip'){ state.turn=mod(state.turn+state.dir, state.players.length); }
    else if(c.value==='draw2'){ const i=mod(state.turn+state.dir, state.players.length); drawCards(state.players[i],2); }
    else if(c.value==='wild'){ const color= player.human? promptColor(player): personaPickColor(player); c.color=color; }
    else if(c.value==='wild4'){ const color= player.human? promptColor(player): personaPickColor(player); c.color=color; const i=mod(state.turn+state.dir, state.players.length); drawCards(state.players[i],4); }
    else if(c.value==='circle'){ passOneLeft(); const color= player.human? promptColor(player): personaPickColor(player); c.color=color; log('Circle of Life: everyone passed one left.'); }

    if(player.hand.length===0){ endRound(player); return; }

    state.turn=mod(state.turn+state.dir, state.players.length);
    nextTurnIfNeeded();
  }

  function nextTurnIfNeeded(){
    render();
    const cur=state.players[state.turn];
    if(!cur.human){ setTimeout(()=> botAct(cur), state.botspeed); }
  }

  // ====== Personas ======
  const Personas={
    Classic:{ 
      name:'Classic', describe:'Balanced: number > action > color > wild',
      decide(top,hand){ 
        const playable=hand.filter(c=>canPlay(top,c)); if(!playable.length) return null;
        const byNum=playable.find(c=>c.value===top.value&&c.color);
        const action=playable.find(c=>['reverse','skip','draw2'].includes(c.value));
        const byCol=playable.find(c=>c.color===top.color&&c.color);
        return byNum||action||byCol||playable[0]; 
      }, 
      pickColor(hand){ return commonColor(hand); }
    },
    Aggro:{ 
      name:'Aggro', describe:'Loves action—burns skip/reverse/+2 early',
      decide(top,hand){ 
        const p=hand.filter(c=>canPlay(top,c)); if(!p.length) return null;
        const action=p.find(c=>['draw2','skip','reverse'].includes(c.value));
        return action || p.find(c=>c.value===top.value&&c.color) || p.find(c=>c.color===top.color&&c.color) || p[0];
      }, 
      pickColor(hand){ return commonColor(hand); }
    },
    Saver:{ 
      name:'Saver', describe:'Saves wilds/+4 until stuck',
      decide(top,hand){ 
        const p=hand.filter(c=>canPlay(top,c)); if(!p.length) return null;
        const nonWild=p.filter(c=>!['wild','wild4'].includes(c.value));
        return nonWild[0] || p[0];
      }, 
      pickColor(hand){ return commonColor(hand); }
    },
    ColorLoyal:{ 
      name:'Color Loyal', describe:'Keeps same color if possible',
      decide(top,hand){ 
        const p=hand.filter(c=>canPlay(top,c)); if(!p.length) return null;
        const byCol=p.find(c=>c.color===top.color&&c.color);
        return byCol || p.find(c=>c.value===top.value&&c.color) || p[0];
      }, 
      pickColor(hand){ return commonColor(hand); }
    },
    TopDeck:{ 
      name:'Top Deck', describe:'Prefers numbers; draws if only wilds/action',
      decide(top,hand){ 
        const p=hand.filter(c=>canPlay(top,c)); if(!p.length) return null;
        const num=p.find(c=>/^[0-9]+$/.test(c.value));
        return num||null;
      }, 
      pickColor(hand){ return commonColor(hand); }
    },
    Hyena:{ 
      name:'Hyena', describe:'Chaotic gremlin: sometimes random',
      decide(top,hand){ 
        const p=hand.filter(c=>canPlay(top,c)); if(!p.length) return null;
        if(Math.random()<0.35) return rpick(p);
        const action=p.find(c=>['draw2','reverse'].includes(c.value));
        return action || p[0];
      }, 
      pickColor(){ return rpick(COLORS); }
    },
  };
  function commonColor(hand){ 
    const counts={blue:0,orange:0,green:0,purple:0}; 
    for(const k of hand){ if(k.color) counts[k.color]++; } 
    const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]); 
    return (sorted[0]&&sorted[0][0]) || rpick(COLORS); 
  }
  function personaPickColor(p){ return (p.persona?.pickColor(p.hand)) || chooseColor(p); }

  function botAct(bot){
    const top=state.discard[state.discard.length-1];
    const hand=bot.hand;
    let pick=null;
    if(bot.persona && bot.persona.decide){ pick = bot.persona.decide(top, hand); }
    if(!pick){
      const playable=hand.filter(c=>canPlay(top,c));
      if(playable.length){
        const byNum=playable.find(c=> c.value===top.value && c.color);
        const byCol=playable.find(c=> c.color===top.color && c.color);
        const action=playable.find(c=> ['reverse','skip','draw2'].includes(c.value));
        pick=byNum||action||byCol||playable[0];
      }
    }
    if(pick){ playCard(bot,pick); return; }
    drawCards(bot,1); log(bot.name+' draws');
    const c=bot.hand[bot.hand.length-1];
    if(canPlay(top,c)) playCard(bot,c); else { state.turn=mod(state.turn+state.dir,state.players.length); nextTurnIfNeeded(); }
  }

  // ====== Round / Game ======
  function setupGame(humans=1,bots=3, personas=[]){
    state.players=[];
    for(let i=0;i<humans;i++) state.players.push({name:'You', human:true, hand:[]});
    for(let b=0;b<bots;b++){
      state.players.push({name:`Bot ${b+1}`, human:false, hand:[], persona: personas[b]||Personas.Classic});
    }
    state.scores=new Map(state.players.map(p=>[p.name,0]));
    state.target=Number($('#targetPoints').value||500);
    state.botspeed=Number($('#speed').value||600);
    startRound();
  }

  function startRound(){
    logEl.innerHTML='';
    state.drawPile=buildDeck();
    state.discard=[];
    state.dir=1; state.turn=0;
    for(const p of state.players) p.hand=[];
    for(let d=0; d<7; d++) for(const p of state.players) p.hand.push(state.drawPile.pop());

    let first=state.drawPile.pop();
    while(first.value==='wild4'){ state.drawPile.unshift(first); first=state.drawPile.pop(); }
    state.discard.push(first);
    render();
    log('Round begins. First card: '+cardLabel(first));
    applyOnFlip(first);
    nextTurnIfNeeded();
  }

  function applyOnFlip(c){
    if(c.value==='reverse'){ state.dir*=-1; log('Reverse is face-up. Direction set '+(state.dir>0?'clockwise':'counter-clockwise')); }
    if(c.value==='skip'){ state.turn=mod(state.turn+state.dir,state.players.length); log('Skip is face-up. First player skipped.'); }
    if(c.value==='draw2'){ const i=mod(state.turn+state.dir,state.players.length); drawCards(state.players[i],2); state.turn=i; log(state.players[i].name+' draws 2 (face-up Draw Two).'); state.turn=mod(i+state.dir,state.players.length); }
    if(c.value==='wild'){ const i=mod(state.turn+state.dir,state.players.length); const p=state.players[i]; const color=personaPickColor(p); c.color=color; log((p.human?'You':p.name)+' choose '+color.toUpperCase()+' to start.'); }
    if(c.value==='circle'){ const i=mod(state.turn+state.dir,state.players.length); passOneLeft(); const p=state.players[i]; const color=personaPickColor(p); c.color=color; log('Circle of Life face-up: everyone passed one left. '+(p.human?'You':'Bot')+' choose '+color.toUpperCase()+'.'); }
  }

  function endRound(winner){
    let gain=0;
    for(const p of state.players){ 
      if(p!==winner){ 
        for(const k of p.hand){ 
          if(/^[0-9]+$/.test(k.value)) gain+=Number(k.value); 
          else gain+=SCORE[k.value]||0; 
        } 
      } 
    }
    const prev=state.scores.get(winner.name)||0; 
    state.scores.set(winner.name, prev+gain); 
    log(`<b>${winner.name}</b> wins the round and gets <b>${gain}</b> points!`);
    const board=Array.from(state.scores.entries()).map(([n,s])=>`${n}: ${s}`).join(' • ');
    toast(board);
    if(state.scores.get(winner.name)>=state.target){
      alert(`${winner.name} wins the game with ${state.scores.get(winner.name)} points!`);
      startRound();
    }
  }

  // ====== Start menu / controls ======
  function buildBotPicker(){ 
    const grid=$('#botGrid'); grid.innerHTML='';
    const count=Number($('#botCount').value||3); 
    const personaKeys=Object.keys(Personas);
    for(let i=0;i<count;i++){ 
      const card=document.createElement('div'); card.className='card'; 
      const label=document.createElement('label'); label.textContent=`Bot ${i+1} Personality`;
      const select=document.createElement('select'); select.dataset.bot=i;
      for(const key of personaKeys){ 
        const opt=document.createElement('option'); 
        opt.value=key; 
        opt.textContent=`${Personas[key].name} — ${Personas[key].describe}`; 
        select.appendChild(opt); 
      }
      card.appendChild(label); card.appendChild(select); grid.appendChild(card); 
    }
  }

  $('#botCount').addEventListener('input', buildBotPicker);
  $('#startBtn').addEventListener('click',()=>{
    const bots=Math.max(1, Math.min(5, Number($('#botCount').value||3)));
    const personaSelects=[...document.querySelectorAll('#botGrid select')];
    const personas=personaSelects.map(s=> Personas[s.value]||Personas.Classic);
    $('#startOverlay').style.display='none';
    setupGame(1,bots,personas);
  });
  $('#musicBtn').addEventListener('click', (e)=>{ const on=AudioKit.toggle(); e.target.textContent='Music: '+(on?'On':'Off'); });
  $('#rulesBtn').addEventListener('click',()=>{ 
    alert('How to play (Circle of Life Edition):\n\n• Match by color or number.\n• Action: Skip, Reverse, Draw Two.\n• Wild: choose color.\n• Wild +4: choose color and next player draws 4.\n• Wild Circle of Life: everyone passes one card to the left; then choose color.\n• Shout UNO at 1 card. First to target score wins.'); 
  });
  $('#restartBtn').addEventListener('click',()=>{ if(confirm('Restart game?')) location.reload(); });
  $('#newRoundBtn').addEventListener('click',()=>{ if(confirm('Start a new round?')) startRound(); });
  $('#drawPile').addEventListener('click',()=>{ 
    const cur=state.players[state.turn]; 
    if(!cur||!cur.human) return; 
    drawCards(cur,1); log('You draw 1.'); 
    const top=state.discard[state.discard.length-1]; 
    const c=cur.hand[cur.hand.length-1]; 
    if(!canPlay(top,c)) { state.turn=mod(state.turn+state.dir,state.players.length);} 
    nextTurnIfNeeded(); 
  });

  // boot
  buildBotPicker();
})();