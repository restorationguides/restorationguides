// Dylan’s Offline Music App – pure client-side
// Features: library pick, queue with drag-reorder, play next, playlists (localStorage), shuffle/repeat, media session

const audio = document.getElementById('audio');
const els = {
  title:   document.getElementById('title'),
  artist:  document.getElementById('artist'),
  cover:   document.getElementById('cover'),
  seek:    document.getElementById('seek'),
  current: document.getElementById('currentTime'),
  duration:document.getElementById('duration'),
  playPause:document.getElementById('playPause'),
  prev:    document.getElementById('prev'),
  next:    document.getElementById('next'),
  back10:  document.getElementById('back10'),
  fwd30:   document.getElementById('fwd30'),
  shuffle: document.getElementById('shuffle'),
  repeat:  document.getElementById('repeat'),
  rate:    document.getElementById('rate'),
  volume:  document.getElementById('volume'),
  libSearch:document.getElementById('libSearch'),
  library: document.getElementById('library'),
  queue:   document.getElementById('queue'),
  clearQueue:document.getElementById('clearQueue'),
  saveQueueToPlaylist:document.getElementById('saveQueueToPlaylist'),
  filePicker:document.getElementById('filePicker'),
  dirPicker: document.getElementById('dirPicker'),
  playlists: document.getElementById('playlists'),
  newPlaylistName: document.getElementById('newPlaylistName'),
  createPlaylist: document.getElementById('createPlaylist'),
};

let library = [];   // [{id,name,artist,blobUrl,file}]
let queue = [];     // array of track ids
let index = -1;     // current queue index
let shuffle = false;
let repeatMode = 0; // 0: off, 1: all, 2: one

// --- Helpers
const formatTime = s => {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s/60), ss = Math.floor(s%60).toString().padStart(2,'0');
  return `${m}:${ss}`;
};

function parseTagsFallback(file) {
  // Quick-n-dirty: "Artist - Title.mp3" → {artist, title}
  const base = file.name.replace(/\.[^.]+$/,'');
  const m = base.match(/^(.*?)\s*-\s*(.+)$/);
  return m ? { artist:m[1].trim(), title:m[2].trim() } : { artist:'', title:base };
}

function buildTrackFromFile(file) {
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
}

// --- UI Renderers
function renderLibrary() {
  const q = els.libSearch.value.toLowerCase();
  els.library.innerHTML = '';
  library
    .filter(t => t.name.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q))
    .forEach(t => {
      const li = document.createElement('li'); li.className='item';
      li.innerHTML = `
        <div>
          <div>${t.name}</div>
          <div class="sub">${t.artist || 'Unknown artist'}</div>
        </div>
        <div class="actions">
          <button data-id="${t.id}" data-act="play">Play</button>
          <button data-id="${t.id}" data-act="add">Add</button>
          <button data-id="${t.id}" data-act="next">Play Next</button>
        </div>`;
      els.library.appendChild(li);
    });
}

function renderQueue() {
  els.queue.innerHTML = '';
  queue.forEach((id, i) => {
    const t = library.find(x => x.id === id);
    if (!t) return;
    const li = document.createElement('li'); li.className='item'; li.draggable = true;
    li.dataset.index = i;
    li.innerHTML = `
      <div>
        <div>${i === index ? '▶️ ' : ''}${t.name}</div>
        <div class="sub">${t.artist || 'Unknown artist'}</div>
      </div>
      <div class="actions">
        <button data-i="${i}" data-act="jump">Play</button>
        <button data-i="${i}" data-act="remove">Remove</button>
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
        <div>${name}</div>
        <div class="sub">${count} track${count!==1?'s':''}</div>
      </div>
      <div class="actions">
        <button data-name="${name}" data-act="loadpl">Load</button>
        <button data-name="${name}" data-act="queuepl">Queue</button>
        <button data-name="${name}" data-act="delpl">Delete</button>
      </div>`;
    els.playlists.appendChild(li);
  });
}

// --- Playback
function loadByQueueIndex(i) {
  if (i < 0 || i >= queue.length) return;
  index = i;
  const t = library.find(x => x.id === queue[index]);
  if (!t) return;
  audio.src = t.blobUrl;
  audio.playbackRate = parseFloat(els.rate.value);
  audio.volume = parseFloat(els.volume.value);
  audio.play().catch(()=>{ /* autoplay may be blocked until user gesture */ });
  els.playPause.textContent = '⏸';
  els.title.textContent = t.name;
  els.artist.textContent = t.artist || 'Unknown artist';
  updateMediaSession(t);
  renderQueue();
}

function nextTrack(userAction=false) {
  if (repeatMode === 2 && !userAction) { // repeat-one
    audio.currentTime = 0;
    audio.play();
    return;
  }
  if (shuffle) {
    index = Math.floor(Math.random()*queue.length);
  } else {
    index++;
    if (index >= queue.length) {
      if (repeatMode === 1) index = 0; else { index = queue.length-1; audio.pause(); return; }
    }
  }
  loadByQueueIndex(index);
}

function prevTrack() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  index = Math.max(0, index-1);
  loadByQueueIndex(index);
}

// --- Queue ops
function addToQueue(id) { queue.push(id); renderQueue(); }
function playNext(id) {
  const insertAt = Math.min(queue.length, index+1);
  queue.splice(insertAt, 0, id);
  renderQueue();
}
function clearQueue() { queue.length = 0; index = -1; renderQueue(); audio.pause(); }

// --- Drag and drop reordering
function addDragHandlers(el) {
  el.addEventListener('dragstart', e => {
    el.classList.add('dragging');
    e.dataTransfer.setData('text/plain', el.dataset.index);
  });
  el.addEventListener('dragend', () => el.classList.remove('dragging'));
}
els.queue.addEventListener('dragover', e => {
  e.preventDefault();
  const dragging = els.queue.querySelector('.dragging');
  const after = getDragAfterElement(els.queue, e.clientY);
  if (!dragging) return;
  if (after == null) els.queue.appendChild(dragging);
  else els.queue.insertBefore(dragging, after);
});
els.queue.addEventListener('drop', () => {
  const ids = [...els.queue.querySelectorAll('.item')].map(li => queue[li.dataset.index]);
  queue = ids;
  renderQueue();
});
function getDragAfterElement(container, y) {
  const elsArr = [...container.querySelectorAll('.item:not(.dragging)')];
  return elsArr.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height/2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    else return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// --- Playlists (stored as fingerprints; matching done by filename+size+modified)
const PL_KEY = 'offline_music_playlists_v1';
function loadPlaylists() { try { return JSON.parse(localStorage.getItem(PL_KEY)) || {}; } catch { return {}; } }
function savePlaylists(obj) { localStorage.setItem(PL_KEY, JSON.stringify(obj)); }
function trackFingerprint(t) { return `${t.fileName}|${t.size}|${t.modified}`; }

function createPlaylist(name, fromTrackIds) {
  if (!name.trim()) return;
  const lists = loadPlaylists();
  const fps = fromTrackIds.map(id => {
    const t = library.find(x=>x.id===id);
    return t ? trackFingerprint(t) : null;
  }).filter(Boolean);
  lists[name] = fps;
  savePlaylists(lists);
  renderPlaylists();
  alert(`Saved playlist "${name}"`);
}

async function resolvePlaylistToTracks(fps) {
  // Try to match fingerprints against current library. If some missing, prompt to pick more files.
  let ids = [];
  const need = new Set(fps);
  // 1) match in current library
  library.forEach(t => { const fp = trackFingerprint(t); if (need.has(fp)) { ids.push(t.id); need.delete(fp); } });
  if (need.size === 0) return ids;

  // 2) prompt user to add files to complete it
  alert(`Some tracks are missing. Please select the missing files to complete the playlist.`);
  const files = await pickFilesDialog();
  addFilesToLibrary(files);
  // Try match again
  library.forEach(t => { const fp = trackFingerprint(t); if (need.has(fp)) { ids.push(t.id); need.delete(fp); } });
  return ids;
}

// --- File picking
function addFilesToLibrary(fileList) {
  if (!fileList) return;
  const audioFiles = [...fileList].filter(f => f.type.startsWith('audio/'));
  const tracks = audioFiles.map(buildTrackFromFile);
  library.push(...tracks);
  library.sort((a,b)=> a.artist.localeCompare(b.artist) || a.name.localeCompare(b.name));
  renderLibrary();
}

function pickFilesDialog() {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file'; input.multiple = true; input.accept = 'audio/*';
    input.onchange = () => resolve(input.files);
    input.click();
  });
}

// --- Media Session (Android lockscreen / notifications)
function updateMediaSession(t) {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: t.name,
    artist: t.artist || 'Unknown',
    album: 'Local Files',
  });
  navigator.mediaSession.setActionHandler('play', () => { audio.play(); els.playPause.textContent='⏸'; });
  navigator.mediaSession.setActionHandler('pause', () => { audio.pause(); els.playPause.textContent='▶️'; });
  navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
  navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack(true));
  navigator.mediaSession.setActionHandler('seekbackward', () => audio.currentTime = Math.max(0, audio.currentTime - 10));
  navigator.mediaSession.setActionHandler('seekforward',  () => audio.currentTime = Math.min(audio.duration||Infinity, audio.currentTime + 30));
}

// --- Wire events
els.filePicker.addEventListener('change', e => addFilesToLibrary(e.target.files));
els.dirPicker.addEventListener('change', e => addFilesToLibrary(e.target.files));
els.libSearch.addEventListener('input', renderLibrary);

els.library.addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn) return;
  const id = btn.dataset.id, act = btn.dataset.act;
  if (act === 'play') { addToQueue(id); loadByQueueIndex(queue.length-1); }
  if (act === 'add')  { addToQueue(id); }
  if (act === 'next') { playNext(id); }
});

els.queue.addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn) return;
  const i = parseInt(btn.dataset.i, 10), act = btn.dataset.act;
  if (act === 'remove') { queue.splice(i,1); if (i<=index) index--; renderQueue(); }
  if (act === 'jump')   { loadByQueueIndex(i); }
});

els.clearQueue.addEventListener('click', clearQueue);
els.saveQueueToPlaylist.addEventListener('click', () => {
  const name = prompt('Playlist name?'); if (!name) return;
  createPlaylist(name, queue.slice());
});

els.createPlaylist.addEventListener('click', () => {
  const name = els.newPlaylistName.value.trim(); if (!name) return;
  // Save current library (all) as a playlist? More useful: save queue.
  if (queue.length === 0) return alert('Queue is empty. Add songs then save as playlist.');
  createPlaylist(name, queue.slice());
  els.newPlaylistName.value = '';
});

els.playlists.addEventListener('click', async e => {
  const btn = e.target.closest('button'); if (!btn) return;
  const act = btn.dataset.act, name = btn.dataset.name;
  const lists = loadPlaylists();
  if (!(name in lists)) return;
  if (act === 'delpl') { delete lists[name]; savePlaylists(lists); renderPlaylists(); return; }
  const ids = await resolvePlaylistToTracks(lists[name]);
  if (act === 'loadpl') { queue = ids.slice(); index = -1; renderQueue(); if (queue.length) loadByQueueIndex(0); }
  if (act === 'queuepl') { queue.push(...ids); renderQueue(); }
});

// transport
els.playPause.addEventListener('click', () => {
  if (audio.paused) { audio.play(); els.playPause.textContent='⏸'; }
  else { audio.pause(); els.playPause.textContent='▶️'; }
});
els.next.addEventListener('click', () => nextTrack(true));
els.prev.addEventListener('click', prevTrack);
els.back10.addEventListener('click', () => audio.currentTime = Math.max(0, audio.currentTime-10));
els.fwd30.addEventListener('click', () => audio.currentTime = Math.min(audio.duration||Infinity, audio.currentTime+30));

els.rate.addEventListener('change', () => audio.playbackRate = parseFloat(els.rate.value));
els.volume.addEventListener('input', () => audio.volume = parseFloat(els.volume.value));

els.shuffle.addEventListener('click', () => {
  shuffle = !shuffle;
  els.shuffle.style.borderColor = shuffle ? '#2ea043' : 'var(--border)';
});
els.repeat.addEventListener('click', () => {
  repeatMode = (repeatMode + 1) % 3;
  const labels = ['🔁', '🔂 All', '🔂 One'];
  els.repeat.textContent = labels[repeatMode];
});

// progress
audio.addEventListener('timeupdate', () => {
  els.current.textContent = formatTime(audio.currentTime);
  els.duration.textContent = formatTime(audio.duration);
  els.seek.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
});
els.seek.addEventListener('input', () => {
  if (!audio.duration) return;
  audio.currentTime = (parseFloat(els.seek.value)/100) * audio.duration;
});
audio.addEventListener('ended', () => nextTrack(false));

// initial render
renderLibrary(); renderQueue(); renderPlaylists();