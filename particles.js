/** TYPES */
/**
 * @typedef Vec2
 * @property {number} x
 * @property {number} y
 */

/** GLOBALS CONSTANTS */
// window
const WINDOW_W = window.innerWidth,
	WINDOW_H = window.innerHeight;

// canvas
const CANVAS_SIZE_X = 400,
	CANVAS_SIZE_Y = 400,
	CANVAS_THRESHOLD = 100,
	CANVAS_BACKGROUND_COLOR = "#000";

// particles
const PARTICLE_VELOCITY = 2,
	PARTICLE_NUMBER = 2_000,
	PARTICLE_MAX_LENGTH = 5,
	PARTICLE_COLOR = "#FF0",
	PARTICLE_LIFESPAN = 2 * 60,
	PARTICLE_TARGET_POSITION_X = -PARTICLE_MAX_LENGTH * 2,
	PARTICLE_TARGET_POSITION_Y = CANVAS_SIZE_Y - PARTICLE_MAX_LENGTH * -2,
	PARTICLE_SPREAD = 3;

/** CANVAS CONFIG */
const canvas = document.createElement("canvas");
document.body.append(canvas);
canvas.width = CANVAS_SIZE_X;
canvas.height = CANVAS_SIZE_Y;
canvas.style.backgroundColor = "#000";
const ctx = canvas.getContext("2d");

/** DRAWING POINTS (TARGETS) */
/** @type {Vec2[]} */
const targets = [];
let targetsColor = "#FFF";

/** SPAWNER POINTS (PARTICLES STARTING COORDINATES) */
/** @type {Vec2[]} */
const spawners = [];
let spawnersColor = "#FF0";

const cachedSpawners = localStorage.getItem("spawners");
const cachedTargets = localStorage.getItem("targets");

if (cachedSpawners) {
	for (const spawner of JSON.parse(cachedSpawners)) {
		spawners.push(spawner);
	}
}
if (cachedTargets) {
	for (const target of JSON.parse(cachedTargets)) {
		targets.push(target);
	}
}

/** LISTENERS AND ADDING POINTS LOGIC */
const keysPressed = [];
window.addEventListener("keydown", (key) => {
	if (key.key === "Shift") keysPressed.push(0);
	else if (key.key === "Control") keysPressed.push(1);
	else if (key.key === "r") {
		localStorage.clear();
		window.location.reload();
	} else if (key.key === "d") {
		const link = document.createElement("a");
		const objData = `{"spawners": ${JSON.stringify(targets)}, "targets": ${JSON.stringify(
			spawners,
		)}}`;
		const blobData = new Blob([objData], {
			type: "application/json",
		});
		const objURL = URL.createObjectURL(blobData);
		link.href = objURL;
		link.download = "blob1.json";
		link.click();
	}
});
window.addEventListener("keyup", () => {
	keysPressed.splice(0, 2);
});
canvas.addEventListener("click", (mouse) => {
	if (keysPressed.includes(0)) {
		targets.push({ x: mouse.offsetX, y: mouse.offsetY });
		localStorage.setItem("targets", JSON.stringify(targets));
	} else if (keysPressed.includes(1)) {
		spawners.push({ x: mouse.offsetX, y: mouse.offsetY });
		localStorage.setItem("spawners", JSON.stringify(spawners));
	}
});

/**
 * @param {number} x
 * @param {number} y
 * @param {number} t
 */
function lerp(x, y, t) {
	return Math.round(x * (1 - t) + y * t);
}
/** @param {Vec2} vec2 */
function vecnormalize(vec2) {
	const magnitude = Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);

	if (magnitude === 0) {
		return { x: 0, y: 0 };
	}

	return { x: Math.round(vec2.x / magnitude), y: Math.round(vec2.y / magnitude) };
}

/** PARTICLE */
class Particle {
	/** @type {Vec2} */
	pos = { x: 0, y: 0 };

	/** @type {string} */
	color;

	/** @type {number} */
	lifespan = Math.floor(Math.random() * PARTICLE_LIFESPAN);

	/** @type {Vec2[]} */
	trail = [];

	/** @type {number} */
	trailLength = Math.floor(Math.random() * PARTICLE_MAX_LENGTH);

	/** @type {number} */
	targetIndex = Math.floor(Math.random() * targets.length);

	/** @type {Vec2} */
	target =
		targets.length > 0
			? targets[this.targetIndex]
			: { x: Math.random() * -CANVAS_SIZE_X, y: Math.random() * CANVAS_SIZE_Y * 2 };

	/** @type {number} */
	spawnIndex = Math.floor(Math.random() * spawners.length);

	constructor() {
		// particle spawn position
		this.pos.x =
			spawners.length > 0
				? spawners[this.spawnIndex].x
				: Math.floor(Math.random() * CANVAS_SIZE_X) + 50;
		this.pos.y =
			spawners.length > 0
				? spawners[this.spawnIndex].y
				: Math.floor(Math.random() * CANVAS_SIZE_Y) - 50;

		// particle color
		this.color = PARTICLE_COLOR
			? PARTICLE_COLOR
			: `#${Math.max(0x100, Math.round(Math.random() * 0xfff))}`;

		// creating trail
		for (let i = 0; i < this.trailLength; ++i) {
			this.trail.push({ x: this.pos.x, y: this.pos.y });
		}
	}

	spread() {
		switch (Math.round(Math.random() * 4)) {
			case 0:
				this.pos.x += PARTICLE_SPREAD;
				break;
			case 1:
				this.pos.x -= PARTICLE_SPREAD;
				break;
			case 2:
				this.pos.y += PARTICLE_SPREAD;
				break;
			case 3:
				this.pos.y -= PARTICLE_SPREAD;
				break;
		}
	}

	/** @param {Vec2} target */
	follow(target) {
		this.trail.push({ x: this.pos.x, y: this.pos.y });
		if (this.trail.length > this.trailLength) {
			this.trail.shift();
		}

		// Calculate direction vector
		const dx = target.x - this.pos.x;
		const dy = target.y - this.pos.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// Add curved motion using sine wave
		const time = Date.now() * 0.001; // Convert to seconds
		const curveAmplitude = 5; // Adjust this for more/less curve
		const curveFrequency = 0.1; // Adjust this for faster/slower oscillation

		if (distance > PARTICLE_VELOCITY) {
			// Normalize direction and apply velocity
			const vx = (dx / distance) * PARTICLE_VELOCITY;
			const vy = (dy / distance) * PARTICLE_VELOCITY;

			// Add perpendicular motion for curve effect
			const perpX = -vy; // Perpendicular vector
			const perpY = vx;

			// Apply sine wave to perpendicular motion
			const curve = Math.sin(time * curveFrequency + this.pos.x * 0.05) * curveAmplitude;

			this.pos.x += vx + perpX * curve * 0.1;
			this.pos.y += vy + perpY * curve * 0.1;
		}

		if (
			Math.abs(this.pos.x - target.x) < PARTICLE_VELOCITY &&
			Math.abs(this.pos.y - target.y) < PARTICLE_VELOCITY
		) {
			if (targets.length > 0) {
				this.target = targets[0];
			}
		}
	}
}

/** RENDERING LOGIC */
/** @param {CanvasRenderingContext2D} ctx */
function render(ctx) {
	/** @type {Particle[]} */
	const ps = [];

	// reusable variables
	let i = 0,
		y = 0;

	const loop = () => {
		ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
		ctx.fillRect(0, 0, CANVAS_SIZE_X, CANVAS_SIZE_Y);

		if (ps.length < PARTICLE_NUMBER) {
			for (; i < PARTICLE_NUMBER - ps.length; ++i) ps.push(new Particle());
			i = 0;
		}

		// rendering particles
		for (; i < ps.length; ++i) {
			ps[i].lifespan -= 1;

			for (; y < ps[i].trail.length - 1; ++y) {
				ctx.strokeStyle = ps[i].color;
				ctx.beginPath();
				ctx.moveTo(ps[i].trail[y].x, ps[i].trail[y].y);
				ctx.lineTo(ps[i].trail[y + 1].x, ps[i].trail[y + 1].y);
				ctx.stroke();
			}
			y = 0;

			ps[i].spread();
			ps[i].follow(ps[i].target);

			if (
				ps[i].lifespan <= 0 ||
				ps[i].pos.x < -PARTICLE_MAX_LENGTH * 2 ||
				ps[i].pos.x > CANVAS_SIZE_X + PARTICLE_MAX_LENGTH * 2 ||
				ps[i].pos.y < -PARTICLE_MAX_LENGTH * 2 ||
				ps[i].pos.y > CANVAS_SIZE_Y + (CANVAS_THRESHOLD + PARTICLE_MAX_LENGTH)
			) {
				ps.splice(i, 1);
			}
		}
		i = 0;

		// rendering targets
		for (; i < targets.length; ++i) {
			ctx.fillStyle = "#ffffff95";
			ctx.fillRect(targets[i].x, targets[i].y, 4, 4);
			ctx.fillStyle = "#fff";
			ctx.fillText(`${i}`, targets[i].x + 2, targets[i].y - 6, 12);
		}
		i = 0;

		// rendering spawnpoints
		for (; i < spawners.length; ++i) {
			ctx.fillStyle = "#4800c695";
			ctx.fillRect(spawners[i].x, spawners[i].y, 4, 4);
			ctx.fillStyle = "#0fde00ff";
			ctx.fillText(`${i}`, spawners[i].x + 2, spawners[i].y - 6, 12);
		}
		i = 0;

		window.requestAnimationFrame(loop);
	};

	loop();
}

if (ctx) render(ctx);
