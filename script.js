const questions = [
        { question: "What is the primary goal of water damage restoration?", options: ["A) Aesthetic appeal", "B) Moisture removal & prevention", "C) Increasing property value", "D) HVAC maintenance"], answer: "B" },
        { question: "Which category of water is considered grossly contaminated and poses serious health risks?", options: ["A) Category 1", "B) Category 2", "C) Category 3", "D) Category 4"], answer: "C" },
        { question: "What is the recommended humidity level to prevent mold growth?", options: ["A) Below 50%", "B) Below 60%", "C) Above 70%", "D) Exactly 80%"], answer: "B" },
        { question: "Which equipment is used to increase airflow and accelerate evaporation?", options: ["A) Dehumidifier", "B) Hygrometer", "C) Air Mover", "D) Moisture Meter"], answer: "C" },
        { question: "What is the formula to calculate AHAM pints needed for dehumidification?", options: ["A) Cubic Feet × Class Factor", "B) Cubic Feet ÷ Class Factor", "C) Air Changes ÷ 60", "D) CFM × GPP"], answer: "B" },
        { question: "What does 'GPP' stand for in psychrometry?", options: ["A) Gallons Per Pint", "B) Grains Per Pound", "C) Grams Per Percent", "D) Gas Pressure Percentage"], answer: "B" },
        { question: "What is the formula for air filtration (CFM) based on air exchanges per hour?", options: ["A) Cubic Feet ÷ Class Factor", "B) Cubic Feet × ACH ÷ 60", "C) Temperature × Dew Point", "D) Grains Per Pound ÷ 100"], answer: "B" },
        { question: "Which dehumidifier class factor should be used for LGR in Class 2 water damage?", options: ["A) 40", "B) 50", "C) 60", "D) 30"], answer: "B" },
        { question: "What instrument is used to measure relative humidity in the air?", options: ["A) Moisture Meter", "B) Psychrometric Chart", "C) Hygrometer", "D) Air Mover"], answer: "C" },
        { question: "What is the first step in water damage restoration?", options: ["A) Install air movers", "B) Begin dehumidification", "C) Identify water source and stop it", "D) Apply antimicrobial treatment"], answer: "C" },
        { question: "What is the purpose of an LGR dehumidifier?", options: ["A) Remove excess humidity", "B) Increase evaporation rate", "C) Control air temperature", "D) Detect hidden leaks"], answer: "A" },
        { question: "What is the typical air exchange rate used in drying calculations?", options: ["A) 2-3 ACH", "B) 4-6 ACH", "C) 8-10 ACH", "D) 12-15 ACH"], answer: "B" },
        { question: "Which material requires specialty drying techniques?", options: ["A) Carpet", "B) Concrete", "C) Drywall", "D) Wood flooring"], answer: "B" },
        { question: "Which factor has the greatest impact on drying efficiency?", options: ["A) Equipment brand", "B) Technician experience", "C) Airflow, temperature, and humidity", "D) Building layout"], answer: "C" },
        { question: "What is the main cause of secondary damage in water restoration?", options: ["A) Over-drying", "B) Unmonitored humidity", "C) Using too many air movers", "D) Incorrectly placed equipment"], answer: "B" },
        { question: "Which drying method uses heat to accelerate evaporation?", options: ["A) Low Grain Refrigerant (LGR)", "B) Conventional drying", "C) Desiccant drying", "D) Heated forced air drying"], answer: "D" },
        { question: "What is the purpose of a psychrometric chart?", options: ["A) Identify drying temperature", "B) Measure air pressure", "C) Determine moisture levels in materials", "D) Understand air properties and drying conditions"], answer: "D" },
        { question: "What is an indicator of hidden moisture behind a wall?", options: ["A) Peeling paint", "B) Stale odors", "C) Moisture meter readings", "D) All of the above"], answer: "D" },
        { question: "Which air mover placement maximizes drying?", options: ["A) Angled towards walls", "B) Pointed at ceiling", "C) Facing the floor directly", "D) Placed randomly in the room"], answer: "A" },
        { question: "Why is documentation critical in water restoration?", options: ["A) Required for insurance claims", "B) Tracks drying progress", "C) Helps prevent liability issues", "D) All of the above"], answer: "D" },
        { question: "What is the purpose of a thermal imaging camera in water restoration?", options: ["A) Measures temperature variations", "B) Detects mold growth", "C) Identifies VOCs", "D) Measures air pressure"], answer: "A" },
        { question: "Which material absorbs the most moisture and requires extended drying?", options: ["A) Drywall", "B) Hardwood", "C) Vinyl flooring", "D) Concrete"], answer: "D" },
        { question: "Which factor determines the number of dehumidifiers needed?", options: ["A) Room temperature", "B) Square footage only", "C) Cubic feet and class factor", "D) Number of air movers"], answer: "C" },
        { question: "What is the primary function of an air scrubber?", options: ["A) Remove moisture", "B) Filter airborne contaminants", "C) Increase air pressure", "D) Decrease drying time"], answer: "B" },
        { question: "Which of the following is NOT a consideration when determining drying goals?", options: ["A) Initial moisture content", "B) HVAC efficiency", "C) Equilibrium moisture content", "D) Psychrometric readings"], answer: "B" },
        { question: "How often should moisture readings be recorded?", options: ["A) Once at the start", "B) Every 12 hours", "C) Every 24 hours", "D) Only when drying is complete"], answer: "C" },
        { question: "What happens when a room is over-dried?", options: ["A) Faster drying", "B) Structural damage", "C) Increased relative humidity", "D) Lower GPP"], answer: "B" },
        { question: "Which of the following is a sign of secondary water damage?", options: ["A) Peeling paint", "B) High dew point", "C) Excess airflow", "D) Lower temperature"], answer: "A" },
        { question: "What is the function of a HEPA filter in a restoration setup?", options: ["A) Removes airborne particles", "B) Increases evaporation", "C) Reduces humidity", "D) Heats the air"], answer: "A" },
        { question: "What type of dehumidifier works best in low-humidity environments?", options: ["A) LGR", "B) Conventional", "C) Desiccant", "D) Air scrubber"], answer: "C" },
        { question: "What should be done if mold is discovered during a water restoration job?", options: ["A) Continue drying as planned", "B) Stop work and consult a specialist", "C) Apply extra air movers", "D) Increase temperature only"], answer: "B" },
        { question: "What is the acceptable moisture content for drywall after drying?", options: ["A) 6-10%", "B) 12-16%", "C) 18-22%", "D) 24-28%"], answer: "B" },
        { question: "Which factor affects the evaporation rate the most?", options: ["A) Temperature and airflow", "B) Equipment brand", "C) Insurance policy", "D) Type of carpet"], answer: "A" },
        { question: "What is the purpose of a desiccant dehumidifier?", options: ["A) Remove large amounts of moisture in low humidity conditions", "B) Increase temperature", "C) Improve air circulation", "D) Reduce airflow"], answer: "A" },
        { question: "Which drying method is best for dense materials such as hardwood floors?", options: ["A) Conventional drying", "B) LGR dehumidification", "C) Injectidry system (vacuum drying)", "D) Air movers only"], answer: "C" },
        { question: "How does an LGR dehumidifier differ from a conventional dehumidifier?", options: ["A) Uses a heat exchanger for better efficiency", "B) Slower moisture removal", "C) Only operates at high humidity", "D) Requires no airflow"], answer: "A" },
        { question: "What is a potential hazard when using air movers incorrectly?", options: ["A) Spreading contaminants", "B) Reducing evaporation", "C) Lowering temperature too much", "D) Reducing drying efficiency"], answer: "A" },
        { question: "What role does equilibrium moisture content (EMC) play in drying?", options: ["A) Determines when drying is complete", "B) Prevents mold growth", "C) Improves airflow", "D) Controls room temperature"], answer: "A" },
        { question: "What is a key sign that a building is fully dried?", options: ["A) No visible water", "B) Moisture levels match unaffected areas", "C) Temperature is stable", "D) Odors disappear"], answer: "B" },
        { question: "Why is negative air pressure used in mold remediation?", options: ["A) Prevents contamination spread", "B) Dries materials faster", "C) Increases HVAC efficiency", "D) Maintains temperature"], answer: "A" },
        { question: "Which drying method is best for dense materials such as brick and plaster?", options: ["A) Air movers only", "B) Conventional drying", "C) LGR dehumidification", "D) Desiccant drying"], answer: "D" },
        { question: "What is the primary purpose of a containment barrier in water damage restoration?", options: ["A) Improve drying speed", "B) Prevent cross-contamination", "C) Reduce air movement", "D) Lower room temperature"], answer: "B" },
        { question: "Which of the following can indicate a hidden water leak?", options: ["A) Increased energy bill", "B) Peeling paint", "C) Mold growth", "D) All of the above"], answer: "D" },
        { question: "What is the best way to measure moisture in deep structural materials?", options: ["A) Pinless moisture meter", "B) Pin-type moisture meter", "C) Psychrometric chart", "D) Temperature sensor"], answer: "B" },
        { question: "Which tool is most commonly used to determine if structural materials are drying effectively?", options: ["A) Thermal imaging camera", "B) Moisture meter", "C) Psychrometric calculator", "D) Air mover"], answer: "B" },
        { question: "How do air scrubbers improve indoor air quality during water damage restoration?", options: ["A) Removing dust and mold spores", "B) Heating the air", "C) Increasing humidity", "D) Reducing temperature"], answer: "A" },
        { question: "What should technicians document daily on a drying job?", options: ["A) Temperature and humidity readings", "B) Moisture content of materials", "C) Equipment placement and adjustments", "D) All of the above"], answer: "D" },
        { question: "Which factor has the biggest impact on how quickly materials dry?", options: ["A) Size of the affected area", "B) Number of technicians on-site", "C) Airflow, temperature, and humidity", "D) Insurance policy details"], answer: "C" },
        { question: "What does a grain depression indicate in drying?", options: ["A) The difference between intake and exhaust GPP", "B) A drop in temperature", "C) An increase in relative humidity", "D) Moisture saturation in wood"], answer: "A" },
        { question: "Why should drying equipment be removed gradually from a job site?", options: ["A) Prevents secondary damage", "B) Saves electricity", "C) Avoids over-drying", "D) Reduces labor costs"], answer: "A" },
        { question: "Grandma's water heater flooded her 20x18x10 living room, 14x12x10 bedroom, and 10x8x10 laundry room. It's a Class 2 loss, and you're using 70 PPD LGRs. How many dehumidifiers are needed?", options: ["A) 1", "B) 2", "C) 3", "D) 4"], answer: "B" },
        { question: "At BriteSmile Dental, a sprinkler flood hit 15x12x10 Exam Room 1, Exam Room 2, a 25x6x10 hallway, and a 20x15x10 waiting room. It’s a Class 1 loss with 110 PPD LGRs. How many dehus are needed?", options: ["A) 1", "B) 2", "C) 3", "D) 4"], answer: "A" },
        { question: "A lightning storm floods a 50x30x10 main floor, 20x16x10 fitting room, and 12x10x10 break room at a boutique. Class 2 water with 70 PPD LGRs. How many dehumidifiers are needed?", options: ["A) 3", "B) 4", "C) 5", "D) 6"], answer: "D" },
        { question: "At Little Sprouts Preschool, a pipe burst flooded the 30x25x9 playroom, 20x16x9 nap room, and 10x8x9 restroom. Class 3 loss using 70 PPD LGRs. How many dehus do you need?", options: ["A) 3", "B) 4", "C) 5", "D) 6"], answer: "B" },
        { question: "At Grounds & Glory Café, a leak soaked the 30x20x10 customer area, 18x15x10 kitchen, and 10x6x10 storage. It’s a Class 2 loss. Using 70 PPD LGRs, how many dehumidifiers are required?", options: ["A) 2", "B) 3", "C) 4", "D) 5"], answer: "A" },
        { question: "A small office floods: 25x15x9 workspace, 20x12x9 break room, and 10x8x9 storage room. It’s a Class 2 loss using 70 PPD LGRs. How many dehumidifiers are required?", options: ["A) 2", "B) 3", "C) 4", "D) 5"], answer: "B" }, // Total: 6,165 cu ft ÷ 50 = 123.3 ÷ 70 = 1.76 → 2
        { question: "A hotel wing floods: 2 guest rooms each 20x15x10, and a hallway 60x6x10. It’s a Class 1 water loss, and you’re using 110 PPD LGRs. How many dehus are needed?", options: ["A) 1", "B) 2", "C) 3", "D) 4"], answer: "A" }, // 10,800 cu ft ÷ 100 = 108 ÷ 110 = ~1
        { question: "Which of the following best defines AHAM in the restoration field?", options: ["A) Water extraction protocol", "B) Energy efficiency label", "C) Standard moisture testing level", "D) Dehumidifier performance under controlled conditions"], answer: "D" },
        { question: "A crawlspace measures 40x10x3 feet with standing water. It’s a Class 3 loss. You're using 70 PPD LGRs. How many units are needed?", options: ["A) 1", "B) 2", "C) 3", "D) 4"], answer: "A" }, // 1,200 cu ft ÷ 40 = 30 ÷ 70 = <1
        { question: "Which tool would you use to verify if a material has reached its drying goal?", options: ["A) Thermal imaging camera", "B) Psychrometric calculator", "C) Moisture meter", "D) Anemometer"], answer: "C" },
        { question: "What is the AHAM value for a 30x20x10 ft room with Class 2 conditions?", options: ["A) 60", "B) 120", "C) 200", "D) 300"], answer: "B" }, // 6,000 cu ft ÷ 50 = 120
        { question: "What should you do before placing dehumidifiers on a job site?", options: ["A) Start air movers", "B) Check insurance documents", "C) Measure the affected volume and classify the loss", "D) Turn off electricity"], answer: "C" },
        { question: "A 40x25x12 ft lobby and a 20x20x12 reception area are soaked in a Class 1 event. Using 110 PPD LGRs, how many dehus are needed?", options: ["A) 2", "B) 3", "C) 4", "D) 5"], answer: "A" }, // Total = 18,000 cu ft ÷ 100 = 180 ÷ 110 = 1.63 → 2
        { question: "What’s the formula to calculate cubic footage of a room?", options: ["A) Length + Width + Height", "B) Length × Width × Height", "C) Height × Perimeter", "D) Square footage × ACH"], answer: "B" },
        { question: "What does 'LGR' stand for in dehumidification?", options: ["A) Low Grade Recovery", "B) Large Grain Reduction", "C) Low Grain Refrigerant", "D) Long Grain Radiant"], answer: "C" },
        { question: "All restorers should follow the standard of care for the water restoration profession developed by the restoration industry entitled the IICRC ____.", options: ["A) S400", "B) S520","C) S500", "D) S600"], answer: "C" },
        { question: "Federal regulations apply to the handling of ____ based paint and asbestos.", options: ["A) Lead", "B) Zinc", "C) Mercury", "D) Latex"], answer: "A" }





    ];
    
    
    let currentQuestionIndex = 0;
    let score = 0;
    
    document.addEventListener("DOMContentLoaded", function () {
        const questionElement = document.getElementById("question");
        const optionsContainer = document.getElementById("quiz-options");
        const feedbackElement = document.getElementById("feedback");
        const nextButton = document.getElementById("next-button");
        const restartButton = document.getElementById("restart-button");
        const scoreElement = document.getElementById("score");
    
        function shuffleQuestions() {
            questions.sort(() => Math.random() - 0.5); // Randomizes questions each restart
        }
    
        function loadQuestion() {
            if (currentQuestionIndex >= questions.length) {
                showResults();
                return;
            }
    
            const currentQuestion = questions[currentQuestionIndex];
            questionElement.textContent = currentQuestion.question;
            optionsContainer.innerHTML = "";
    
            currentQuestion.options.forEach((option) => {
                const optionButton = document.createElement("button");
                optionButton.textContent = option;
                optionButton.classList.add("option-button");
                optionButton.dataset.choice = option.charAt(0);
                optionButton.onclick = () => checkAnswer(optionButton);
                optionsContainer.appendChild(optionButton);
            });
    
            feedbackElement.textContent = "";
            nextButton.style.display = "none";
        }
    
        function checkAnswer(selectedButton) {
            const correctAnswer = questions[currentQuestionIndex].answer;
            const userChoice = selectedButton.dataset.choice;
    
            document.querySelectorAll(".option-button").forEach(button => {
                button.disabled = true;
                button.style.cursor = "not-allowed";
            });
    
            if (userChoice === correctAnswer) {
                selectedButton.style.backgroundColor = "green";
                feedbackElement.textContent = "Correct";
                feedbackElement.style.color = "green";
                score++;
            } else {
                selectedButton.style.backgroundColor = "red";
                feedbackElement.textContent = "Incorrect";
                feedbackElement.style.color = "red";
            }
    
            scoreElement.textContent = `Score: ${score} / ${questions.length}`;
            nextButton.style.display = "block";
            nextButton.classList.add("fade-in");

        }
    
        function nextQuestion() {
            currentQuestionIndex++;
            loadQuestion();
        }
    
        function showResults() {
            questionElement.textContent = `Quiz Complete! Your final score: ${score} / ${questions.length}`;
            optionsContainer.innerHTML = "";
            feedbackElement.textContent = "";
            nextButton.style.display = "none";
            restartButton.style.display = "block";
        }
    
        function restartQuiz() {
            currentQuestionIndex = 0;
            score = 0;
            scoreElement.textContent = `Score: 0 / ${questions.length}`;
            restartButton.style.display = "none";
            shuffleQuestions(); // Randomize questions
            loadQuestion();
        }

        
    
        nextButton.addEventListener("click", nextQuestion);
        restartButton.addEventListener("click", restartQuiz);
    
        shuffleQuestions(); // Randomize questions on first load
        loadQuestion();
    });
    