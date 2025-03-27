let score = 0;
let currentIndex = 0;
let timer = null;
let timeLeft = 15;
let isTimedMode = false;



function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startQuiz() {
    stopTimer(); // prevent leftover timer from previous mode
    score = 0;
    currentIndex = 0;
  
    shuffle(questions);
    document.getElementById('score').textContent = `Score: ${score} / ${questions.length}`;
    document.getElementById('achievements').textContent = "";
    document.getElementById('final-grade').textContent = "";
  
    showQuestion();
  }
  
  
  
  

  function showQuestion() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = "";
  
    if (currentIndex >= questions.length) {
      gradeTest();
      return;
    }
  
    const q = questions[currentIndex];
    const div = document.createElement('div');
    div.className = "question";
  
    const title = document.createElement('h2');
    title.textContent = `${currentIndex + 1}. ${q.question}`;
    div.appendChild(title);
  
    const ul = document.createElement('ul');
    const options = [...q.options];
    shuffle(options);
  
    options.forEach(option => {
      const li = document.createElement('li');
      li.textContent = option;
      li.onclick = () => {
        stopTimer();
        checkAnswer(li, option === q.correct, ul);
      };
      ul.appendChild(li);
    });
  
    div.appendChild(ul);
    container.appendChild(div);
  
    if (isTimedMode) {
      startTimer();
    } else {
      document.getElementById('timer').textContent = "";
    }
  }
  function startTimer() {
    timeLeft = 15;
    document.getElementById('timer').textContent = `Time Left: ${timeLeft}s`;
  
    timer = setInterval(() => {
      timeLeft--;
      document.getElementById('timer').textContent = `Time Left: ${timeLeft}s`;
  
      if (timeLeft <= 0) {
        clearInterval(timer);
        document.getElementById('timer').textContent = "Time's up!";
        autoFailQuestion();
      }
    }, 1000);
  }
  
  function stopTimer() {
    clearInterval(timer);
    timer = null;
    document.getElementById('timer').textContent = "";
  }
  

  function autoFailQuestion() {
    const container = document.querySelector('.question ul');
    const correctOption = Array.from(container.children).find(li => li.textContent === questions[currentIndex].correct);
  
    container.childNodes.forEach(li => li.onclick = null);
  
    correctOption?.classList.add('correct');
  
    setTimeout(() => {
      currentIndex++;
      showQuestion();
    }, 1000);
  }


function checkAnswer(element, isCorrect, ul) {
  const siblings = ul.children;
  for (let i = 0; i < siblings.length; i++) {
    siblings[i].onclick = null;
  }

  if (isCorrect) {
    score++;
    element.classList.add('correct');
    element.innerHTML += " ✅ Correct!";
    checkAchievements();
  } else {
    element.classList.add('wrong');
    element.innerHTML += " ❌ Incorrect!";
  }

  document.getElementById('score').textContent = `Score: ${score} / ${questions.length}`;

  setTimeout(() => {
    currentIndex++;
    showQuestion();
  }, 1000);
}

function checkAchievements() {
  if (score === 5) {
    showBanner("Achievement Unlocked: Mold Buster Apprentice!");
  } else if (score === 10) {
    showBanner("Achievement Unlocked: Remediation Ranger!");
  } else if (score === 15) {
    showBanner("Achievement Unlocked: Containment Commander!");
  } else if (score === questions.length) {
    showBanner("Achievement Unlocked: Certified Mold Slayer! Perfect Score!");
  }
}

function showBanner(text) {
  const banner = document.getElementById('achievement-banner');
  banner.textContent = text;
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), 4000);
}

function gradeTest() {
  const gradeBox = document.getElementById('final-grade');
  const percent = (score / questions.length) * 100;
  let letter = "";
  let message = "";

  if (percent >= 90) {
    letter = "A";
    message = "Master Mold Mage";
  } else if (percent >= 80) {
    letter = "B";
    message = "HEPA Hero";
  } else if (percent >= 70) {
    letter = "C";
    message = "Certified Sprayer";
  } else if (percent >= 60) {
    letter = "D";
    message = "Dust Mask Rookie";
  } else {
    letter = "F";
    message = "You let the mold win...";
  }

  gradeBox.innerText = `Final Grade: ${letter} – ${message}`;
}

function resetQuiz() {
    stopTimer(); // kill active timer before reset
    startQuiz();
  }
  
  

document.addEventListener('DOMContentLoaded', () => {
  startQuiz(false); // Default to normal mode on load
});

