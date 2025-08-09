// YouTube Music-ish UI + mobile tabs + mini player + your original features
const audio = document.getElementById('audio');

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];

const els = {
  // pages & tabs
  pages: $('#pages'),
  tabs: $$('.tab'),

  // pickers
  filePicker: $('#filePicker'),
  dirPicker: $('#dirPicker'),

  // home
  recentGrid: $('#recentGrid'),

  // library
  libSearch: $('#libSearch'),
  library: $('#library'),

  // queue
  queue: $('#queue'),
  clearQueue: $('#clearQueue'),
  saveQueueToPlaylist: $('#saveQueueToPlaylist'),

  // playlists
  playlists: $('#playlists'),
  newPlaylistName: $('#newPlaylistName'),
  createPlaylist: $('#createPlaylist'),

  // mini player
  mini: $('#mini'),
  miniArt: $('#miniArt'),
  miniTitle: $('#miniTitle'),
  miniArtist: $('#miniArtist'),

  // sheet player
  sheet: $('#sheet'),
  cover: $('#cover'),
  title: $('#title'),
  artist: $('#artist'),
  seek: $('#seek'),
  current: $('#currentTime'),
  duration: $('#duration'),

  // transport
  playPause: $('#playPause'),
  prev: $('#prev'),
  next: $('#next'),
  more: $('#more'),

  playPause2: $('#playPause2'),
  prev2: $('#prev2'),
  next2: $('#next2'),
  back10: $('#back10'),
  fwd30: $('#fwd30'),

  // toggles
  shuffle: $('#shuffle'),
  repeat: $('#repeat'),
  rate: $('#rate'),
  volume: $('#volume'),
};

let library = [];   // [{id,name,artist,blobUrl,fileName,size,modified}]
let queue = [];     // array of track ids
let index = -1;     // current queue index
let shuffleOn = false;
let repeatMode = 0; // 0 off, 1 all, 2 one
let recent = [];    // most recent 12 tracks

// ---------- Utilities ----------
const formatTime = s => {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s/60), ss = Math.floor(s%60).toString().padStart(2,'0');
  return `${m}:${ss}`;
};
const parseTagsFallback = (file) => {
  const base = file.name.replace(/\.[^.]+$/,'');
  const m = base.match(/^(.*?)\s*-\s*(.+)$/);
  return m ? { artist:m[1].trim(), title:m[2].trim() } : { artist:'', title:base };
};
const buildTrackFromFile = (file) => {
  const url = URL.createObjectURL(file);
  const { artist, title } = parseTagsFallback(file);
  return {
    id: crypto.randomUUID(),
    name: title,
    artist,
    blobUrl: url,
    fileName: file.name,
    size: file.size,
    modified: file.lastModified
  };
};

// ---------- Tabs ----------
els.tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    els.tabs.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    $$('.page').forEach(p=>p.classList.remove('active'));
    const id = `#page-${btn.dataset.tab}`;
    document.querySelector(id).classList.add('active');
  });
});

// ---------- Rendering ----------
function renderHome() {
  els.recentGrid.innerHTML = '';
  recent.slice(0,12).forEach(t => {
    const d = document.createElement('div');
    d.className = 'card';
    d.innerHTML = `
      <div class="art">🎵</div>
      <div class="meta">
        <div class="title ellipsis">${t.name}</div>
        <div class="artist ellipsis">${t.artist || 'Unknown artist'}</div>
      </div>
      <button class="ghost" data-id="${t.id}" data-act="play">Play</button>
    `;
    els.recentGrid.appendChild(d);
  });
  els.recentGrid.addEventListener('click', e=>{
    const b = e.target.closest('button[data-id]'); if(!b) return;
    const id = b.dataset.id;
    addToQueue(id); loadByQueueIndex(queue.length-1);
  }, { once:true });
}

function renderLibrary() {
  const q = (els.libSearch.value || '').toLowerCase();
  els.library.innerHTML = '';
  library
    .filter(t => t.name.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q))
    .forEach(t => {
      const li = document.createElement('li'); li.className='item';
      li.innerHTML = `
        <div>
          <div class="title ellipsis">${t.name}</div>
          <div class="sub ellipsis">${t.artist || 'Unknown artist'}</div>
        </div>
        <div class="actions">
          <button data-id="${t.id}" data-act="play" class="btn">Play</button>
          <button data-id="${t.id}" data-act="add" class="ghost">Add</button>
          <button data-id="${t.id}" data-act="next" class="ghost">⋮</button>
        </div>`;
      els.library.appendChild(li);
    });
}

function renderQueue() {
  els.queue.innerHTML = '';
  queue.forEach((id, i) => {
    const t = library.find(x => x.id === id);
    if (!t) return;
    const li = document.createElement('li'); li.className='item'; li.draggable = true; li.dataset.index = i;
    li.innerHTML = `
      <div>
        <div class="title ellipsis">${i === index ? '▶️ ' : ''}${t.name}</div>
        <div class="sub ellipsis">${t.artist || 'Unknown artist'}</div>
      </div>
      <div class="actions">
        <button data-i="${i}" data-act="jump" class="btn">Play</button>
        <button data-i="${i}" data-act="remove" class="ghost">Remove</button>
      </div>`;
    addDragHandlers(li);
    els.queue.appendChild(li);
  });
}

function renderPlaylists() {
  const lists = loadPlaylists();
  els.playlists.innerHTML = '';
  Object.keys(lists).forEach(name => {
    const li = document.createElement('li'); li.className='item';
    const count = lists[name].length;
    li.innerHTML = `
      <div>
        <div class="title">${name}</div>
        <div class="sub">${count} track${count!==1?'s':''}</div>
      </div>
      <div class="actions">
        <button data-name="${name}" data-act="loadpl" class="btn">Load</button>
        <button data-name="${name}" data-act="queuepl" class="ghost">Queue</button>
        <button data-name="${name}" data-act="delpl" class="ghost">Delete</button>
      </div>`;
    els.playlists.appendChild(li);
  });
}

function updateMini(t){
  els.miniTitle.textContent = t?.name || 'Nothing playing';
  els.miniArtist.textContent = t?.artist || '—';
  els.miniArt.textContent = '🎵';
}

function updateSheet(t){
  els.title.textContent = t?.name || 'No track';
  els.artist.textContent = t?.artist || '—';
  els.cover.textContent = '🎵';
}

// ---------- Playback ----------
function loadByQueueIndex(i) {
  if (i < 0 || i >= queue.length) return;
  index = i;
  const t = library.find(x => x.id === queue[index]);
  if (!t) return;
  audio.src = t.blobUrl;
  audio.playbackRate = parseFloat(els.rate.value);
  audio.volume = parseFloat(els.volume.value);
  audio.play().catch(()=>{});
  setPlays(true);
  updateMini(t); updateSheet(t);
  recent = [t, ...recent.filter(x=>x.id!==t.id)];
  renderHome();
  updateMediaSession(t);
  renderQueue();
}

function nextTrack(userAction=false) {
  if (!queue.length) return;
  if (repeatMode === 2 && !userAction) { audio.currentTime = 0; audio.play(); return; }
  if (shuffleOn) {
    index = Math.floor(Math.random()*queue.length);
  } else {
    index++;
    if (index >= queue.length) {
      if (repeatMode === 1) index = 0; else { index = queue.length-1; audio.pause(); setPlays(false); return; }
    }
  }
  loadByQueueIndex(index);
}
function prevTrack(){
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  index = Math.max(0,index-1);
  loadByQueueIndex(index);
}

// queue ops
function addToQueue(id){ queue.push(id); renderQueue(); }
function playNext(id){
  const at = Math.min(queue.length, index+1);
  queue.splice(at,0,id);
  renderQueue();
}
function clearQueue(){ queue.length = 0; index = -1; renderQueue(); audio.pause(); setPlays(false); }

// ---------- Drag reorder ----------
function addDragHandlers(el){
  el.addEventListener('dragstart', e=>{
    el.classList.add('dragging');
    e.dataTransfer.setData('text/plain', el.dataset.index);
  });
  el.addEventListener('dragend', ()=> el.classList.remove('dragging'));
}
els.queue.addEventListener('dragover', e=>{
  e.preventDefault();
  const dragging = els.queue.querySelector('.dragging');
  const after = getDragAfterElement(els.queue, e.clientY);
  if (!dragging) return;
  if (after == null) els.queue.appendChild(dragging);
  else els.queue.insertBefore(dragging, after);
});
els.queue.addEventListener('drop', ()=>{
  const idsInDom = [...els.queue.querySelectorAll('.item')].map(li => queue[li.dataset.index]);
  queue = idsInDom;
  renderQueue();
});
function getDragAfterElement(container, y){
  const items = [...container.querySelectorAll('.item:not(.dragging)')];
  return items.reduce((closest, child)=>{
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height/2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    else return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ---------- Playlists ----------
const PL_KEY = 'offline_music_playlists_v1';
function loadPlaylists(){ try{return JSON.parse(localStorage.getItem(PL_KEY))||{}}catch{return{}} }
function savePlaylists(obj){ localStorage.setItem(PL_KEY, JSON.stringify(obj)); }
function trackFingerprint(t){ return `${t.fileName}|${t.size}|${t.modified}`; }

function createPlaylist(name, ids){
  if (!name.trim()) return;
  const lists = loadPlaylists();
  const fps = ids.map(id=>{
    const t = library.find(x=>x.id===id);
    return t ? trackFingerprint(t) : null;
  }).filter(Boolean);
  lists[name] = fps;
  savePlaylists(lists);
  renderPlaylists();
  alert(`Saved "${name}"`);
}
async function resolvePlaylistToTracks(fps){
  let ids = [];
  const need = new Set(fps);
  library.forEach(t=>{ const fp = trackFingerprint(t); if (need.has(fp)){ ids.push(t.id); need.delete(fp);} });
  if (need.size === 0) return ids;
  alert(`Some tracks missing. Pick files to complete the playlist.`);
  const files = await pickFilesDialog();
  addFilesToLibrary(files);
  library.forEach(t=>{ const fp = trackFingerprint(t); if (need.has(fp)){ ids.push(t.id); need.delete(fp);} });
  return ids;
}

// ---------- File picking ----------
function addFilesToLibrary(fileList){
  if (!fileList) return;
  const audioFiles = [...fileList].filter(f=> f.type.startsWith('audio/'));
  const tracks = audioFiles.map(buildTrackFromFile);
  library.push(...tracks);
  library.sort((a,b)=> a.artist.localeCompare(b.artist) || a.name.localeCompare(b.name));
  renderLibrary(); renderHome();
}
function pickFilesDialog(){
  return new Promise(resolve=>{
    const input = document.createElement('input');
    input.type = 'file'; input.multiple = true; input.accept='audio/*';
    input.onchange = ()=> resolve(input.files);
    input.click();
  });
}

// ---------- Media Session ----------
function updateMediaSession(t){
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: t.name, artist: t.artist || 'Unknown', album: 'Local Files',
  });
  navigator.mediaSession.setActionHandler('play', ()=>{ audio.play(); setPlays(true); });
  navigator.mediaSession.setActionHandler('pause', ()=>{ audio.pause(); setPlays(false); });
  navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
  navigator.mediaSession.setActionHandler('nexttrack', ()=> nextTrack(true));
  navigator.mediaSession.setActionHandler('seekbackward', ()=> audio.currentTime = Math.max(0,audio.currentTime-10));
  navigator.mediaSession.setActionHandler('seekforward', ()=> audio.currentTime = Math.min(audio.duration||Infinity,audio.currentTime+30));
}

// ---------- Events ----------
els.filePicker.addEventListener('change', e=> addFilesToLibrary(e.target.files));
els.dirPicker.addEventListener('change', e=> addFilesToLibrary(e.target.files));

els.libSearch.addEventListener('input', renderLibrary);

els.library.addEventListener('click', e=>{
  const btn = e.target.closest('button'); if (!btn) return;
  const id = btn.dataset.id, act = btn.dataset.act;
  if (act === 'play'){ addToQueue(id); loadByQueueIndex(queue.length-1); }
  if (act === 'add'){ addToQueue(id); }
  if (act === 'next'){ playNext(id); }
});

els.queue.addEventListener('click', e=>{
  const btn = e.target.closest('button'); if (!btn) return;
  const i = parseInt(btn.dataset.i,10), act = btn.dataset.act;
  if (act === 'remove'){ queue.splice(i,1); if (i<=index) index--; renderQueue(); }
  if (act === 'jump'){ loadByQueueIndex(i); }
});

els.clearQueue.addEventListener('click', clearQueue);
els.saveQueueToPlaylist.addEventListener('click', ()=>{
  if (!queue.length) return alert('Queue is empty.');
  const name = prompt('Playlist name?'); if (!name) return;
  createPlaylist(name, queue.slice());
});
els.createPlaylist.addEventListener('click', ()=>{
  if (!queue.length) return alert('Queue is empty.');
  const name = (els.newPlaylistName.value||'').trim(); if (!name) return;
  createPlaylist(name, queue.slice()); els.newPlaylistName.value='';
});
els.playlists.addEventListener('click', async e=>{
  const btn = e.target.closest('button'); if (!btn) return;
  const act = btn.dataset.act, name = btn.dataset.name;
  const lists = loadPlaylists(); if (!(name in lists)) return;
  if (act === 'delpl'){ delete lists[name]; savePlaylists(lists); renderPlaylists(); return; }
  const ids = await resolvePlaylistToTracks(lists[name]);
  if (act === 'loadpl'){ queue = ids.slice(); index = -1; renderQueue(); if (queue.length) loadByQueueIndex(0); }
  if (act === 'queuepl'){ queue.push(...ids); renderQueue(); }
});

// Mini ↔ Sheet behavior
function openSheet(){ els.sheet.classList.add('open'); }
function closeSheet(){ els.sheet.classList.remove('open'); }
els.mini.addEventListener('click', openSheet);
els.sheet.querySelector('.grab').addEventListener('click', closeSheet);

// Play/pause sync between mini & sheet
function setPlays(playing){
  els.playPause.textContent = playing ? '⏸' : '▶️';
  els.playPause2.textContent = playing ? '⏸' : '▶️';
}
els.playPause.addEventListener('click', (e)=>{ e.stopPropagation(); togglePlay(); });
els.playPause2.addEventListener('click', togglePlay);
function togglePlay(){
  if (audio.paused){ audio.play(); setPlays(true); }
  else { audio.pause(); setPlays(false); }
}

els.prev.addEventListener('click', (e)=>{ e.stopPropagation(); prevTrack(); });
els.next.addEventListener('click', (e)=>{ e.stopPropagation(); nextTrack(true); });
els.prev2.addEventListener('click', prevTrack);
els.next2.addEventListener('click', ()=> nextTrack(true));
els.back10.addEventListener('click', ()=> audio.currentTime = Math.max(0,audio.currentTime-10));
els.fwd30.addEventListener('click', ()=> audio.currentTime = Math.min(audio.duration||Infinity, audio.currentTime+30));

els.shuffle.addEventListener('click', ()=>{
  shuffleOn = !shuffleOn;
  els.shuffle.style.borderColor = shuffleOn ? '#ff4d6a' : 'var(--border)';
});
els.repeat.addEventListener('click', ()=>{
  repeatMode = (repeatMode+1)%3;
  const labels = ['🔁','🔂 All','🔂 One'];
  els.repeat.textContent = labels[repeatMode];
});
els.rate.addEventListener('change', ()=> audio.playbackRate = parseFloat(els.rate.value));
els.volume.addEventListener('input', ()=> audio.volume = parseFloat(els.volume.value));

// Progress
audio.addEventListener('timeupdate', ()=>{
  els.current.textContent = formatTime(audio.currentTime);
  els.duration.textContent = formatTime(audio.duration);
  els.seek.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
});
els.seek.addEventListener('input', ()=>{
  if (!audio.duration) return;
  audio.currentTime = (parseFloat(els.seek.value)/100) * audio.duration;
});
audio.addEventListener('ended', ()=> nextTrack(false));

// ---------- Init ----------
function initialRender(){
  renderHome(); renderLibrary(); renderQueue(); renderPlaylists();
}
initialRender();