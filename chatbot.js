document.addEventListener("DOMContentLoaded", function () {
    const chatbotToggle = document.getElementById("chatbot-toggle");
    const chatbotWindow = document.getElementById("chatbot-window");
    const closeChat = document.getElementById("close-chat");
    const sendMessage = document.getElementById("send-message");
    const chatInput = document.getElementById("chatbot-input");
    const chatMessages = document.getElementById("chatbot-messages");

    // Toggle logic for the modern FAB
    chatbotToggle.addEventListener("click", () => {
        chatbotWindow.classList.toggle('hidden');
    });

    closeChat.addEventListener("click", () => {
        chatbotWindow.classList.add('hidden');
    });

    sendMessage.addEventListener("click", processChatMessage);

    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") processChatMessage();
    });

    function processChatMessage() {
        let userInput = chatInput.value.trim();
        if (userInput === "") return;

        // User Message Styling
        chatMessages.innerHTML += `<div class="message user"><strong>Technician:</strong> ${userInput}</div>`;

        let botResponse = "I apologize, I don't have technical data on that specific query yet. Please try asking about Water, Fire, Mold, or Biohazard protocols.";
        const lowerInput = userInput.toLowerCase();

        // Safe Professional Math Handling
        if (/^[\d\s\+\-\*\/\.\(\)]+$/.test(userInput)) {
            try {
                // Using Function instead of eval for better security
                const result = new Function('return ' + userInput)();
                botResponse = `Technical Calculation Result: <strong>${result}</strong>`;
            } catch {
                botResponse = "Calculation Error: Please verify your formula syntax.";
            }
        } else {
            // Professional Knowledge Base
            const responses = {
                "hello": "The Restoration Hub Assistant online. How can we assist with your technical query?",
                "humidity": "Standard target for mitigation: Relative humidity should be maintained below 60% to inhibit microbial germination.",
                "psychrometry": "Psychrometry is the thermodynamic study of air-water vapor mixtures, essential for structural drying.",
                "mold": "Microbial growth typically initiates within 24-48 hours. Containment and HEPA filtration are required per S520.",
                "gpp": "Grains Per Pound (GPP) measures the specific weight of moisture in the air, independent of temperature.",
                "category 1": "Category 1: Clean source water. No significant risk from dermal, ingestion, or inhalation exposure.",
                "category 2": "Category 2: Significantly contaminated water. Contains microorganisms or chemical agents that may cause illness.",
                "category 3": "Category 3: Grossly contaminated. Includes sewage, rising water, and other pathogenic sources.",
                "soot": "Residues vary by source. Natural materials produce Dry Soot; Synthetic materials produce Wet/Oily Soot. See S700 standards.",
                "biohazard": "Biohazard remediation follows S540 standards. PPE Level C and medical waste manifesting are mandatory.",
                "dehumidifier": "LGR (Low Grain Refrigerant) units are utilized for superior moisture removal in low-humidity environments.",
                "sublimation": "The phase transition of a substance directly from solid to gas (e.g., dry ice or freeze-drying structural materials).",
                "black mold": "Usually refers to Stachybotrys chartarum, a toxigenic fungus associated with prolonged moisture intrusion.",
                "weight of water": "A standard US gallon of water weighs approximately 8.34 lbs.",
                "changelog": "Restoration Hub v2.0: Integrated Water, Fire, Mold, and Biohazard modules. Removed legacy assets for professional UI/UX.", 
                "containment": "Source, Local, & Full"
            };

            // Keyword Matching
            for (let keyword in responses) {
                if (lowerInput.includes(keyword)) {
                    botResponse = responses[keyword];
                    break;
                }
            }
        }

        // Bot Message Styling
        chatMessages.innerHTML += `<div class="message bot"><strong>System:</strong> ${botResponse}</div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
        chatInput.value = "";
    }
});