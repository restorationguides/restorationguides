document.addEventListener("DOMContentLoaded", function () {
    let chatbotToggle = document.getElementById("chatbot-toggle");
    let chatbotWindow = document.getElementById("chatbot-window");
    let closeChat = document.getElementById("close-chat");
    let sendMessage = document.getElementById("send-message");
    let chatInput = document.getElementById("chatbot-input");
    let chatMessages = document.getElementById("chatbot-messages");

    chatbotToggle.addEventListener("click", function () {
        chatbotWindow.style.display = chatbotWindow.style.display === "none" || chatbotWindow.style.display === "" ? "block" : "none";
    });

    closeChat.addEventListener("click", function () {
        chatbotWindow.style.display = "none";
    });

    sendMessage.addEventListener("click", function () {
        processChatMessage();
    });

    chatInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            processChatMessage();
        }
    });

    function processChatMessage() {
        let userInput = chatInput.value.trim();

        if (userInput === "") return;

        chatMessages.innerHTML += `<div><strong>You:</strong> ${userInput}</div>`;

        let botResponse = "I don't understand that yet! Try asking something about WRT.";

        const lowerInput = userInput.toLowerCase();

        // Math handling
        if (/^[\d\s\+\-\*\/\.\(\)]+$/.test(userInput)) {
            try {
                const result = eval(userInput);
                switch (String(result)) {
                    case "69":
                        botResponse = "Nice. 😏";
                        break;
                    case "420":
                        botResponse = "Blaze it. 🌿";
                        break;
                    case "42":
                        botResponse = "The Answer to Life, the Universe, and Everything. 🌌";
                        break;
                    case "80085":
                        botResponse = "Boobs. Classic. 😂";
                        break;
                    default:
                        botResponse = `🧮 The answer is: <strong>${result}</strong>`;
                }
            } catch {
                botResponse = "Hmm 🤔 I couldn’t solve that math problem.";
            }
        } else {
            // Normal response handling
            const responses = {
                "hello": "Hey! How can I help you with WRT?",
                "humidity": "Relative humidity should be kept below 60% to prevent mold growth.",
                "psychrometry": "Psychrometry is the study of air properties, including temperature, humidity, and moisture content.",
                "mold": "Mold can begin growing within 24-48 hours in the right conditions. Use dehumidifiers to control humidity.",
                "gpp": "Grains per pound is a measurement of the moisture content in air.",
                "catgory 1": "Category 1 water is potable water, often called 'clear water', and uses normal drying methods.",
                "category 2": "Category 2 water is significantly contaminated water, often called 'grey water', and requires special handling.",
                "category 3": "Category 3 water is grossly contaminated, often called 'black water,' and requires special handling.",
                "quiz": "Want to test your WRT knowledge? Try the quiz on the site!",
                "dehumidifier": "LGR dehumidifiers are the best for water restoration because they remove moisture even in lower humidity environments.",
                "contact": "If you need to contact me, write a letter, leave it on the door step of any home, and if I become a traveling monk, I'll find it.",
                "what is an open drying system": "A drying system that exchanges indoor air with outdoor air, typically using ventilation.",
                "what is a closed drying system": "A controlled drying environment where air movement, temperature, and humidity are regulated.",
                "what is permeance": "A measure of how easily moisture can pass through a material (e.g., vapor barriers have low permeance).",
                "what is laminar airflow": "Smooth, layered air movement that reduces turbulence, often seen in controlled drying environments.",
                "what are hygroscopic materials": "Materials that readily absorb moisture from the air, such as drywall and carpet.",
                "what is sublimation?": "The process where a solid (e.g., ice) changes directly into a gas without becoming liquid.",
                "what is usually referred to as the black mold?": "Stachybotrys.",
                "what are the types of containment?": "Source, Structure, & Full",
                "How much does a gallon of water weigh?": "8.34lbs",
               "changelog": `
  🛠️ <strong>Site Changelog – v1.13</strong> 🛠️<br>
  • Added a working <em>Psychrometric Calculator</em> with GPP, Dew Point & Vapor Pressure<br>
  • Built full quiz system with scoring, retry logic, and randomization<br>
  • Implemented <strong>Timed Mode</strong> with countdown and auto-fail<br>
  • Fixed mode switching bug (you're welcome, Future Dylan)<br>
  • Added AMRT questions & animated achievements<br>
  • Created Study Guide Tabs for WRT & AMRT<br>
  • Cleaned up AMRT study content formatting<br>
  • Added calculator Easter eggs & bonus logic<br>
  • Chatbot can now do math like a polite nerd 🤓<br>`
            };

            if (lowerInput.includes("random fact") || lowerInput.includes("tell me something random") || lowerInput.includes("give me a fact")) {
                let randomFacts = [
                    "Mold spores exist everywhere, but they need moisture to grow. Keep humidity below 50% to prevent growth.",
                    "The first electric dehumidifier was invented in 1902, but LGR dehumidifiers changed the game in water restoration.",
                    "Psychrometry helps calculate how much moisture air can hold based on temperature and humidity.",
                    "Air movers should be placed at a 45-degree angle to maximize drying efficiency.",
                    "Low Grain Refrigerant (LGR) dehumidifiers remove 30-50% more water than traditional refrigerant dehumidifiers.",
                    "Water damage restoration should begin within 24 hours to prevent microbial growth.",
                    "A properly set up drying chamber can dry a structure in 3-4 days, even after significant flooding.",
                    "Wood reaches its Equilibrium Moisture Content (EMC) around 6-8% indoors under normal conditions.",
                    "Desiccant dehumidifiers work best in low-temperature environments and can achieve lower humidity levels than LGR units.",
                    "Air scrubbers help remove airborne contaminants during mold remediation by using HEPA filters.",
                    "Vapor pressure differentials help drive moisture from wet materials to drier areas.",
                    "The IICRC S500 Standard outlines best practices for water damage restoration."
                ];

                botResponse = randomFacts[Math.floor(Math.random() * randomFacts.length)];
            } else {
                for (let keyword in responses) {
                    if (lowerInput.includes(keyword)) {
                        botResponse = responses[keyword];
                        break;
                    }
                }
            }
        }

        chatMessages.innerHTML += `<div><strong>Bot:</strong> ${botResponse}</div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
        chatInput.value = "";
    }
});
