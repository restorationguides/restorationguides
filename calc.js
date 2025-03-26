document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("toggleCalculator");
  const closeBtn = document.getElementById("closeCalculator");
  const calculator = document.getElementById("calculatorModal");
  const display = document.getElementById("calcDisplay");
  const buttons = calculator.querySelectorAll(".calc-btn");
  

  // ✨ Sparkle class injection
  const sparkle = () => {
    toggleBtn.classList.add("sparkle");
    setTimeout(() => {
      toggleBtn.classList.remove("sparkle");
      toggleBtn.textContent = "🧮"; // Reset to normal
    }, 2000);
  };

  // Toggle calculator visibility
  toggleBtn.addEventListener("click", () => {
    calculator.classList.toggle("show");
  });

  closeBtn.addEventListener("click", () => {
    calculator.classList.remove("show");
  });

  // Handle button input
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.textContent;

      if (val === "=") {
        try {
          const result = eval(display.value);
          display.value = result;
          display.scrollLeft = display.scrollWidth;

          // 🎉 Easter Eggs
          switch (String(result)) {
            case "69":
              toggleBtn.textContent = "✨ Nice!";
              sparkle();
              break;
            case "420":
              toggleBtn.textContent = "✨ Blaze it!";
              sparkle();
              break;
            case "42":
              toggleBtn.textContent = "✨ 42!";
              sparkle();
              break;
            case "80085":
              toggleBtn.textContent = "✨ Classic!";
              sparkle();
              break;
          }
        } catch {
          display.value = "Error";
        }
      } else if (val === "C") {
        display.value = "";
      } else if (val === "⌫") {
        display.value = display.value.slice(0, -1);
      } else {
        display.value += val;
        display.scrollLeft = display.scrollWidth;
      }
    });
  });
});
