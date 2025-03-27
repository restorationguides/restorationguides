document.addEventListener("DOMContentLoaded", () => {
    const nav = document.createElement('nav');
    nav.innerHTML = `
      <div class="nav-container">
        <h1>The Restoration Hub</h1>
        <button class="nav-toggle" aria-label="Toggle Menu">☰</button>
        <ul class="nav-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="study-guide.html">Study Guide</a></li>
          <li><a href="wrt-quiz.html">WRT Quiz</a></li>
          <li><a href="amrt-quiz.html">AMRT Quiz</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
    `;
    document.body.prepend(nav);
  
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  });
  