
// Mock survey data
// Each question can have: id, question, type, options (if multiple choice)
const mockSurveyData = [
    {
      id: 1,
      question: "What's your favorite color?",
      type: "text",
    },
    {
      id: 2,
      question: "Which country do you live in?",
      type: "text",
    },
    {
      id: 3,
      question: "Select your favorite fruits:",
      type: "checkbox",
      options: ["Apple", "Banana", "Cherry", "Date"]
    },
    {
      id: 4,
      question: "How satisfied are you with our service?",
      type: "radio",
      options: [
        "Very Satisfied",
        "Satisfied",
        "Neutral",
        "Unsatisfied",
        "Very Unsatisfied"
      ]
    }
  ];
  
  let currentQuestionIndex = 0;
  let userResponses = [];
  
  // DOM elements
  const welcomeSection = document.getElementById('welcome-section');
  const surveySection = document.getElementById('survey-section');
  const thankYouSection = document.getElementById('thank-you-section');
  const startBtn = document.getElementById('start-survey-btn');
  const submitBtn = document.getElementById('submit-answer-btn');
  const questionText = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');
  
  // Function to show a question
  function showQuestion(index) {
    const questionObj = mockSurveyData[index];
    questionText.textContent = questionObj.question;
  
    // Clear any old options
    optionsContainer.innerHTML = '';
  
    // Display input(s) based on question type
    if (questionObj.type === 'text') {
      // Single text input
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-control';
      input.id = 'answer-input';
      optionsContainer.appendChild(input);
    } 
    else if (questionObj.type === 'checkbox') {
      // Checkboxes for each option
      questionObj.options.forEach((option, idx) => {
        const div = document.createElement('div');
        div.className = 'form-check';
        div.innerHTML = `
          <input 
            class="form-check-input" 
            type="checkbox" 
            name="checkboxOptions" 
            id="checkbox_${idx}" 
            value="${option}"
          >
          <label 
            class="form-check-label" 
            for="checkbox_${idx}"
          >
            ${option}
          </label>
        `;
        optionsContainer.appendChild(div);
      });
    } 
    else if (questionObj.type === 'radio') {
      // Radio buttons for each option
      questionObj.options.forEach((option, idx) => {
        const div = document.createElement('div');
        div.className = 'form-check';
        div.innerHTML = `
          <input 
            class="form-check-input" 
            type="radio" 
            name="radioOptions" 
            id="radio_${idx}" 
            value="${option}"
          >
          <label 
            class="form-check-label" 
            for="radio_${idx}"
          >
            ${option}
          </label>
        `;
        optionsContainer.appendChild(div);
      });
    }
  }
  
  // "Start Survey" button click handler
  startBtn.addEventListener('click', () => {
    welcomeSection.classList.add('hidden');   // hide welcome
    surveySection.classList.remove('hidden'); // show survey
    currentQuestionIndex = 0;
    showQuestion(currentQuestionIndex);
  });
  
  // "Submit Answer" button click handler
  submitBtn.addEventListener('click', () => {
    const questionObj = mockSurveyData[currentQuestionIndex];
    let response;
  
    // Collect user's response based on question type
    if (questionObj.type === 'text') {
      const input = document.getElementById('answer-input');
      response = input.value;
    } 
    else if (questionObj.type === 'checkbox') {
      const checkboxes = document.getElementsByName('checkboxOptions');
      response = [];
      checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          response.push(checkbox.value);
        }
      });
    }
    else if (questionObj.type === 'radio') {
      const radios = document.getElementsByName('radioOptions');
      radios.forEach((radio) => {
        if (radio.checked) {
          response = radio.value;
        }
      });
    }
  
    // Store response
    userResponses.push({
      questionId: questionObj.id,
      answer: response
    });
  
    // Move to the next question
    currentQuestionIndex++;
    if (currentQuestionIndex < mockSurveyData.length) {
      showQuestion(currentQuestionIndex);
    } else {
      // No more questions - show Thank You
      surveySection.classList.add('hidden');
      thankYouSection.classList.remove('hidden');
  
      // For debugging, you can check the user's responses:
      console.log("User Responses:", userResponses);
    }
  });