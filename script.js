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

function displayQuestion(number, question, correctAnswers, incorrectAnswers) {
    const questionsContainer = document.getElementById('questionsContainer');
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.style.margin = '20px 0';  // Add margin to the question
    questionDiv.style.padding = '10px';  // Add padding to the question

    const questionText = document.createElement('h3');
    questionText.innerHTML = `<strong>${number}. Otázka</strong> <br>${question.replace(/(\w)\^(\w+)/g, '$1<sup>$2</sup>')}`;
    questionDiv.appendChild(questionText);

    // Check if there are both correct and incorrect answers
    if (correctAnswers.length > 0 && incorrectAnswers.length > 0) {
        let answers = [correctAnswers[0]];  // Start with the first correct answer

        // Add the first incorrect answer if there is one
        if (incorrectAnswers.length > 0) {
            answers.push(incorrectAnswers[0]);
        }

        // Add the rest of the answers
        let remainingAnswers = correctAnswers.slice(1).concat(incorrectAnswers.slice(1));
        while (answers.length < 4 && remainingAnswers.length > 0) {
            let randomIndex = Math.floor(Math.random() * remainingAnswers.length);
            answers.push(remainingAnswers[randomIndex]);
            remainingAnswers.splice(randomIndex, 1);  // Remove the selected answer from the remaining answers
        }

        // Shuffle the answers to be displayed
        answers = shuffle(answers);

        answers.forEach((answer, index) => {
            const answerDiv = document.createElement('div');
            answerDiv.className = 'form-check';
            answerDiv.style.margin = '10px 15px';  // Add margin to the answer
            answerDiv.style.padding = '5px';  // Add padding to the answer

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = `q${number}`;
            input.id = `q${number}a${index}`;
            input.className = 'form-check-input';
            answerDiv.appendChild(input);

            const label = document.createElement('label');
            label.htmlFor = `q${number}a${index}`;
            label.className = 'form-check-label';
            // Replace "letter^something" with "letter<sup>something</sup>"
            label.innerHTML = answer.replace(/(\w)\^(\w+)/g, '$1<sup>$2</sup>');
            answerDiv.appendChild(label);

            questionDiv.appendChild(answerDiv);
        });
    } else {
        const paragraph = document.createElement('p');
        paragraph.textContent = "No incorrect options right now";
        questionDiv.appendChild(paragraph);
    }

    questionsContainer.appendChild(questionDiv);
}


function displayQuestions() {
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = '';
    questions.slice(0, document.querySelector('#numQuestions').value || questions.length).forEach((question, index) => {
        displayQuestion(index + 1, question.question, question.correctAnswers, question.incorrectAnswers);
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
