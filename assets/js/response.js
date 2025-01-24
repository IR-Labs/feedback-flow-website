// Mock survey data (can be easily replaced with API call response structure)
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

// Function to collect user response based on question type
function collectResponse(questionObj) {
    let response;
    switch (questionObj.type) {
        case 'text': {
            const input = document.getElementById('answer-input');
            response = input.value;
            break;
        }
        case 'checkbox': {
            const checkboxes = document.getElementsByName('checkboxOptions');
            response = [];
            checkboxes.forEach((checkbox) => {
                if (checkbox.checked) {
                    response.push(checkbox.value);
                }
            });
            break;
        }
        case 'radio': {
            const radios = document.getElementsByName('radioOptions');
            radios.forEach((radio) => {
                if (radio.checked) {
                    response = radio.value;
                }
            });
            break;
        }
        default:
            response = null; // Handle cases where question type is not recognized
    }
    return response;
}

// Function to simulate submitting answer to server and getting next question
async function submitAnswerToServer(questionObj, answer) {
    return new Promise(resolve => {
        // Simulate network request delay (e.g., 500ms to 1 second)
        setTimeout(() => {
            // Simulate server-side processing:
            userResponses.push({
                questionId: questionObj.id,
                answer: answer
            });

            currentQuestionIndex++; // Move to next question index

            let nextQuestionData = null;
            if (currentQuestionIndex < mockSurveyData.length) {
                nextQuestionData = mockSurveyData[currentQuestionIndex]; // "Server" sends next question
            } else {
                nextQuestionData = { type: 'thank-you' }; // "Server" signals end of survey
            }
            resolve(nextQuestionData); // Resolve promise with "server response"
        }, 800); // Simulate 800ms server processing time
    });
}


// Function to show a question
function showQuestion(questionData) {
    if (!questionData || questionData.type === 'thank-you') {
        // Handle end of survey or invalid question data
        surveySection.classList.add('hidden');
        thankYouSection.classList.remove('hidden');
        console.log("User Responses:", userResponses); // Final responses

        // Optionally reset for a new survey if needed:
        currentQuestionIndex = 0;
        userResponses = [];

        return; // Exit function if no question data or thank you
    }

    questionText.textContent = questionData.question;
    optionsContainer.innerHTML = ''; // Clear old options

    switch (questionData.type) {
        case 'text': {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.id = 'answer-input';
            optionsContainer.appendChild(input);
            break;
        }
        case 'checkbox': {
            questionData.options.forEach((option, idx) => {
                const div = document.createElement('div');
                div.className = 'form-check';

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.className = 'form-check-input';
                input.name = 'checkboxOptions';
                input.id = `checkbox_${idx}`;
                input.value = option;

                const label = document.createElement('label');
                label.className = 'form-check-label';
                label.htmlFor = `checkbox_${idx}`;
                label.textContent = option;

                div.appendChild(input);
                div.appendChild(label);
                optionsContainer.appendChild(div);
            });
            break;
        }
        case 'radio': {
            questionData.options.forEach((option, idx) => {
                const div = document.createElement('div');
                div.className = 'form-check';

                const input = document.createElement('input');
                input.type = 'radio';
                input.className = 'form-check-input';
                input.name = 'radioOptions';
                input.id = `radio_${idx}`;
                input.value = option;

                const label = document.createElement('label');
                label.className = 'form-check-label';
                label.htmlFor = `radio_${idx}`;
                label.textContent = option;

                div.appendChild(input);
                div.appendChild(label);
                optionsContainer.appendChild(div);
            });
            break;
        }
        default: {
            console.error("Unknown question type:", questionData.type);
        }
    }
}


// "Start Survey" button click handler
startBtn.addEventListener('click', () => {
    welcomeSection.classList.add('hidden');
    surveySection.classList.remove('hidden');
    currentQuestionIndex = 0;
    showQuestion(mockSurveyData[currentQuestionIndex]); // Show the first question
});

// "Submit Answer" button click handler
submitBtn.addEventListener('click', async () => {
    const currentQuestion = mockSurveyData[currentQuestionIndex];
    const answer = collectResponse(currentQuestion);

    if (answer !== null) { // Only submit if response is collected
        submitBtn.disabled = true; // Disable submit during server call (optional)
        submitBtn.textContent = "Submitting..."; // Indicate submission (optional)

        const nextQuestionData = await submitAnswerToServer(currentQuestion, answer); // Wait for "server" response

        submitBtn.disabled = false; // Re-enable submit (optional)
        submitBtn.textContent = "Submit Answer"; // Reset button text (optional)

        showQuestion(nextQuestionData); // Show next question based on "server" response
    } else {
        console.warn("No answer collected for question type:", currentQuestion.type);
        // Optionally provide user feedback that an answer is needed
    }
});
