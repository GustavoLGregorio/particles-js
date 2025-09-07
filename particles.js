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
const PARTICLE_VELOCITY = 2.5,
	PARTICLE_NUMBER = 3000,
	PARTICLE_MAX_LENGTH = 5,
	PARTICLE_COLOR = "#F00",
	PARTICLE_LIFESPAN = 3 * 60,
	PARTICLE_TARGET_POSITION_X = -PARTICLE_MAX_LENGTH * 2,
	PARTICLE_TARGET_POSITION_Y = CANVAS_SIZE_Y - PARTICLE_MAX_LENGTH * -2,
	PARTICLE_SPREAD = 1.5;

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
canvas.addEventListener("mousemove", (e) => {
	targets.push({ x: e.offsetX, y: e.offsetY });
});

/** SPAWNER POINTS (PARTICLES STARTING COORDINATES) */
/** @type {Vec2[]} */
const spawners = [];
let spawnersColor = "#FF0";
canvas.addEventListener("click", (e) => {
	spawners.push({ x: e.offsetX, y: e.offsetY });
});

/** PARTICLE */
class Particle {
	/** @type {Vec2} */
	pos = { x: 0, y: 0 };
	/** @type {string} */
	color;
	/** @type {number} */
	lifespan = PARTICLE_LIFESPAN;
	/** @type {Vec2[]} */
	trail = [];
	/** @type {number} */
	trailLength = Math.floor(Math.random() * PARTICLE_MAX_LENGTH);
	targetIndex = Math.floor(Math.random() * targets.length);
	/** @type {Vec2} */
	target =
		targets.length > 0
			? targets[this.targetIndex]
			: { x: Math.random() * -CANVAS_SIZE_X, y: Math.random() * CANVAS_SIZE_Y * 2 };

	constructor() {
		// particle spawn position
		this.pos.x =
			spawners.length > 0 ? spawners[0].x : Math.floor(Math.random() * CANVAS_SIZE_X) + 50;
		this.pos.y =
			spawners.length > 0 ? spawners[0].y : Math.floor(Math.random() * CANVAS_SIZE_Y) - 50;

		// particle color
		this.color = PARTICLE_COLOR ? PARTICLE_COLOR : this.#handleColor();

		// creating trail
		for (let i = 0; i < this.trailLength; ++i) {
			this.trail.push({ x: this.pos.x, y: this.pos.y });
		}
	}

	#handleColor() {
		let colorCode = Math.max(100, Math.round(Math.random() * 0xfff));

		return `#${colorCode}`;
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

		if (this.pos.x <= target.x) {
			this.pos.x += PARTICLE_VELOCITY;
		} else if (this.pos.x > target.x) {
			this.pos.x -= PARTICLE_VELOCITY;
		}

		if (this.pos.y <= target.y) {
			this.pos.y += PARTICLE_VELOCITY;
		} else if (this.pos.y > target.y) {
			this.pos.y -= PARTICLE_VELOCITY;
		}

		if (this.pos.x === target.x && this.pos.y === target.y) {
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
	const maxTime = 40;

	let time = maxTime,
		// reusable variables for loops
		i = 0,
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
			time -= 1;
			if (time === 0) {
				time = maxTime;
			}

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
		}
		i = 0;

		window.requestAnimationFrame(loop);
	};

	loop();
}

if (ctx) render(ctx);
