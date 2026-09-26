const totalSteps = 5;
const optionsElement = document.querySelector("#answer-options");
const equationElement = document.querySelector("#equation");
const statusElement = document.querySelector("#game-status");
const progressElement = document.querySelector("#adventure-progress");
const progressLabel = document.querySelector("#progress-label");
const character = document.querySelector("#hero-character");
const monster = document.querySelector("#monster");
const monsterBadge = document.querySelector(".monster-badge");
const riddleLabel = document.querySelector(".riddle-label");
const riddleCopy = document.querySelector("#question-title");
const world = document.querySelector("#adventure-world");
const restartButton = document.querySelector("#restart-button");
let step = 0;
let correctAnswer;
let finished = false;
let moving = false;

function makeOptions(answer) {
	const options = new Set([answer, answer - 1, answer + 2]);
	const shuffled = Array.from(options);
	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
	}
	return shuffled;
}

function showQuestion() {
	const firstNumber = Math.floor(Math.random() * 9) + 2;
	const secondNumber = Math.floor(Math.random() * 9) + 2;
	correctAnswer = firstNumber + secondNumber;
	equationElement.textContent = `${firstNumber} + ${secondNumber} = ?`;

	optionsElement.replaceChildren();
	makeOptions(correctAnswer).forEach((answer) => {
		const button = document.createElement("button");
		button.className = "answer-button";
		button.type = "button";
		button.textContent = answer;
		button.addEventListener("click", () => chooseAnswer(answer, button));
		optionsElement.append(button);
	});
	statusElement.textContent = "Pick the right answer to continue.";
	statusElement.dataset.result = "";
}

function updateProgress() {
	progressElement.value = step;
	progressLabel.textContent = `Castle trail · ${step} / ${totalSteps}`;
}

function finishGame(message, result) {
	finished = true;
	moving = false;
	statusElement.textContent = message;
	statusElement.dataset.result = result;
	optionsElement.querySelectorAll("button").forEach((button) => { button.disabled = true; });
	restartButton.hidden = false;
}

function chooseAnswer(answer, selectedButton) {
	if (finished || moving) return;
	if (answer !== correctAnswer) {
		selectedButton.classList.add("wrong");
		finishGame(`Oh no! The answer was ${correctAnswer}. The adventure is over.`, "wrong");
		return;
	}

	selectedButton.classList.add("correct");
	optionsElement.querySelectorAll("button").forEach((button) => { button.disabled = true; });
	step += 1;
	updateProgress();
	character.setAttribute("transform", `translate(${100 + step * 108} 0)`);
	character.classList.add("walking");
	moving = true;

	if (step === totalSteps) {
		world.classList.add("castle-won");
		monster.classList.add("monster-gone");
		monsterBadge.classList.add("monster-gone");
		riddleLabel.textContent = "A parting message";
		riddleCopy.textContent = "Good job! You made it to the castle!";
		finishGame("You made it to the castle! Brilliant adventure!", "correct");
		return;
	}

	statusElement.textContent = "That's right! You're one step closer to the castle.";
	statusElement.dataset.result = "correct";
	window.setTimeout(() => {
		character.classList.remove("walking");
		moving = false;
		showQuestion();
	}, 850);
}

function startAdventure() {
	step = 0;
	finished = false;
	moving = false;
	character.setAttribute("transform", "translate(100 0)");
	character.classList.remove("walking");
	monster.classList.remove("monster-gone");
	monsterBadge.classList.remove("monster-gone");
	riddleLabel.textContent = "Monster's riddle";
	riddleCopy.textContent = "Solve it to keep going!";
	world.classList.remove("castle-won");
	restartButton.hidden = true;
	updateProgress();
	showQuestion();
}

restartButton.addEventListener("click", startAdventure);
startAdventure();
