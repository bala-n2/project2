const choices = ["rock", "paper", "scissors"];
const symbols = { rock: "✊", paper: "✋", scissors: "✌" };
const beats = { rock: "scissors", paper: "rock", scissors: "paper" };
const choiceButtons = document.querySelectorAll(".choice-button");
const playerDisplay = document.querySelector("#player-display");
const computerDisplay = document.querySelector("#computer-display");
const status = document.querySelector("#game-status");
const playerScoreDisplay = document.querySelector("#player-score");
const computerScoreDisplay = document.querySelector("#computer-score");
const roundDisplay = document.querySelector("#round-count");
let playerScore = 0;
let computerScore = 0;
let rounds = 0;
let playing = false;

function setChoice(display, choice, label) {
	display.innerHTML = `<span>${symbols[choice]}</span>`;
	display.setAttribute("aria-label", label);
	display.classList.remove("is-playing", "is-revealed");
	void display.offsetWidth;
	display.classList.add("is-revealed");
}

function playRound(playerChoice) {
	if (playing) return;
	playing = true;
	choiceButtons.forEach((button) => {
		button.disabled = true;
		button.classList.remove("is-playing");
		void button.offsetWidth;
		button.classList.add("is-playing");
	});
	playerDisplay.classList.add("is-playing");
	computerDisplay.classList.add("is-playing");
	status.textContent = "The computer is choosing...";

	window.setTimeout(() => {
		const computerChoice = choices[Math.floor(Math.random() * choices.length)];
		setChoice(playerDisplay, playerChoice, `Your choice: ${playerChoice}`);
		setChoice(computerDisplay, computerChoice, `Computer choice: ${computerChoice}`);
		rounds += 1;
		roundDisplay.textContent = rounds;

		if (playerChoice === computerChoice) {
			status.textContent = `A draw. You both chose ${playerChoice}.`;
		} else if (beats[playerChoice] === computerChoice) {
			playerScore += 1;
			status.textContent = `You win! ${playerChoice} beats ${computerChoice}.`;
		} else {
			computerScore += 1;
			status.textContent = `Computer wins. ${computerChoice} beats ${playerChoice}.`;
		}

		playerScoreDisplay.textContent = playerScore;
		computerScoreDisplay.textContent = computerScore;
		playing = false;
		choiceButtons.forEach((button) => {
			button.disabled = false;
			button.classList.remove("is-playing");
		});
	}, 550);
}

function resetMatch() {
	playerScore = 0;
	computerScore = 0;
	rounds = 0;
	playerScoreDisplay.textContent = "0";
	computerScoreDisplay.textContent = "0";
	roundDisplay.textContent = "0";
	playerDisplay.innerHTML = "<span>?</span>";
	computerDisplay.innerHTML = "<span>?</span>";
	playerDisplay.setAttribute("aria-label", "Your choice");
	computerDisplay.setAttribute("aria-label", "Computer choice");
	playerDisplay.classList.remove("is-playing", "is-revealed");
	computerDisplay.classList.remove("is-playing", "is-revealed");
	status.textContent = "Pick a move to play.";
}

choiceButtons.forEach((button) => {
	button.addEventListener("click", () => playRound(button.dataset.choice));
});
document.querySelector("#reset-button").addEventListener("click", resetMatch);
