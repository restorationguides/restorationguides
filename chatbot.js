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
        let userInput = chatInput.value.toLowerCase().trim();

        if (userInput === "") return;

        chatMessages.innerHTML += `<div><strong>You:</strong> ${userInput}</div>`;

        let botResponse = "I don't understand that yet! Try asking something about WRT.";

        let responses = {
            "hello": "Hey! How can I help you with WRT?",
            "humidity": "Relative humidity should be kept below 50% to prevent mold growth.",
            "psychrometry": "Psychrometry is the study of air properties, including temperature, humidity, and moisture content.",
            "mold": "Mold can begin growing within 24-48 hours in the right conditions. Use dehumidifiers to control humidity.",
            "category 3": "Category 3 water is grossly contaminated, often called 'black water,' and requires special handling.",
            "quiz": "Want to test your WRT knowledge? Try the quiz on the site!",
            "dehumidifier": "LGR dehumidifiers are the best for water restoration because they remove moisture even in lower humidity environments.",
            "contact": "If you need to contact me, you must first retrieve the Ethernet Cable of Destiny from the depths of Windows Vista."
        };

        // Handle Random Fact Command
        if (userInput.includes("random fact") || userInput.includes("tell me something random") || userInput.includes("give me a fact")) {
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
            // Match input to a response
            for (let keyword in responses) {
                if (userInput.includes(keyword)) {
                    botResponse = responses[keyword];
                    break;
                }
            }
        }

        chatMessages.innerHTML += `<div><strong>Bot:</strong> ${botResponse}</div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;

        chatInput.value = "";
    }
});
