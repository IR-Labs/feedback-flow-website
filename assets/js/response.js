// DOM elements
const welcomeSection = document.getElementById('welcome-section');
const surveySection = document.getElementById('survey-section');
const thankYouSection = document.getElementById('thank-you-section');
const startBtn = document.getElementById('start-survey-btn');
const submitBtn = document.getElementById('submit-answer-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const loader = document.getElementById('loader');

// Add references for the error alert
const errorAlert = document.getElementById('error-alert');

// Track the current question object
let currentQuestion = null;

// Keep all messages in an array
let allMessages = [];

/**
 * Utility to show error messages in the alert box
 * @param {string} message
 */
function showError(message) {
    errorAlert.textContent = message;
    errorAlert.classList.remove('d-none');
    errorAlert.style.display = 'block';
}

/**
 * Utility to hide the error alert
 */
function hideError() {
    errorAlert.textContent = '';
    errorAlert.classList.add('d-none');
    errorAlert.style.display = 'none';
}

/**
 * Collects user response from the DOM based on the question type.
 * @param {object} questionObj - The question object that includes "questionType" and "possibleChoices".
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
            // If no checkboxes are selected, response stays an empty array
            break;
        }

        case 'single_choice': {
            const radios = document.getElementsByName('radioOptions');
            radios.forEach((radio) => {
                if (radio.checked) {
                    response = radio.value;
                }
            });
            // If no radio button is selected, response stays null
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
 */
async function submitAnswerToServer(answer) {
    try {
        // Build the request body
        const requestBody = {
            lastMessages: allMessages // all answers so far
        };

        console.log('Request Body:', requestBody);

        // Show loader while waiting
        loader.classList.remove('d-none');

        // Make the fetch call
        const response = await fetch(
            'https://fqq2171wy2.execute-api.ap-south-1.amazonaws.com/submit-answer',
            {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            console.error('API request failed:', response.status);
            return null;
        }

        const responseData = await response.json();
        console.log('API Response:', responseData);

        // Store question in messages
        allMessages.push({
            text: responseData.question,
            isSentByUser: false
        });

        return responseData;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    } finally {
        // Hide loader
        loader.classList.add('d-none');
    }
}

/**
 * Displays a question in the UI. 
 */
function showQuestion(questionData) {
    // If null or no question data or last question => show thank you
    if (!questionData || questionData.isLastQuestion) {
        surveySection.classList.add('hidden');
        thankYouSection.classList.remove('hidden');
        console.log("All messages:", allMessages);

        // Optionally reset logic if needed
        currentQuestion = null;
        allMessages = [];
        return;
    }

    currentQuestion = questionData;

    // Clear out the error alert (in case it was showing previously)
    hideError();

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

// "Start Survey" button
startBtn.addEventListener('click', async () => {
    welcomeSection.classList.add('hidden');
    surveySection.classList.remove('hidden');

    // Get the first question from the server
    const firstQuestion = await submitAnswerToServer(null);
    showQuestion(firstQuestion);
});

// "Submit Answer" button
submitBtn.addEventListener('click', async () => {
    if (!currentQuestion) {
        console.warn("No current question to submit.");
        return;
    }

    // Collect user answer
    const answer = collectResponse(currentQuestion);

    // Clear any previous error
    hideError();

    // Check if the user actually gave an answer
    //  For text questions: answer is null if empty
    //  For single_choice: answer is null if no radio selected
    //  For multiple_choice: answer is an array, so check length === 0
    if (
        !answer ||                 // covers null, empty string
        (Array.isArray(answer) && answer.length === 0)
    ) {
        showError('Please provide an answer before submitting!');
        return; // Stop here
    }

    // Store user response in local messages
    allMessages.push({
        text: Array.isArray(answer) ? answer.join(', ') : answer.toString(),
        isSentByUser: true
    });

    // Disable submit to prevent spamming
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    // Submit answer to the server
    const nextQuestionData = await submitAnswerToServer(answer);

    // Re-enable submit
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Answer";

    // Show next question (or thank you if last)
    showQuestion(nextQuestionData);
});