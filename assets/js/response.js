// DOM elements
const welcomeSection = document.getElementById('welcome-section');
const surveySection = document.getElementById('survey-section');
const thankYouSection = document.getElementById('thank-you-section');
const startBtn = document.getElementById('start-survey-btn');
const submitBtn = document.getElementById('submit-answer-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');

// Track the current question object (as returned by API)
let currentQuestion = null;

// Keep all messages in an array
let allMessages = [];

/**
 * Collects user response from the DOM based on the question type.
 * @param {object} questionObj - The question object that includes "type" and "possibleChoices".
 * @returns {string|array|null} - The user response.
 */
function collectResponse(questionObj) {
  let response = null;

  switch (questionObj.questionType) {
    case 'text': {
      const input = document.getElementById('answer-input');
      response = input.value.trim() || null;
      break;
    }

    case 'multiple_choice': {
      const checkboxes = document.getElementsByName('checkboxOptions');
      response = [];
      checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          response.push(checkbox.value);
        }
      });
      // If nothing selected, this will be an empty array. Adjust if you prefer null.
      break;
    }

    case 'single_choice': {
      const radios = document.getElementsByName('radioOptions');
      radios.forEach((radio) => {
        if (radio.checked) {
          response = radio.value;
        }
      });
      break;
    }

    default:
      console.error("Unknown question type:", questionObj.type);
      break;
  }

  return response;
}

/**
 * Makes a request to your API. 
 * The request now also includes the entire array of all user responses so far.
 *
 * The response from the API is assumed to contain fields:
 *   - question
 *   - type ('text' | 'multiple_choice' | 'single_choice')
 *   - possibleChoices (array) for multiple/single choice
 *   - isLastQuestion (boolean)
 * 
 * Adjust the request/response structure based on your real API.
 *
 * @param {any} answer - The user's answer for the current question.
 * @returns {object|null} - The next question object or null on error.
 */
async function submitAnswerToServer(answer) {
  try {
    // Build the request body
    // Now sending all user responses in 'allResponses'
    const requestBody = {
        lastMessages: allMessages // all answers so far
    };

    console.log('Request Body:', requestBody);

    // Make the fetch call
    const response = await fetch('https://fqq2171wy2.execute-api.ap-south-1.amazonaws.com/submit-answer', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('API request failed:', response.status);
      return null;
    }

    const responseData = await response.json();
    console.log('API Response:', responseData);

    // Store question locally
    allMessages.push({
        text: responseData.question,
        isSentByUser: false
    });

    // Expected structure in responseData:
    // {
    //   question: string,
    //   type: 'text' | 'multiple_choice' | 'single_choice',
    //   possibleChoices: string[],
    //   isLastQuestion: boolean
    // }
    return responseData;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

/**
 * Displays a question in the UI. If isLastQuestion is true, shows thank-you section.
 * @param {object} questionData - The question data object from the API or null on error.
 */
function showQuestion(questionData) {
  // If null or no question data returned, or we have isLastQuestion = true => show "Thank you"
  if (!questionData || questionData.isLastQuestion) {
    surveySection.classList.add('hidden');
    thankYouSection.classList.remove('hidden');

    // For debugging or record-keeping
    console.log("All messages:", allMessages);

    // Optional: reset logic if you want to start again
    currentQuestion = null;
    allMessages = [];
    return;
  }

  // Store the current question
  currentQuestion = questionData;

  // Update UI elements
  questionText.textContent = questionData.question;
  optionsContainer.innerHTML = ''; // Clear old options

  switch (questionData.questionType) {
    case 'text': {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-control';
      input.id = 'answer-input';
      optionsContainer.appendChild(input);
      break;
    }

    case 'multiple_choice': {
      // Use questionData.possibleChoices
      (questionData.possibleChoices || []).forEach((choice, idx) => {
        const div = document.createElement('div');
        div.className = 'form-check';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'form-check-input';
        input.name = 'checkboxOptions';
        input.id = `checkbox_${idx}`;
        input.value = choice;

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `checkbox_${idx}`;
        label.textContent = choice;

        div.appendChild(input);
        div.appendChild(label);
        optionsContainer.appendChild(div);
      });
      break;
    }

    case 'single_choice': {
      // Use questionData.possibleChoices
      (questionData.possibleChoices || []).forEach((choice, idx) => {
        const div = document.createElement('div');
        div.className = 'form-check';

        const input = document.createElement('input');
        input.type = 'radio';
        input.className = 'form-check-input';
        input.name = 'radioOptions';
        input.id = `radio_${idx}`;
        input.value = choice;

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `radio_${idx}`;
        label.textContent = choice;

        div.appendChild(input);
        div.appendChild(label);
        optionsContainer.appendChild(div);
      });
      break;
    }

    default:
      console.error("Unknown question type:", questionData.questionType);
      break;
  }
}

// "Start Survey" button click handler
startBtn.addEventListener('click', async () => {
  // Hide welcome, show survey
  welcomeSection.classList.add('hidden');
  surveySection.classList.remove('hidden');

  // Make a call to the API with no answer to get the first question
  const firstQuestion = await submitAnswerToServer(null);

  // Show the question
  showQuestion(firstQuestion);
});

// "Submit Answer" button click handler
submitBtn.addEventListener('click', async () => {
  if (!currentQuestion) {
    console.warn("No current question to submit.");
    return;
  }

  // Collect user answer from the DOM
  const answer = collectResponse(currentQuestion);

  // Store user response locally
  allMessages.push({
    text: answer.toString(),
    isSentByUser: true
  });

  // Prevent submit spamming
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  // Submit all answers to the server to get the next question
  const nextQuestionData = await submitAnswerToServer(answer);

  // Re-enable submit button
  submitBtn.disabled = false;
  submitBtn.textContent = "Submit Answer";

  // Show the next question (or end if isLastQuestion)
  showQuestion(nextQuestionData);
});