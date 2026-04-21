document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const currentTheme = localStorage.getItem('theme');

    // 1. Check for saved user preference
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            themeIcon.textContent = 'Light Mode';
        }
    }

    // 2. Toggle Theme Function
    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeIcon.textContent = 'Dark Mode';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeIcon.textContent = 'Light Mode';
        }
    });
});

// Add to your existing nav.js to handle the modal
const atpModal = document.getElementById('atp-modal');
const atpTrigger = document.getElementById('atp-trigger');
const closeAtp = document.getElementById('close-atp');

if (atpTrigger) {
    atpTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        atpModal.classList.remove('hidden');
    });
}

if (closeAtp) {
    closeAtp.addEventListener('click', () => {
        atpModal.classList.add('hidden');
    });
}