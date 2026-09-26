const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");
const overlay = document.querySelector("#game-overlay");
const overlayTitle = document.querySelector("#overlay-title");
const overlayCopy = document.querySelector("#overlay-copy");
const startButton = document.querySelector("#start-button");
const jumpButton = document.querySelector("#jump-button");
const distanceDisplay = document.querySelector("#distance-score");
const bestDisplay = document.querySelector("#best-score");
const runStatus = document.querySelector("#run-status");
const bestStorageKey = "common-ground-sheep-dash-best";

let width = 0;
let height = 0;
let groundY = 0;
let scale = 1;
let state = "ready";
let distance = 0;
let elapsed = 0;
let speed = 0;
let jumpHeight = 0;
let jumpVelocity = 0;
let nextObstacleAt = 0;
let lastFrame = 0;
let sceneryTime = 0;
let obstacles = [];
let bestDistance = 0;

try {
	bestDistance = Number(localStorage.getItem(bestStorageKey)) || 0;
} catch {
	bestDistance = 0;
}
bestDisplay.textContent = bestDistance;

function resizeCanvas() {
	const bounds = canvas.getBoundingClientRect();
	const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
	width = bounds.width;
	height = bounds.height;
	canvas.width = Math.round(width * pixelRatio);
	canvas.height = Math.round(height * pixelRatio);
	context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	scale = height / 440;
	groundY = height * .81;
}

function drawCloud(x, y, size) {
	context.beginPath();
	context.arc(x, y, size * .48, 0, Math.PI * 2);
	context.arc(x + size * .48, y - size * .18, size * .62, 0, Math.PI * 2);
	context.arc(x + size * 1.08, y, size * .45, 0, Math.PI * 2);
	context.fill();
}

function drawBackground() {
	const sky = context.createLinearGradient(0, 0, 0, height);
	sky.addColorStop(0, "#a9d9df");
	sky.addColorStop(.64, "#e4e7c8");
	sky.addColorStop(1, "#efcf87");
	context.fillStyle = sky;
	context.fillRect(0, 0, width, height);

	context.fillStyle = "#f6d77d";
	context.beginPath();
	context.arc(width * .79, height * .2, height * .075, 0, Math.PI * 2);
	context.fill();

	context.fillStyle = "rgba(255, 253, 238, .75)";
	const cloudOffset = (sceneryTime * 10) % (width + 180);
	drawCloud(width * .18 - cloudOffset, height * .2, height * .09);
	drawCloud(width * .66 - cloudOffset * .6, height * .31, height * .065);
	drawCloud(width + 90 - cloudOffset, height * .16, height * .08);

	context.fillStyle = "#b0c987";
	context.beginPath();
	context.moveTo(0, height * .65);
	context.quadraticCurveTo(width * .18, height * .42, width * .4, height * .66);
	context.quadraticCurveTo(width * .68, height * .38, width, height * .64);
	context.lineTo(width, groundY);
	context.lineTo(0, groundY);
	context.fill();

	context.fillStyle = "#80a870";
	context.beginPath();
	context.moveTo(0, height * .75);
	context.quadraticCurveTo(width * .24, height * .58, width * .48, height * .75);
	context.quadraticCurveTo(width * .75, height * .55, width, height * .73);
	context.lineTo(width, groundY);
	context.lineTo(0, groundY);
	context.fill();

	context.fillStyle = "#668b5b";
	context.fillRect(0, groundY, width, height - groundY);
	context.fillStyle = "#8baa61";
	context.fillRect(0, groundY, width, 7 * scale);

	context.strokeStyle = "rgba(245, 224, 159, .72)";
	context.lineWidth = 3 * scale;
	context.setLineDash([9 * scale, 18 * scale]);
	context.lineDashOffset = -(distance * .65) % (27 * scale);
	context.beginPath();
	context.moveTo(0, groundY + 27 * scale);
	context.lineTo(width, groundY + 27 * scale);
	context.stroke();
	context.setLineDash([]);

	for (let index = 0; index < 8; index += 1) {
		const flowerX = (index * 173 - (distance * .35) % 173 + width) % width;
		const flowerY = groundY + 48 * scale + (index % 2) * 13 * scale;
		context.fillStyle = index % 2 ? "#f3d774" : "#f4f0dd";
		context.beginPath();
		context.arc(flowerX, flowerY, 2.4 * scale, 0, Math.PI * 2);
		context.fill();
	}
}

function drawSheep() {
	const playerX = width * .2;
	const footSwing = state === "running" && jumpHeight < 2 ? Math.sin(elapsed * 19) * 5 : 0;
	context.save();
	context.translate(playerX, groundY - jumpHeight);
	context.scale(scale, scale);

	context.fillStyle = "rgba(36, 50, 56, .2)";
	context.beginPath();
	context.ellipse(61, jumpHeight / scale, 53, 8, 0, 0, Math.PI * 2);
	context.fill();

	context.strokeStyle = "#4c4038";
	context.lineWidth = 7;
	context.lineCap = "round";
	context.beginPath();
	context.moveTo(39, -24);
	context.lineTo(37 + footSwing, -3);
	context.moveTo(77, -24);
	context.lineTo(79 - footSwing, -3);
	context.stroke();

	context.fillStyle = "#fffdf2";
	context.beginPath();
	context.ellipse(57, -45, 44, 29, 0, 0, Math.PI * 2);
	context.fill();
	for (const puff of [[23, -53, 15], [38, -68, 17], [58, -72, 18], [79, -63, 17], [91, -48, 14], [76, -35, 15], [48, -31, 15], [29, -37, 14]]) {
		context.beginPath();
		context.arc(puff[0], puff[1], puff[2], 0, Math.PI * 2);
		context.fill();
	}

	context.fillStyle = "#6b5145";
	context.beginPath();
	context.ellipse(99, -53, 20, 24, .12, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = "#e2ae83";
	context.beginPath();
	context.ellipse(105, -44, 13, 12, .16, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = "#fffdf2";
	context.beginPath();
	context.arc(101, -58, 4, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = "#263237";
	context.beginPath();
	context.arc(102, -58, 2, 0, Math.PI * 2);
	context.arc(116, -41, 2, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = "#e4774f";
	context.beginPath();
	context.moveTo(86, -31);
	context.lineTo(95, -24);
	context.lineTo(91, -38);
	context.closePath();
	context.fill();

	context.restore();
}

function drawRock(obstacle) {
	const x = obstacle.x;
	const y = groundY;
	context.fillStyle = "#726f60";
	context.beginPath();
	context.moveTo(x, y);
	context.lineTo(x + obstacle.width * .12, y - obstacle.height * .54);
	context.lineTo(x + obstacle.width * .43, y - obstacle.height);
	context.lineTo(x + obstacle.width * .83, y - obstacle.height * .78);
	context.lineTo(x + obstacle.width, y);
	context.closePath();
	context.fill();
	context.strokeStyle = "rgba(255, 255, 255, .28)";
	context.lineWidth = 2 * scale;
	context.beginPath();
	context.moveTo(x + obstacle.width * .28, y - obstacle.height * .59);
	context.lineTo(x + obstacle.width * .45, y - obstacle.height * .77);
	context.stroke();
}

function drawFence(obstacle) {
	const x = obstacle.x;
	const y = groundY;
	context.fillStyle = "#a75539";
	context.fillRect(x + 4 * scale, y - obstacle.height, 11 * scale, obstacle.height);
	context.fillRect(x + obstacle.width - 15 * scale, y - obstacle.height, 11 * scale, obstacle.height);
	context.fillRect(x, y - obstacle.height * .78, obstacle.width, 10 * scale);
	context.fillRect(x + 5 * scale, y - obstacle.height * .3, obstacle.width - 10 * scale, 9 * scale);
	context.fillStyle = "#d78a55";
	context.fillRect(x - 2 * scale, y - obstacle.height, 16 * scale, 8 * scale);
	context.fillRect(x + obstacle.width - 14 * scale, y - obstacle.height, 16 * scale, 8 * scale);
}

function drawObstacle(obstacle) {
	if (obstacle.type === "rock") drawRock(obstacle);
	else drawFence(obstacle);
}

function overlaps(first, second) {
	return first.x < second.x + second.width && first.x + first.width > second.x && first.y < second.y + second.height && first.y + first.height > second.y;
}

function update(deltaTime) {
	if (state !== "running") return;

	elapsed += deltaTime;
	speed = (310 + Math.min(elapsed * 10, 280)) * scale;
	distance += speed * deltaTime;
	jumpHeight += jumpVelocity * deltaTime;
		jumpVelocity -= 1850 * scale * deltaTime;
		if (jumpHeight <= 0 && jumpVelocity < 0) {
		jumpHeight = 0;
		jumpVelocity = 0;
	}

	if (distance >= nextObstacleAt) {
		const type = Math.random() < .52 ? "rock" : "fence";
		const obstacleWidth = (type === "rock" ? 48 : 68) * scale;
		const obstacleHeight = (type === "rock" ? 42 : 63) * scale;
		obstacles.push({ type, x: width + 50 * scale, width: obstacleWidth, height: obstacleHeight });
		nextObstacleAt = distance + (470 + Math.random() * 300) * scale;
	}

	const playerX = width * .2;
	const sheepBox = {
		x: playerX + 23 * scale,
		y: groundY - jumpHeight - 69 * scale,
		width: 83 * scale,
		height: 55 * scale
	};
	for (const obstacle of obstacles) {
		obstacle.x -= speed * deltaTime;
		const obstacleBox = {
			x: obstacle.x + 5 * scale,
			y: groundY - obstacle.height + 5 * scale,
			width: obstacle.width - 10 * scale,
			height: obstacle.height - 5 * scale
		};
		if (overlaps(sheepBox, obstacleBox)) {
			endRun();
			break;
		}
	}
	obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.width > 0);

	const score = Math.floor(distance / (12 * scale));
	distanceDisplay.textContent = score;
}

function render() {
	if (!context || !width || !height) return;
	context.clearRect(0, 0, width, height);
	drawBackground();
	obstacles.forEach(drawObstacle);
	drawSheep();
}

function frame(timestamp) {
	const deltaTime = lastFrame ? Math.min((timestamp - lastFrame) / 1000, .04) : 0;
	lastFrame = timestamp;
	sceneryTime += deltaTime;
	update(deltaTime);
	render();
	window.requestAnimationFrame(frame);
}

function jump() {
	if (state !== "running" || jumpHeight > 0) return;
	jumpVelocity = 730 * scale;
}

function startRun() {
	state = "running";
	distance = 0;
	elapsed = 0;
	speed = 310 * scale;
	jumpHeight = 0;
	jumpVelocity = 0;
	obstacles = [];
	nextObstacleAt = 500 * scale;
	distanceDisplay.textContent = "0";
	overlay.hidden = true;
	runStatus.textContent = "Run started.";
	canvas.focus({ preventScroll: true });
}

function endRun() {
	state = "over";
	const score = Math.floor(distance / (12 * scale));
	runStatus.textContent = `Run over. You covered ${score} meters.`;
	overlayTitle.textContent = "A tumble in the meadow";
	overlayCopy.textContent = `You ran ${score} meters. Ready for another go?`;
	startButton.textContent = "Run again";
	overlay.hidden = false;
	if (score > bestDistance) {
		bestDistance = score;
		bestDisplay.textContent = bestDistance;
		try {
			localStorage.setItem(bestStorageKey, bestDistance);
		} catch {
			// Best score remains available for this run if storage is disabled.
		}
	}
}

function handleJump() {
	if (state !== "running") {
		startRun();
		jump();
		return;
	}
	jump();
}

startButton.addEventListener("click", startRun);
jumpButton.addEventListener("click", handleJump);
canvas.addEventListener("pointerdown", () => {
	if (state === "running") jump();
});
window.addEventListener("keydown", (event) => {
	if (!["Space", "ArrowUp", "KeyW"].includes(event.code) || event.repeat) return;
	if (event.target instanceof Element && event.target.closest("button")) return;
	event.preventDefault();
	if (state !== "running") startRun();
	else jump();
});
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
window.requestAnimationFrame(frame);