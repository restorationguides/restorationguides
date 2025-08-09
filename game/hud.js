let levelNameEl, heartsEl, coinsEl, heldItemEl;

export function initHUD(){
  levelNameEl = document.getElementById('levelName');
  heartsEl = document.getElementById('hearts');
  coinsEl = document.getElementById('coins');
  heldItemEl = document.getElementById('heldItem');
}

export function updateHUD(levelIndex, player){
  levelNameEl.textContent = `Level ${levelIndex+1}–${levelIndex===0?'Fungal Fields':'Night Spores'}`;
  heartsEl.textContent = '❤'.repeat(player.hearts) + '♡'.repeat(Math.max(0,3-player.hearts));
  coinsEl.textContent = `🪙${player.coins}`;
  heldItemEl.textContent = player.holding ? '🪓 held' : '—';
}