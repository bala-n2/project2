const form = document.querySelector("#guess-form");
const input = document.querySelector("#guess-input");
const status = document.querySelector("#game-status");
const count = document.querySelector("#guess-count");
const resetButton = document.querySelector("#reset-button");
let answer;
let guesses;
let finished;

function startGame() {
	answer = Math.floor(Math.random() * 100) + 1;
	guesses = 0;
	finished = false;
	count.textContent = guesses;
	status.textContent = "Ready when you are.";
	input.value = "";
	input.disabled = false;
	form.querySelector("button").disabled = false;
	input.focus();
}

form.addEventListener("submit", (event) => {
	event.preventDefault();
	const guess = Number(input.value);
	if (!Number.isInteger(guess) || guess < 1 || guess > 100) {
		status.textContent = "Enter a whole number from 1 to 100.";
		return;
	}
	if (finished) return;

	guesses += 1;
	count.textContent = guesses;
	if (guess === answer) {
		status.textContent = `You got it in ${guesses} ${guesses === 1 ? "guess" : "guesses"}!`;
		finished = true;
		input.disabled = true;
		form.querySelector("button").disabled = true;
	} else {
		status.textContent = guess < answer ? "Too low. Try a higher number." : "Too high. Try a lower number.";
		input.select();
	}
});

resetButton.addEventListener("click", startGame);
startGame();
