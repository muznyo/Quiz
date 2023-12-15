document.addEventListener("DOMContentLoaded", function () {
    changeMode();  // Call the changeMode function here
});

let questions = [];

function loadFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const contents = e.target.result;
        parseQuestions(contents);
    };

    reader.readAsText(file);
}

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function parseQuestions(data) {
    const lines = data.split('\n');
    questions = [];
    let currentQuestion = null;

    lines.forEach(line => {
        switch (line[0]) {
            case '#':
                currentQuestion = {
                    question: line.slice(1).trim(),
                    correctAnswers: [],
                    incorrectAnswers: []
                };
                questions.push(currentQuestion);
                break;
            case '&':
                currentQuestion.correctAnswers.push(line.slice(1).trim().replace(/(\w)\^(\w+)/g, '$1<sup>$2</sup>'));
                break;
            case '!':
                currentQuestion.incorrectAnswers.push(line.slice(1).trim().replace(/(\w)\^(\w+)/g, '$1<sup>$2</sup>'));
                break;
        }
    });

    questions = shuffle(questions);

    displayQuestions();
}

function createElement(tag, attributes, children) {
    const element = document.createElement(tag);
    for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    if (children) {
        element.innerHTML = children;
    }
    return element;
}

function displayQuestion(number, { question, correctAnswers, incorrectAnswers }) {
    const questionDiv = createElement('div', { class: 'question', style: 'margin: 20px 0; padding: 10px' }, `
        <h3><strong>${number}. Otázka</strong> <br>${question.replace(/(\w)\^(\w+)/g, '$1<sup>$2</sup>')}</h3>
        ${correctAnswers.length > 0 && incorrectAnswers.length > 0 ? '<p>Answers are available</p>' : '<p>No incorrect options right now</p>'}
    `);
    questionsContainer.appendChild(questionDiv);
}

function displayQuestions() {
    questionsContainer.innerHTML = '';
    questions.slice(0, document.querySelector('#numQuestions').value || questions.length).forEach((question, index) => {
        displayQuestion(index + 1, question);
    });
}

function checkAnswers() {
    questions.forEach((question, questionIndex) => {
        const inputs = document.querySelectorAll(`input[name="q${questionIndex + 1}"]`);

        inputs.forEach((input, answerIndex) => {
            const label = document.querySelector(`label[for="q${questionIndex + 1}a${answerIndex}"]`);
            const isCorrect = question.correctAnswers.includes(label.innerHTML);

            // Add class to the label based on whether the answer is correct or not
            if (isCorrect) {
                label.classList.add('correct-answer');
            } else {
                label.classList.add('incorrect-answer');
            }
        });
    });
} document.querySelector('#themeSelector').addEventListener('change', function () {
    const theme = this.value;
    const navbar = document.querySelector('#navbar');
    navbar.className = '';  // Remove all current classes
    navbar.classList.add('d-flex', 'justify-content-between', 'p-3', theme);
});

function changeMode() {
    const selectedMode = document.getElementById('darkModeSelect').value;
    const navbar = document.querySelector('#navbar');
    if (selectedMode === 'system') {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.className = isDarkMode ? 'dark-mode' : '';
        navbar.className = isDarkMode ? 'bg-dark' : 'bg-light';
    } else {
        document.body.className = selectedMode === 'dark' ? 'dark-mode' : '';
        navbar.className = selectedMode === 'dark' ? 'bg-dark' : 'bg-light';
    }
    navbar.classList.add('d-flex', 'justify-content-between', 'p-3');
}
function refreshQuestions() {
    // Shuffle the questions before displaying them
    questions = shuffle(questions);

    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = '';
    displayQuestions();
}
