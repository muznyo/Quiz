document.addEventListener("DOMContentLoaded", function () {
    changeMode();  // Call the changeMode function here
});

var questions = [];

function loadFile(event) {
    var file = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function (e) {
        var contents = e.target.result;
        parseQuestions(contents);
    };

    reader.readAsText(file);
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

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
    var parsedData = JSON.parse(data);
    questions = [];

    for (var i = 0; i < parsedData.length; i++) {
        var item = parsedData[i];
        var currentQuestion = {
            question: item.question,
            correctAnswers: item.right_answers.map(function (answer) {
                return answer.replace(/(\w)\^(\w+)/g, '$1<sup>$2</sup>').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/&lt;sup&gt;/g, '<sup>').replace(/&lt;\/sup&gt;/g, '</sup>');
            }),
            incorrectAnswers: item.wrong_answers.map(function (answer) {
                return answer.replace(/(\w)\^(\w+)/g, '$1<sup>$2</sup>').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/&lt;sup&gt;/g, '<sup>').replace(/&lt;\/sup&gt;/g, '</sup>');
            })
        };
        questions.push(currentQuestion);
    }
    questions = shuffle(questions);

    displayQuestions();
}

function createElement(tag, attributes, children) {
    var element = document.createElement(tag);
    for (var key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    if (children) {
        element.innerHTML = children;
    }
    return element;
}

function displayQuestion(number, question, correctAnswers, incorrectAnswers) {
    var questionsContainer = document.getElementById('questionsContainer');
    var questionDiv = document.createElement('div');
    questionDiv.id = 'q' + number; // Add an id to the questionDiv
    questionDiv.className = 'question';
    questionDiv.style.margin = '20px 0';  // Add margin to the question
    questionDiv.style.padding = '10px';  // Add padding to the question

    var questionText = document.createElement('h3');
    questionText.innerHTML = '<strong>' + number + '. Otázka</strong> <br>' + question.replace(/(\w)\^(\w+)/g, '$1<sup>$2</sup>').replace(/\n/g, '<br>');
    questionDiv.appendChild(questionText);

    // Check if there are both correct and incorrect answers
    if (correctAnswers.length > 0 && incorrectAnswers.length > 0) {
        var answers = [correctAnswers[0]];  // Start with the first correct answer

        // Add the first incorrect answer if there is one
        if (incorrectAnswers.length > 0) {
            answers.push(incorrectAnswers[0]);
        }

        // Add the rest of the answers
        var remainingAnswers = correctAnswers.slice(1).concat(incorrectAnswers.slice(1));
        while (answers.length < 4 && remainingAnswers.length > 0) {
            var randomIndex = Math.floor(Math.random() * remainingAnswers.length);
            answers.push(remainingAnswers[randomIndex]);
            remainingAnswers.splice(randomIndex, 1);  // Remove the selected answer from the remaining answers
        }

        // Shuffle the answers to be displayed
        answers = shuffle(answers);

        for (var i = 0; i < answers.length; i++) {
            var answer = answers[i];
            var answerDiv = document.createElement('div');
            answerDiv.className = 'form-check';
            answerDiv.style.margin = '10px 15px';  // Add margin to the answer
            answerDiv.style.padding = '5px';  // Add padding to the answer

            var input = document.createElement('input');
            input.type = 'checkbox';
            input.name = 'q' + number;
            input.id = 'q' + number + 'a' + i;
            input.className = 'form-check-input';
            answerDiv.appendChild(input);

            var label = document.createElement('label');
            label.htmlFor = 'q' + number + 'a' + i;
            label.className = 'form-check-label';
            // Replace "letter^something" with "letter<sup>something</sup>"
            label.innerHTML = answer.replace(/(\w)\^(\w+)/g, '$1<sup>$2</sup>').replace(/\n/g, '<br>');
            answerDiv.appendChild(label);

            questionDiv.appendChild(answerDiv);
        }
    } else {
        var paragraph = document.createElement('p');
        paragraph.innerText = "No incorrect options right now";
        questionDiv.appendChild(paragraph);
    }

    questionsContainer.appendChild(questionDiv);

    return questionDiv;
}

function displayQuestions() {
    var questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = '';
    var numQuestions = document.querySelector('#numQuestions').value || questions.length;
    for (var i = 0; i < numQuestions; i++) {
        var question = questions[i];
        displayQuestion(i + 1, question.question, question.correctAnswers, question.incorrectAnswers);
    }
}

document.querySelector('#themeSelector').addEventListener('change', function () {
    var theme = this.value;
    var navbar = document.querySelector('#navbar');
    navbar.className = '';  // Remove all current classes
    navbar.classList.add('d-flex', 'justify-content-between', 'p-3', theme);
});

function checkAnswers() {
    for (var questionIndex = 0; questionIndex < questions.length; questionIndex++) {
        var question = questions[questionIndex];
        var correctCount = 0;
        var correctSelectedCount = 0;
        var inputs = document.querySelectorAll('input[name="q' + (questionIndex + 1) + '"]');

        for (var answerIndex = 0; answerIndex < inputs.length; answerIndex++) {
            var input = inputs[answerIndex];
            var label = document.querySelector('label[for="q' + (questionIndex + 1) + 'a' + answerIndex + '"]');
            var labelText = label.innerHTML.trim().toLowerCase().replace(/<br>/g, '\n');
            var isCorrect = question.correctAnswers.map(function (answer) {
                return answer.trim().toLowerCase();
            }).indexOf(labelText) !== -1;

            if (isCorrect) {
                label.className += ' correct-answer';
                correctCount++;
                if (input.checked) {
                    correctSelectedCount++;
                }
            } else {
                label.className += ' incorrect-answer';
            }
        }

        var questionContainer = document.querySelector('#q' + (questionIndex + 1));
        var correctCountElement = questionContainer.querySelector('.correct-count');

        if (!correctCountElement) {
            correctCountElement = document.createElement('p');
            correctCountElement.className = 'correct-count';
            questionContainer.appendChild(correctCountElement);
        }

        correctCountElement.innerHTML = '<strong>' + correctSelectedCount + '/' + correctCount + ' Correct</strong>';
    }
}

function changeMode() {
    var selectedMode = document.getElementById('themeSelect').value;
    var isDarkMode = selectedMode === 'dark' || (selectedMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode';

    // Set the color-scheme property
    document.documentElement.style.setProperty('color-scheme', isDarkMode ? 'dark' : 'light');

    // Set the scrollbar color
    if (isDarkMode) {
        document.body.style.setProperty('--scrollbar-thumb-color', 'grey');
        document.body.style.setProperty('--scrollbar-track-color', 'black');
    } else {
        document.body.style.setProperty('--scrollbar-thumb-color', 'darkgrey');
        document.body.style.setProperty('--scrollbar-track-color', 'lightgrey');
    }

    var elementsToChange = [document.querySelector('#navbar')];
    for (var i = 0; i < elementsToChange.length; i++) {
        var element = elementsToChange[i];
        if (element.classList.contains('bg-dark')) {
            element.classList.remove('bg-dark');
        }
        if (element.classList.contains('bg-light')) {
            element.classList.remove('bg-light');
        }
        element.classList.add(isDarkMode ? 'bg-dark' : 'bg-light');
    }
}

document.getElementById('themeSelect').addEventListener('change', changeMode);
changeMode();

function refreshQuestions() {
    // Shuffle the questions before displaying them
    questions = shuffle(questions);

    var questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = '';
    displayQuestions();
}

// Polyfill for Array.prototype.includes
if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement, fromIndex) {
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);
        var len = o.length >>> 0;

        if (len === 0) {
            return false;
        }

        var n = fromIndex | 0;
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        while (k < len) {
            if (o[k] === searchElement) {
                return true;
            }
            k++;
        }

        return false;
    };
}

// Polyfill for Array.prototype.map
if (!Array.prototype.map) {
    Array.prototype.map = function (callback, thisArg) {
        var T, A, k;

        if (this == null) {
            throw new TypeError('this is null or not defined');
        }

        var O = Object(this);
        var len = O.length >>> 0;

        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        if (arguments.length > 1) {
            T = thisArg;
        }

        A = new Array(len);
        k = 0;

        while (k < len) {
            var kValue, mappedValue;

            if (k in O) {
                kValue = O[k];
                mappedValue = callback.call(T, kValue, k, O);
                A[k] = mappedValue;
            }
            k++;
        }

        return A;
    };
}

// Polyfill for Element.classList
if (!("classList" in document.documentElement)) {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
        get: function () {
            var self = this;
            function update(fn) {
                return function (value) {
                    var classes = self.className.split(/\s+/),
                        index = classes.indexOf(value);

                    fn(classes, index, value);
                    self.className = classes.join(" ");
                };
            }

            var ret = {
                add: update(function (classes, index, value) {
                    if (!~index) classes.push(value);
                }),

                remove: update(function (classes, index) {
                    if (~index) classes.splice(index, 1);
                }),

                toggle: update(function (classes, index, value) {
                    if (~index)
                        classes.splice(index, 1);
                    else
                        classes.push(value);
                }),

                contains: function (value) {
                    return !!~self.className.split(/\s+/).indexOf(value);
                },

                item: function (i) {
                    return self.className.split(/\s+/)[i] || null;
                }
            };

            Object.defineProperty(ret, 'length', {
                get: function () {
                    return self.className.split(/\s+/).length;
                }
            });

            return ret;
        }
    });
}

// Polyfill for Object.assign
if (typeof Object.assign != 'function') {
    Object.assign = function (target) {
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
}