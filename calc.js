document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById("toggleCalculator");
    const closeBtn = document.getElementById("closeCalculator");
    const calculator = document.getElementById("calculatorModal");
    const display = document.getElementById("calcDisplay");
    const buttons = calculator.querySelectorAll(".calc-btn");
  
    toggleBtn.addEventListener("click", () => {
      calculator.classList.toggle("show");
      toggleBtn.textContent = calculator.classList.contains("show") ? "❌ Close Calculator" : "🧮 Open Calculator";
    });
  
    closeBtn.addEventListener("click", () => {
      calculator.classList.remove("show");
      toggleBtn.textContent = "🧮 Open Calculator";
    });
  
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.textContent;
  
        if (val === "=") {
          try {
            display.value = eval(display.value);
          } catch {
            display.value = "Error";
          }
        } else if (val === "C") {
          display.value = "";
        } else {
          display.value += val;
        }
      });
    });
  });
  