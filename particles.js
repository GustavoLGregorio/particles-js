// types
/**
 * @typedef Vec2
 * @property {number} x
 * @property {number} y
 */

// global constants
const CANVAS_SIZE_X = 400;
const CANVAS_SIZE_Y = 400;
const CANVAS_THRESHOLD = 100;

const PARTICLE_VELOCITY = 3;
const PARTICLE_NUMBER = 1000;
const PARTICLE_SIZE_X = 4;
const PARTICLE_SIZE_Y = 4;
const PARTICLE_LENGHT = 10;
const PARTICLE_COLOR = "#F00";

// classes
class Particle {
	/** @type {Vec2} */
	pos = { x: 0, y: 0 };
	/** @type {Vec2} */
	size = { x: PARTICLE_SIZE_X, y: PARTICLE_SIZE_Y };
	/** @type {string} */
	color;

	constructor() {
		// generating random size
		this.size.x = Math.floor(Math.random() * PARTICLE_SIZE_X);
		this.size.y = Math.floor(Math.random() * PARTICLE_SIZE_Y);

		// positioning the spawn position
		this.pos.x = Math.round(Math.random() * CANVAS_SIZE_X) + CANVAS_SIZE_X / 2;
		this.pos.y = Math.round((Math.random() * CANVAS_SIZE_Y) / 2);

		// seting a color
		this.color = PARTICLE_COLOR ? PARTICLE_COLOR : `#${Math.round(Math.random() * 899 + 100)}`;
	}

	move() {
		switch (Math.round(Math.random() * 4)) {
			case 0:
				this.pos.x += PARTICLE_VELOCITY;
				break;
			case 1:
				this.pos.x -= PARTICLE_VELOCITY;
				break;
			case 2:
				this.pos.y += PARTICLE_VELOCITY;

				break;
			case 3:
				this.pos.y -= PARTICLE_VELOCITY;
				break;
		}
	}

	/** @param {Vec2} target */
	follow(target) {
		if (this.pos.x < target.x) {
			this.pos.x += PARTICLE_VELOCITY;
		} else if (this.pos.x > target.x) {
			this.pos.x -= PARTICLE_VELOCITY;
		}

		if (this.pos.y < target.y) {
			this.pos.y += PARTICLE_VELOCITY;
		} else if (this.pos.y > target.y) {
			this.pos.y -= PARTICLE_VELOCITY;
		}
	}
}

// main function
(function main() {
	// canvas configuration
	const canvas = document.createElement("canvas");
	document.body.append(canvas);
	canvas.width = CANVAS_SIZE_X;
	canvas.height = CANVAS_SIZE_Y;
	canvas.style.backgroundColor = "#000";
	const ctx = canvas.getContext("2d");

	render(ctx);
})();

// rendering logic
/** @param {CanvasRenderingContext2D} ctx */
function render(ctx) {
	const particles = new Set();
	let i = 0;

	// recursion loop
	const loop = () => {
		if (particles.size < PARTICLE_NUMBER) {
			for (; i < PARTICLE_NUMBER - particles.size; ++i) {
				particles.add(new Particle());
			}
			i = 0;
		}

		for (const p of particles) {
			if (
				p.pos.x < 0 - (CANVAS_THRESHOLD + PARTICLE_LENGHT) ||
				p.pos.x > CANVAS_SIZE_X + (CANVAS_THRESHOLD + PARTICLE_LENGHT) ||
				p.pos.y < 0 - (CANVAS_THRESHOLD + PARTICLE_LENGHT) ||
				p.pos.y > CANVAS_SIZE_Y + (CANVAS_THRESHOLD + PARTICLE_LENGHT)
			) {
				particles.delete(p);
			}
			ctx.fillStyle = p.color;

			// clearing
			for (; i <= PARTICLE_LENGHT; ++i) {
				ctx.clearRect(p.pos.x + i, p.pos.y - i, p.size.x, p.size.y);
			}
			i = 0;

			// moving and following
			p.move();
			p.follow({ x: -CANVAS_SIZE_X + PARTICLE_LENGHT, y: CANVAS_SIZE_Y + PARTICLE_LENGHT + 10 });

			// drawing
			const PARTICLE_RANDOM_LENGHT = Math.round(Math.random() * PARTICLE_LENGHT);
			for (; i <= PARTICLE_RANDOM_LENGHT; ++i) {
				ctx.fillRect(p.pos.x + i, p.pos.y - i, p.size.x, p.size.y);
			}
			i = 0;
		}

		window.requestAnimationFrame(loop);
	};

	loop();
}
