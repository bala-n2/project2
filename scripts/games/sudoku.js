const boardElement = document.querySelector("#sudoku-board");
const numberPad = document.querySelector("#number-pad");
const statusElement = document.querySelector("#game-status");
const timerElement = document.querySelector("#timer");
const mistakesElement = document.querySelector("#mistakes");
const keyboardHint = document.querySelector(".keyboard-hint");
const completionScreen = document.querySelector("#completion-screen");
const completionCopy = document.querySelector("#completion-copy");
const completionSize = document.querySelector("#completion-size");
const completionTime = document.querySelector("#completion-time");
const completionMistakes = document.querySelector("#completion-mistakes");
const sizeInputs = document.querySelectorAll('input[name="board-size"]');
const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');
let size = 4;
let boxSize = 2;
let difficulty = "easy";
let puzzle = [];
let solution = [];
let entries = [];
let selectedIndex = -1;
let mistakes = 0;
let elapsedSeconds = 0;
let timer;

function shuffled(items) {
	const result = [...items];
	for (let index = result.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[result[index], result[swapIndex]] = [result[swapIndex], result[index]];
	}
	return result;
}

function makeSolution(boardSize, regionSize) {
	const groups = boardSize / regionSize;
	const rowOrder = shuffled(Array.from({ length: groups }, (_, index) => index))
		.flatMap((group) => shuffled(Array.from({ length: regionSize }, (_, offset) => group * regionSize + offset)));
	const columnOrder = shuffled(Array.from({ length: groups }, (_, index) => index))
		.flatMap((group) => shuffled(Array.from({ length: regionSize }, (_, offset) => group * regionSize + offset)));
	const digits = shuffled(Array.from({ length: boardSize }, (_, index) => index + 1));
	const grid = [];

	for (const row of rowOrder) {
		for (const column of columnOrder) {
			const pattern = (regionSize * (row % regionSize) + Math.floor(row / regionSize) + column) % boardSize;
			grid.push(digits[pattern]);
		}
	}
	return grid;
}

function candidatesFor(grid, cellIndex, boardSize, regionSize) {
	const row = Math.floor(cellIndex / boardSize);
	const column = cellIndex % boardSize;
	const regionRow = Math.floor(row / regionSize) * regionSize;
	const regionColumn = Math.floor(column / regionSize) * regionSize;
	const used = new Set();

	for (let offset = 0; offset < boardSize; offset += 1) {
		used.add(grid[row * boardSize + offset]);
		used.add(grid[offset * boardSize + column]);
	}
	for (let regionY = 0; regionY < regionSize; regionY += 1) {
		for (let regionX = 0; regionX < regionSize; regionX += 1) {
			used.add(grid[(regionRow + regionY) * boardSize + regionColumn + regionX]);
		}
	}
	const options = [];
	for (let value = 1; value <= boardSize; value += 1) {
		if (!used.has(value)) options.push(value);
	}
	return options;
}

function countSolutions(startGrid, boardSize, regionSize, limit = 2) {
	const grid = [...startGrid];
	let solutionsFound = 0;

	function search() {
		if (solutionsFound >= limit) return;
		let bestIndex = -1;
		let bestOptions = null;

		for (let index = 0; index < grid.length; index += 1) {
			if (grid[index] !== 0) continue;
			const options = candidatesFor(grid, index, boardSize, regionSize);
			if (options.length === 0) return;
			if (bestOptions === null || options.length < bestOptions.length) {
				bestIndex = index;
				bestOptions = options;
				if (options.length === 1) break;
			}
		}

		if (bestIndex === -1) {
			solutionsFound += 1;
			return;
		}
		for (const value of bestOptions) {
			grid[bestIndex] = value;
			search();
			grid[bestIndex] = 0;
			if (solutionsFound >= limit) return;
		}
	}

	search();
	return solutionsFound;
}

function createPuzzle() {
	size = Number(document.querySelector('input[name="board-size"]:checked').value);
	boxSize = Math.sqrt(size);
	difficulty = document.querySelector('input[name="difficulty"]:checked').value;
	solution = makeSolution(size, boxSize);
	puzzle = [...solution];
	const targetClues = size === 4
		? (difficulty === "easy" ? 11 : 8)
		: (difficulty === "easy" ? 40 : 34);
	let clueCount = puzzle.length;

	for (const cellIndex of shuffled(Array.from({ length: puzzle.length }, (_, index) => index))) {
		if (clueCount <= targetClues) break;
		const value = puzzle[cellIndex];
		puzzle[cellIndex] = 0;
		if (countSolutions(puzzle, size, boxSize) === 1) clueCount -= 1;
		else puzzle[cellIndex] = value;
	}

	entries = Array(size * size).fill(0);
	selectedIndex = -1;
	mistakes = 0;
	elapsedSeconds = 0;
	mistakesElement.textContent = "0";
	statusElement.textContent = "A fresh puzzle is ready.";
	statusElement.dataset.state = "";
	boardElement.style.setProperty("--board-size", size);
	boardElement.setAttribute("aria-label", `${size} by ${size} Sudoku board`);
	keyboardHint.textContent = `1 - ${size}`;
	buildNumberPad();
	buildBoard();
	startTimer();
}

function buildNumberPad() {
	numberPad.replaceChildren();
	for (let value = 1; value <= size; value += 1) {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "number-button";
		button.textContent = value;
		button.setAttribute("aria-label", `Enter ${value}`);
		button.addEventListener("click", () => enterValue(value));
		numberPad.append(button);
	}
}

function buildBoard() {
	boardElement.replaceChildren();
	for (let index = 0; index < puzzle.length; index += 1) {
		const row = Math.floor(index / size);
		const column = index % size;
		const cell = document.createElement("button");
		cell.type = "button";
		cell.className = "cell";
		cell.setAttribute("role", "gridcell");
		cell.dataset.index = index;
		if (puzzle[index] !== 0) cell.classList.add("given");
		if ((column + 1) % boxSize === 0 && column < size - 1) cell.classList.add("box-right");
		if ((row + 1) % boxSize === 0 && row < size - 1) cell.classList.add("box-bottom");
		cell.addEventListener("click", () => selectCell(index));
		boardElement.append(cell);
	}
	updateBoard();
}

function selectCell(index) {
	selectedIndex = index;
	updateBoard();
	if (puzzle[index] !== 0) statusElement.textContent = "That number is a clue.";
	else statusElement.textContent = "Choose a number for this square.";
	statusElement.dataset.state = "";
}

function updateBoard() {
	const selectedValue = selectedIndex >= 0 ? entries[selectedIndex] || puzzle[selectedIndex] : 0;
	const selectedRow = Math.floor(selectedIndex / size);
	const selectedColumn = selectedIndex % size;
	const selectedRegionRow = Math.floor(selectedRow / boxSize);
	const selectedRegionColumn = Math.floor(selectedColumn / boxSize);
	const cells = boardElement.querySelectorAll(".cell");

	cells.forEach((cell, index) => {
		const row = Math.floor(index / size);
		const column = index % size;
		const value = puzzle[index] || entries[index];
		cell.textContent = value || "";
		cell.classList.toggle("selected", index === selectedIndex);
		cell.classList.toggle("related", selectedIndex >= 0 && index !== selectedIndex && (
			row === selectedRow || column === selectedColumn ||
			(Math.floor(row / boxSize) === selectedRegionRow && Math.floor(column / boxSize) === selectedRegionColumn)
		));
		cell.classList.toggle("same-value", Boolean(selectedValue && value === selectedValue && index !== selectedIndex));
		cell.classList.toggle("conflict", Boolean(entries[index] && entries[index] !== solution[index]));
		cell.setAttribute("aria-pressed", String(index === selectedIndex));
		cell.setAttribute("aria-label", `Row ${row + 1}, column ${column + 1}${value ? `, ${puzzle[index] ? "given " : "value "}${value}` : ", empty"}`);
	});
	const remaining = Array.from(numberPad.children);
	remaining.forEach((button, index) => {
		button.disabled = selectedIndex < 0 || puzzle[selectedIndex] !== 0;
		button.textContent = index + 1;
	});
}

function enterValue(value) {
	if (value < 1 || value > size) {
		statusElement.textContent = `Choose a number from 1 to ${size}.`;
		statusElement.dataset.state = "error";
		return;
	}
	if (selectedIndex < 0) {
		statusElement.textContent = "Select an empty square first.";
		return;
	}
	if (puzzle[selectedIndex] !== 0) {
		statusElement.textContent = "Clue numbers cannot be changed.";
		return;
	}
	if (entries[selectedIndex] === value) return;
	entries[selectedIndex] = value;
	if (value !== solution[selectedIndex]) {
		mistakes += 1;
		mistakesElement.textContent = mistakes;
		statusElement.textContent = "That number does not fit the completed puzzle.";
		statusElement.dataset.state = "error";
	} else {
		statusElement.textContent = "Number placed.";
		statusElement.dataset.state = "";
	}
	updateBoard();
	if (entries.every((entry, index) => entry === solution[index] || puzzle[index] === solution[index])) {
		statusElement.textContent = `Puzzle complete in ${timerElement.textContent}.`;
		statusElement.dataset.state = "success";
		window.clearInterval(timer);
		completionCopy.textContent = `You earned a Logic Star for finishing the ${size} x ${size} ${difficulty} puzzle.`;
		completionSize.textContent = `${size} x ${size} / ${difficulty}`;
		completionTime.textContent = timerElement.textContent;
		completionMistakes.textContent = mistakes;
		completionScreen.showModal();
		document.querySelector("#play-again").focus();
	}
}

function eraseValue() {
	if (selectedIndex < 0 || puzzle[selectedIndex] !== 0) return;
	entries[selectedIndex] = 0;
	updateBoard();
	statusElement.textContent = "Square cleared.";
	statusElement.dataset.state = "";
}

function startTimer() {
	window.clearInterval(timer);
	timerElement.textContent = "00:00";
	timer = window.setInterval(() => {
		elapsedSeconds += 1;
		const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
		const seconds = String(elapsedSeconds % 60).padStart(2, "0");
		timerElement.textContent = `${minutes}:${seconds}`;
	}, 1000);
}

function moveSelection(rowOffset, columnOffset) {
	if (selectedIndex < 0) {
		selectCell(0);
		boardElement.querySelector(".cell")?.focus();
		return;
	}
	const row = Math.max(0, Math.min(size - 1, Math.floor(selectedIndex / size) + rowOffset));
	const column = Math.max(0, Math.min(size - 1, selectedIndex % size + columnOffset));
	const nextIndex = row * size + column;
	selectCell(nextIndex);
	boardElement.querySelector(`[data-index="${nextIndex}"]`)?.focus();
}

boardElement.addEventListener("keydown", (event) => {
	if (event.key === "ArrowUp") moveSelection(-1, 0);
	else if (event.key === "ArrowDown") moveSelection(1, 0);
	else if (event.key === "ArrowLeft") moveSelection(0, -1);
	else if (event.key === "ArrowRight") moveSelection(0, 1);
	else if (/^[1-9]$/.test(event.key)) enterValue(Number(event.key));
	else if (event.key === "Backspace" || event.key === "Delete") eraseValue();
	else return;
	event.preventDefault();
});

document.querySelector("#new-puzzle").addEventListener("click", createPuzzle);
document.querySelector("#erase-cell").addEventListener("click", eraseValue);
document.querySelector("#play-again").addEventListener("click", () => {
	completionScreen.close();
	createPuzzle();
	const firstEmpty = puzzle.findIndex((value) => value === 0);
	selectCell(firstEmpty);
	boardElement.querySelector(`[data-index="${firstEmpty}"]`)?.focus();
});
document.querySelector("#review-board").addEventListener("click", () => {
	completionScreen.close();
	boardElement.querySelector(`[data-index="${selectedIndex}"]`)?.focus();
});
sizeInputs.forEach((input) => input.addEventListener("change", createPuzzle));
difficultyInputs.forEach((input) => input.addEventListener("change", createPuzzle));
createPuzzle();