document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.sidebar-btn');
    const panes = document.querySelectorAll('.tab-pane');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            // Toggle Classes
            buttons.forEach(b => b.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
            
            // Mobile: Scroll back to top of content area
            if(window.innerWidth < 900) {
                window.scrollTo({ top: 350, behavior: 'smooth' });
            }
        });
    });
});