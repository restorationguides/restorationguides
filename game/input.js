export const keys = new Set();
export const input = { ax:0, ay:0, jump:false, crouch:false, pick:false, swing:false };

export function initInput(){
  // Keyboard
  addEventListener('keydown', (e)=>{
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
    keys.add(e.key.toLowerCase());
  });
  addEventListener('keyup', (e)=> keys.delete(e.key.toLowerCase()));

  // Buttons
  const btnJump = document.getElementById('btnJump');
  const btnCrouch = document.getElementById('btnCrouch');
  const btnPick = document.getElementById('btnPick');
  const btnSwing = document.getElementById('btnSwing');

  holdButton(btnJump,'jump');
  holdButton(btnCrouch,'crouch');
  holdButton(btnPick,'pick');
  holdButton(btnSwing,'swing');

  // Analog stick
  const stick = document.getElementById('stick');
  const stickBase = document.getElementById('stick-base');
  const stickKnob = document.getElementById('stick-knob');

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
}

function holdButton(btn, flag){
  const set = (v)=>{ input[flag]=v; };
  const down = (e)=>{ e.preventDefault(); set(true); };
  const up = (e)=>{ e.preventDefault(); set(false); };

  btn.addEventListener('touchstart', down, {passive:false});
  btn.addEventListener('touchend', up, {passive:false});
  btn.addEventListener('touchcancel', up, {passive:false});
  btn.addEventListener('mousedown', down);
  addEventListener('mouseup', up);
}

export function blendKeyboard(){
  const left = keys.has('a') || keys.has('arrowleft');
  const right = keys.has('d') || keys.has('arrowright');
  const up = keys.has('w') || keys.has('arrowup') || keys.has(' ');
  const down = keys.has('s') || keys.has('arrowdown');

  const kbAx = (left?-1:0) + (right?1:0);
  if (Math.abs(kbAx) > Math.abs(input.ax)) input.ax = kbAx;

  input.jump = input.jump || up;
  input.crouch = input.crouch || down;
  input.pick = input.pick || keys.has('e');
  input.swing = input.swing || keys.has('f');
}

export function clearOneShots(){
  input.pick = false;
  input.swing = false;
  input.jump = false;
}