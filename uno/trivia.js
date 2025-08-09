// trivia.js
(() => {
  // --- Trivia bank ---
  const TRIVIA = [
    { q: "What animal is Zazu?", a: ["Hornbill","Meerkat","Warthog","Mandrill"], c: 0 },
    { q: "Where is Pride Rock?", a: ["The Pride Lands","Elephant Graveyard","Gorge","Water Hole"], c: 0 },
    { q: "Who leads the hyenas in the original film?", a: ["Shenzi","Ed","Banzai","Scar"], c: 0 },
    { q: "What are Timon and Pumbaa famous for saying?", a: ["Hakuna Matata","Asante Sana","Circle of Life","Be Prepared"], c: 0 },
    { q: "Rafiki is a…", a: ["Mandrill","Baboon","Lemur","Gorilla"], c: 0 },
    { q: "Simba’s best friend as a cub:", a: ["Nala","Kiara","Sarabi","Vitani"], c: 0 },
    { q: "Which song opens the film?", a: ["Circle of Life","I Just Can't Wait to Be King","Be Prepared","Can You Feel the Love Tonight"], c: 0 },
    { q: "What’s the hyenas’ usual hangout?", a: ["Elephant Graveyard","Water Hole","Pride Rock","Savanna Flats"], c: 0 },
    { q: "Pumbaa is a…", a: ["Warthog","Boar","Tapir","Bushpig"], c: 0 },
    { q: "Timon is a…", a: ["Meerkat","Mongoose","Ground Squirrel","Civet"], c: 0 },
    { q: "Mufasa’s mate is:", a: ["Sarabi","Sarafina","Zira","Nala"], c: 0 },
    { q: "Scar’s real relation to Simba:", a: ["Uncle","Cousin","Not related","Grand-uncle"], c: 0 },
    { q: "Who says 'Long live the king'?", a: ["Scar","Zazu","Shenzi","Rafiki"], c: 0 },
    { q: "Rafiki’s tool:", a: ["Gourd staff","Drum","Flute","Shield"], c: 0 },
    { q: "Meaning of 'Hakuna Matata':", a: ["No worries","Thank you","Be strong","Run fast"], c: 0 },
    { q: "What are Scar’s go-to allies?", a: ["Hyenas","Jackals","Vultures","Wild dogs"], c: 0 },
    { q: "Simba’s daughter (in sequel):", a: ["Kiara","Vitani","Kovu","Zuri"], c: 0 },
    { q: "Zazu’s job:", a: ["Majordomo","Guard","Chef","Shaman"], c: 0 },
    { q: "“Be Prepared” is whose song?", a: ["Scar","Mufasa","Simba","Nala"], c: 0 },
    { q: "Who teaches Simba about the past?", a: ["Rafiki","Zazu","Timon","Pumbaa"], c: 0 },
  ];

  let idx = Math.floor(Math.random() * TRIVIA.length);

  // Ensure modal exists (creates it if not in HTML)
  function ensureModal() {
    if (document.getElementById('trivia-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'trivia-modal';
    modal.className = 'modal';
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-label','Trivia');
    modal.innerHTML = `
      <div class="sheet">
        <h3 style="margin:0 0 8px">Savanna Trivia</h3>
        <p id="trivia-question" style="margin:0 0 10px"></p>
        <div id="trivia-answers" class="trivia-answers"></div>
        <div id="trivia-feedback" class="trivia-feedback"></div>
        <div style="margin-top:10px;display:flex;gap:10px;justify-content:center">
          <button id="trivia-next" class="secondary">Close</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  function nextItem(){
    const item = TRIVIA[idx];
    idx = (idx + 1) % TRIVIA.length;
    return item;
  }

  function show(durationMs = 6000){
    ensureModal();

    const modal = document.getElementById('trivia-modal');
    const qEl = document.getElementById('trivia-question');
    const aWrap = document.getElementById('trivia-answers');
    const fb = document.getElementById('trivia-feedback');
    const btnNext = document.getElementById('trivia-next');

    const { q, a, c } = nextItem();
    qEl.textContent = q;
    fb.textContent = "";
    aWrap.innerHTML = "";

    let answered = false;

    a.forEach((txt, i) => {
      const b = document.createElement('button');
      b.className = 'choice';
      b.textContent = txt;
      b.addEventListener('click', () => {
        if(answered) return;
        answered = true;
        if(i === c){
          b.classList.add('correct');
          fb.textContent = "Correct! 🦁";
        } else {
          b.classList.add('wrong');
          // mark the right one
          const right = aWrap.children[c];
          if(right) right.classList.add('correct');
          fb.textContent = "Nice try! 🐾";
        }
      });
      aWrap.appendChild(b);
    });

    modal.classList.add('show');

    // auto close after duration (non-blocking)
    const timer = setTimeout(() => {
      modal.classList.remove('show');
    }, durationMs);

    btnNext.onclick = () => {
      clearTimeout(timer);
      modal.classList.remove('show');
    };
  }

  // expose globally
  window.Trivia = { show };
})();