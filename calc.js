document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('calcDisplay');
    const buttons = document.querySelectorAll('.calc-btn');
    const drawer = document.getElementById('calculatorModal');
    const toggleBtn = document.getElementById('toggleCalculator');
    const closeBtn = document.getElementById('closeCalculator');

    // 1. Drawer UI Logic
    toggleBtn.addEventListener('click', () => {
        drawer.classList.toggle('open');
        toggleBtn.textContent = drawer.classList.contains('open') ? "Close Calculator" : "Open Calculator";
    });

    closeBtn.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggleBtn.textContent = "Open Calculator";
    });

    // 2. Calculator Functional Logic
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;

            if (button.classList.contains('equal')) {
                calculateResult();
            } else if (button.classList.contains('clear')) {
                clearDisplay();
            } else if (button.classList.contains('backspace')) {
                handleBackspace();
            } else {
                appendToDisplay(value);
            }
        });
    });

    function appendToDisplay(value) {
        // Replace visual symbols with math symbols if necessary
        if (display.value === "0" || display.value === "Error") {
            display.value = value;
        } else {
            display.value += value;
        }
    }

    function clearDisplay() {
        display.value = "";
    }

    function handleBackspace() {
        display.value = display.value.slice(0, -1);
    }

    function calculateResult() {
        try {
            // We use Function constructor as a safer alternative to eval() for this specific use case
            // It allows for parenthesis and complex restoration math like (12000 * 4) / 60
            const result = new Function('return ' + display.value)();
            
            if (result === Infinity || isNaN(result)) {
                display.value = "Error";
            } else {
                // Round to 2 decimal places for cleaner GPP/PPD readings
                display.value = Number(Math.round(result + 'e2') + 'e-2');
            }
        } catch (error) {
            display.value = "Error";
        }
    }

    // Optional: Allow keyboard support for we professionals who prefer typing
    document.addEventListener('keydown', (e) => {
        if (!drawer.classList.contains('open')) return;

        const key = e.key;
        if (/[0-9\+\-\*\/\.\(\)]/.test(key)) {
            appendToDisplay(key);
        } else if (key === 'Enter') {
            calculateResult();
        } else if (key === 'Backspace') {
            handleBackspace();
        } else if (key === 'Escape') {
            clearDisplay();
        }
    });
});