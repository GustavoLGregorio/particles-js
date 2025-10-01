/** LIB TYPES */
/**
 * @typedef ScreenDimensions
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef CanvasConfig
 * @property {ScreenDimensions} size
 * @property {number} threshold
 * @property {string} backgroundColor
 * @property {HTMLElement} appendCanvasTo
 * @property {"low" | "medium" | "high"} [smoothing]
 */

/**
 * @typedef ParticleConfig
 * @property {number} velocity
 * @property {number} quantity
 * @property {number} maxLength
 * @property {number} [maxSize]
 * @property {string | null} [color]
 * @property {number} [lifespan]
 * @property {Partial<Vec2>} [initialTargetPosition]
 * @property {number} spreadFactor
 */

/**
 * @typedef ListenerIdentifier
 * @property {string} color
 * @property {number} size
 * @property {string} font
 */

/**
 * @typedef Listener
 * @property {boolean} enableListener
 * @property {string} keyboardTrigger
 * @property {ListenerIdentifier} [identifier]
 */

/**
 * @typedef ListenersConfig
 * @property {Listener} [spawners]
 * @property {Listener} [targets]
 */

/**
 * @typedef ParticlesJSConfig
 * @property {CanvasConfig} canvas
 * @property {ParticleConfig} particles
 * @property {Vec2[]} targets
 * @property {Vec2[]} spawners
 * @property {ListenersConfig} [listeners]
 */

/** TYPES */
/**
 * @typedef Vec2
 * @property {number} x
 * @property {number} y
 */

class ParticlesJS {
	/** @type {ParticlesJSConfig | null} */
	#config = null;

	/** @type {HTMLCanvasElement | null} */
	#canvas = null;

	/** @type {CanvasRenderingContext2D | null} */
	#ctx = null;

	/** @type {Vec2[]} */
	#spawners = [];

	/** @type {Vec2[]} */
	#targets = [];

	/** @type {number[]} */
	#keysPressed = [];

	/** @type {boolean} */
	#initialized = false;

	/** @type {number | null} */
	#loopFrameId = null;

	// --- GETTERS & SETTERS ---

	/** @param {ParticlesJSConfig} configValue */
	set config(configValue) {
		this.#config = configValue;
		this.#init();
	}

	/** @returns {ParticlesJSConfig | null} */
	get config() {
		return this.#config;
	}

	// --- METHODS ---

	// INITIALIZE OBJECT AND CANVAS CONFIG
	#init() {
		if (!this.#config) return;

		// CANVAS CONFIG
		this.#canvas = document.createElement("canvas");
		this.#config.canvas.appendCanvasTo.append(this.#canvas);

		this.#canvas.width = this.#config.canvas.size.width;
		this.#canvas.height = this.#config.canvas.size.height;
		this.#canvas.style.backgroundColor = this.#config.canvas.backgroundColor;

		this.#ctx = this.#canvas.getContext("2d");

		// image smoothing logic
		if (this.#ctx && this.#config.canvas.smoothing) {
			this.#ctx?.imageSmoothingEnabled;
			this.#ctx.imageSmoothingQuality = this.#config.canvas.smoothing;
		}

		this.#render();
	}

	// PARTICLE CREATION
	/** @returns {Particle} */
	#getParticle() {
		if (!this.#config) {
			throw new Error("Object was not configured");
		}

		const targets = this.#config.targets ? this.#config.targets : [];
		const spawners = this.#config.spawners ? this.#config.spawners : [];

		return new Particle(this.#config.particles, this.#config.canvas, spawners, targets);
	}

	// RENDERING LOGIC
	#render() {
		if (!this.#config || !this.#ctx) return;

		const config = this.#config;

		/** @type {Particle[]} */
		const ps = [];

		// reusable variables
		let i = 0,
			y = 0;

		const loop = () => {
			if (!this.#config || !this.#ctx) return;

			this.#ctx.fillStyle = config.canvas.backgroundColor;
			this.#ctx.fillRect(0, 0, config.canvas.size.width, config.canvas.size.height);

			if (ps.length < config.particles.quantity) {
				for (; i < config.particles.quantity - ps.length; ++i) ps.push(this.#getParticle());
				i = 0;
			}

			// rendering particles
			for (; i < ps.length; ++i) {
				ps[i].lifespan -= 1;

				for (; y < ps[i].trail.length - 1; ++y) {
					this.#ctx.strokeStyle = ps[i].color;
					this.#ctx.beginPath();
					this.#ctx.moveTo(ps[i].trail[y].x, ps[i].trail[y].y);
					this.#ctx.lineTo(ps[i].trail[y + 1].x, ps[i].trail[y + 1].y);
					this.#ctx.lineWidth = ps[i].size;
					this.#ctx.stroke();
				}
				y = 0;

				ps[i].spread();
				ps[i].follow(ps[i].target);

				if (
					ps[i].lifespan <= 0 ||
					ps[i].pos.x < -config.particles.maxLength * 2 ||
					ps[i].pos.x > config.canvas.size.width + config.particles.maxLength * 2 ||
					ps[i].pos.y < -config.particles.maxLength * 2 ||
					ps[i].pos.y >
						config.canvas.size.height + (config.canvas.threshold + config.particles.maxLength)
				) {
					ps.splice(i, 1);
				}
			}
			i = 0;

			if (!config.targets) return;
			// rendering targets
			for (; i < config.targets.length; ++i) {
				this.#ctx.fillStyle = "#ffffff95";
				this.#ctx.fillRect(config.targets[i].x, config.targets[i].y, 4, 4);
				this.#ctx.fillStyle = "#fff";
				this.#ctx.fillText(`${i}`, config.targets[i].x + 2, config.targets[i].y - 6, 12);
			}
			i = 0;

			if (!config.spawners) return;
			// rendering spawnpoints
			for (; i < config.spawners.length; ++i) {
				this.#ctx.fillStyle = "#4800c695";
				this.#ctx.fillRect(config.spawners[i].x, config.spawners[i].y, 4, 4);
				this.#ctx.fillStyle = "#0fde00ff";
				this.#ctx.fillText(`${i}`, config.spawners[i].x + 2, config.spawners[i].y - 6, 12);
			}
			i = 0;

			window.requestAnimationFrame(loop);
		};

		loop();
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} t
	 */
	#lerp(x, y, t) {
		return Math.round(x * (1 - t) + y * t);
	}
	/** @param {Vec2} vec2 */
	#vecnormalize(vec2) {
		const magnitude = Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);

		if (magnitude === 0) {
			return { x: 0, y: 0 };
		}

		return { x: Math.round(vec2.x / magnitude), y: Math.round(vec2.y / magnitude) };
	}
}

/** PARTICLE */
class Particle {
	/** @type {ParticleConfig} */
	config;

	/** @type {CanvasConfig} */
	canvasConfig;

	/** @type {Vec2} */
	pos = { x: 0, y: 0 };

	/** @type {number} */
	size;

	/** @type {string} */
	color;

	/** @type {number} */
	lifespan;

	/** @type {Vec2[]} */
	trail = [];

	/** @type {number} */
	trailLength;

	/** @type {Vec2[]} */
	targetsArr;

	/** @type {Vec2[]} */
	spawnersArr;

	/** @type {number} */
	targetIndex;

	/** @type {Vec2} */
	target;

	/** @type {number} */
	spawnIndex;

	/**
	 * @param {ParticleConfig} particleConfig
	 * @param {CanvasConfig} canvasConfig
	 * @param {Vec2[]} spawners
	 * @param {Vec2[]} targets
	 */
	constructor(particleConfig, canvasConfig, spawners, targets) {
		this.config = particleConfig;
		this.canvasConfig = canvasConfig;
		this.spawnersArr = spawners;
		this.targetsArr = targets;

		const PARTICLE_MAX_SIZE = particleConfig.maxSize || 10;
		const PARTICLE_LIFESPAN = particleConfig.lifespan || 240;
		const PARTICLE_MAX_LENGTH = particleConfig.maxLength || 5;
		const PARTICLE_COLOR = particleConfig.color;
		const CANVAS_SIZE_X = canvasConfig.size?.width || 400;
		const CANVAS_SIZE_Y = canvasConfig.size?.height || 400;

		this.size = Math.round(Math.random() * PARTICLE_MAX_SIZE);
		this.lifespan = Math.floor(Math.random() * PARTICLE_LIFESPAN);
		this.trailLength = Math.floor(Math.random() * PARTICLE_MAX_LENGTH);
		this.targetIndex = Math.floor(Math.random() * targets.length);
		this.spawnIndex = Math.floor(Math.random() * spawners.length);

		// particle spawn position
		this.pos.x =
			spawners.length > 0
				? spawners[this.spawnIndex].x
				: Math.floor(Math.random() * CANVAS_SIZE_X) + 50;
		this.pos.y =
			spawners.length > 0
				? spawners[this.spawnIndex].y
				: Math.floor(Math.random() * CANVAS_SIZE_Y) - 50;

		// particle target
		// prettier-ignore
		this.target =
			targets.length > 0 ? targets[this.targetIndex] :
				{
					x: -PARTICLE_MAX_LENGTH * 2,
					y: CANVAS_SIZE_Y - PARTICLE_MAX_LENGTH * -2,
				};

		// particle color
		this.color = PARTICLE_COLOR
			? PARTICLE_COLOR
			: `#${Math.max(0x100, Math.round(Math.random() * 0xfff)).toString(16)}`;

		// creating trail
		for (let i = 0; i < this.trailLength; ++i) {
			this.trail.push({ x: this.pos.x, y: this.pos.y });
		}
	}

	spread() {
		switch (Math.round(Math.random() * 4)) {
			case 0:
				this.pos.x += this.config.spreadFactor;
				break;
			case 1:
				this.pos.x -= this.config.spreadFactor;
				break;
			case 2:
				this.pos.y += this.config.spreadFactor;
				break;
			case 3:
				this.pos.y -= this.config.spreadFactor;
				break;
		}
	}

	/** @param {Vec2} target */
	follow(target) {
		this.trail.push({ x: this.pos.x, y: this.pos.y });
		if (this.trail.length > this.trailLength) {
			this.trail.shift();
		}

		const dx = target.x - this.pos.x;
		const dy = target.y - this.pos.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		const time = Date.now() * 0.001;
		const curveAmplitude = 5;
		const curveFrequency = 0.1;

		if (distance > this.config.velocity) {
			const vx = (dx / distance) * this.config.velocity;
			const vy = (dy / distance) * this.config.velocity;

			const perpX = -vy;
			const perpY = vx;

			const curve = Math.sin(time * curveFrequency + this.pos.x * 0.05) * curveAmplitude;

			this.pos.x += vx + perpX * curve * 0.1;
			this.pos.y += vy + perpY * curve * 0.1;
		}

		if (
			Math.abs(this.pos.x - target.x) < this.config.velocity &&
			Math.abs(this.pos.y - target.y) < this.config.velocity
		) {
			if (this.targetsArr.length > 0) {
				this.target = this.targetsArr[0];
			}
		}
	}
}

export default ParticlesJS;

// --- ADD LATER (listeners and clickables)

// const cachedSpawners = localStorage.getItem("spawners");
// const cachedTargets = localStorage.getItem("targets");

// if (cachedSpawners) {
// 	for (const spawner of JSON.parse(cachedSpawners)) {
// 		spawners.push(spawner);
// 	}
// }
// if (cachedTargets) {
// 	for (const target of JSON.parse(cachedTargets)) {
// 		targets.push(target);
// 	}
// }

/** LISTENERS AND ADDING POINTS LOGIC */
// /** @type {number[]} */
// const keysPressed = [];
// window.addEventListener("keydown", (key) => {
// 	if (key.key === "Shift") keysPressed.push(0);
// 	else if (key.key === "Control") keysPressed.push(1);
// 	else if (key.key === "r") {
// 		localStorage.clear();
// 		window.location.reload();
// 	} else if (key.key === "d") {
// 		const link = document.createElement("a");
// 		const objData = `{"spawners": ${JSON.stringify(targets)}, "targets": ${JSON.stringify(
// 			spawners,
// 		)}}`;
// 		const blobData = new Blob([objData], {
// 			type: "application/json",
// 		});
// 		const objURL = URL.createObjectURL(blobData);
// 		link.href = objURL;
// 		link.download = "blob1.json";
// 		link.click();
// 	}
// });
// window.addEventListener("keyup", () => {
// 	keysPressed.splice(0, 2);
// });
// canvas.addEventListener("click", (mouse) => {
// 	if (keysPressed.includes(0)) {
// 		targets.push({ x: mouse.offsetX, y: mouse.offsetY });
// 		localStorage.setItem("targets", JSON.stringify(targets));
// 	} else if (keysPressed.includes(1)) {
// 		spawners.push({ x: mouse.offsetX, y: mouse.offsetY });
// 		localStorage.setItem("spawners", JSON.stringify(spawners));
// 	}
// });
