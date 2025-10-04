/** TYPES */
/**
 * @typedef Vec2
 * @property {number} x
 * @property {number} y
 */

/** LIB */
/**
 * @typedef ScreenDimensions
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef CanvasConfig
 * @property {ScreenDimensions} size
 * @property {number} [threshold]
 * @property {string} backgroundColor
 * @property {HTMLElement} appendTo
 * @property {"low" | "medium" | "high"} [smoothing]
 */

/**
 * @typedef ParticleCurvature
 * @property {number} [amplitude]
 * @property {number} [frequency]
 * @property {'sin' | 'cos' | 'tan' | number} [curve]
 */

/**
 * @typedef ParticlesConfig
 * @property {number} [quantity]
 * @property {number} [velocity]
 * @property {number} [maxVelocity]
 * @property {number} [length]
 * @property {number} [maxLength]
 * @property {number} [size]
 * @property {number} [maxSize]
 * @property {number} [lifespan]
 * @property {number} [maxLifespan]
 * @property {string | null} [color]
 * @property {Partial<Vec2>} [initialTargetPosition]
 * @property {number} [spreadFactor]
 * @property {ParticleCurvature} [curvature]
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
 * @property {ParticlesConfig} [particles]
 * @property {Vec2[]} [targets]
 * @property {Vec2[]} [spawners]
 * @property {ListenersConfig} [listeners]
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
        if (
            !configValue.canvas.appendTo ||
            !configValue.canvas.size ||
            !configValue.canvas.backgroundColor
        ) {
            throw new Error("ParticlesJS.config necessary properties where not found");
        }

        const storageSpawners = localStorage.getItem("particles-js.spawners");
        const storageTargets = localStorage.getItem("particles-js.targets");

        if (storageSpawners) {
            this.#spawners = JSON.parse(storageSpawners);
        } else if (configValue.spawners) this.#spawners = configValue.spawners;

        if (storageTargets) {
            this.#targets = JSON.parse(storageTargets);
        } else if (configValue.targets) this.#targets = configValue.targets;

        this.#config = configValue;
        this.#initCanvas();
        this.#attachListeners();
    }

    /** @returns {ParticlesJSConfig | null} */
    get config() {
        return this.#config;
    }

    // --- METHODS ---

    // INITIALIZE OBJECT AND CANVAS CONFIG
    #initCanvas() {
        if (!this.#config) return;

        // CANVAS CONFIG
        this.#canvas = document.createElement("canvas");
        this.#config.canvas.appendTo.append(this.#canvas);

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
        if (!this.#config || !this.#config.particles) {
            throw new Error("Object was not configured");
        }

        return new Particle(
            this.#config.particles,
            this.#config.canvas,
            this.#spawners,
            this.#targets,
        );
    }

    // RENDERING LOGIC
    #render() {
        if (!this.#config || !this.#ctx || !this.#config.particles) return;

        const canvasThreshold = this.#config.canvas.threshold ?? 100;
        const config = this.#config ?? {};

        /** @type {Particle[]} */
        const ps = [];

        // reusable variables
        let i = 0;
        let y = 0;

        const loop = () => {
            if (!this.#config || !this.#ctx || !this.#config.particles) {
                throw new Error("ParticlesJS.config or canvas.context not found");
            }

            this.#ctx.clearRect(
                0,
                0,
                config.canvas.size.width,
                config.canvas.size.height,
            );

            const particleQuantity = this.#config.particles.quantity ?? 2_000;
            if (ps.length < particleQuantity) {
                for (; i < particleQuantity - ps.length; ++i)
                    ps.push(this.#getParticle());
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

                // removing particle
                if (
                    ps[i].lifespan <= 0 ||
                    ps[i].pos.x < -canvasThreshold ||
                    ps[i].pos.x > config.canvas.size.width + canvasThreshold ||
                    ps[i].pos.y < -canvasThreshold ||
                    ps[i].pos.y > config.canvas.size.height + canvasThreshold
                ) {
                    ps.splice(i, 1);
                }
            }
            i = 0;

            // rendering targets
            if (config.targets) {
                for (; i < config.targets.length; ++i) {
                    this.#ctx.fillStyle = "#ffffff95";
                    this.#ctx.fillRect(config.targets[i].x, config.targets[i].y, 4, 4);
                    this.#ctx.fillStyle = "#fff";
                    this.#ctx.fillText(
                        `${i}`,
                        config.targets[i].x + 2,
                        config.targets[i].y - 6,
                        12,
                    );
                }
                i = 0;
            }

            // rendering spawnpoints
            if (config.spawners) {
                for (; i < config.spawners.length; ++i) {
                    this.#ctx.fillStyle = "#4800c695";
                    this.#ctx.fillRect(
                        config.spawners[i].x,
                        config.spawners[i].y,
                        4,
                        4,
                    );
                    this.#ctx.fillStyle = "#0fde00ff";
                    this.#ctx.fillText(
                        `${i}`,
                        config.spawners[i].x + 2,
                        config.spawners[i].y - 6,
                        12,
                    );
                }
                i = 0;
            }

            window.requestAnimationFrame(loop);
        };

        loop();
    }

    #attachListeners() {
        if (!this.#canvas) return;

        // LISTENERS AND ADDING POINTS LOGIC
        window.addEventListener("keydown", (key) => {
            switch (key.key) {
                case "Shift":
                    this.#keysPressed.push(0);
                    break;
                case "Control":
                    this.#keysPressed.push(1);
                    break;
                case "r":
                    localStorage.clear();
                    window.location.reload();
                    break;
                case "d":
                    const link = document.createElement("a");
                    const objData = `{"spawners": ${JSON.stringify(this.#targets)}, "targets": ${JSON.stringify(
                        this.#spawners,
                    )}}`;
                    const blobData = new Blob([objData], {
                        type: "application/json",
                    });
                    const objURL = URL.createObjectURL(blobData);
                    link.href = objURL;
                    link.download = "blob1.json";
                    link.click();
                    break;
            }
        });
        window.addEventListener("keyup", () => {
            this.#keysPressed.splice(0, 2);
        });

        this.#canvas.addEventListener("click", (mouse) => {
            if (this.#keysPressed.includes(0)) {
                this.#targets.push({ x: mouse.offsetX, y: mouse.offsetY });

                localStorage.setItem(
                    "particles-js.targets",
                    JSON.stringify(this.#targets),
                );
            } else if (this.#keysPressed.includes(1)) {
                this.#spawners.push({ x: mouse.offsetX, y: mouse.offsetY });

                localStorage.setItem(
                    "particles-js.spawners",
                    JSON.stringify(this.#spawners),
                );
            }
        });
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

        return {
            x: Math.round(vec2.x / magnitude),
            y: Math.round(vec2.y / magnitude),
        };
    }
}

/** PARTICLE */
class Particle {
    /** @type {ParticlesConfig} */
    config;

    /** @type {CanvasConfig} */
    canvasConfig;

    /** @type {Vec2} */
    pos = { x: 0, y: 0 };

    /** @type {number} */
    size;

    /** @type {number} */
    velocity;

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
     * @param {ParticlesConfig} pConfig
     * @param {CanvasConfig} canvasConfig
     * @param {Vec2[]} spawners
     * @param {Vec2[]} targets
     */
    constructor(pConfig, canvasConfig, spawners, targets) {
        this.config = pConfig;
        this.canvasConfig = canvasConfig;
        this.spawnersArr = spawners;
        this.targetsArr = targets;

        const PARTICLE_LENGTH = pConfig.length ?? 10;
        const CANVAS_SIZE_X = Math.abs(canvasConfig.size?.width) || 400;
        const CANVAS_SIZE_Y = Math.abs(canvasConfig.size?.height) || 400;

        this.size = this.#getRangeProp(pConfig.size, pConfig.maxSize, 5);
        this.velocity = this.#getRangeProp(pConfig.velocity, pConfig.maxVelocity, 5);
        this.trailLength = this.#getRangeProp(pConfig.length, pConfig.maxLength, 2);
        this.lifespan = this.#getRangeProp(pConfig.lifespan, pConfig.maxLifespan, 30);

        this.targetIndex = Math.floor(Math.random() * targets.length);
        this.spawnIndex = Math.floor(Math.random() * spawners.length);

        // particle spawn position
        this.pos.x =
            spawners.length > 0
                ? spawners[this.spawnIndex].x
                : Math.floor(Math.random() * CANVAS_SIZE_X);
        this.pos.y =
            spawners.length > 0
                ? spawners[this.spawnIndex].y
                : Math.floor(Math.random() * CANVAS_SIZE_Y);

        // particle target
        // prettier-ignore
        this.target =
            targets.length > 0
				? targets[this.targetIndex]
                : { x: -PARTICLE_LENGTH * 2, y: CANVAS_SIZE_Y - PARTICLE_LENGTH * -2 };

        // particle color
        this.color =
            pConfig.color ??
            `#${Math.max(0x100, Math.round(Math.random() * 0xfff)).toString(16)}`;

        // creating trail
        for (let i = 0; i < this.trailLength; ++i) {
            this.trail.push({ x: this.pos.x, y: this.pos.y });
        }
    }

    /**
     * @param {number | undefined} min
     * @param {number | undefined} max
     * @param {number} defaultValue
     */
    #getRangeProp(min, max, defaultValue) {
        const MIN = min ? Math.abs(min) : defaultValue;
        const MAX = max ? Math.abs(max) : defaultValue;
        const RANGE = MAX - MIN > 0 ? MAX - MIN : 0;

        return RANGE > 0
            ? (Math.round(Math.random() * MAX) % (RANGE + 1)) + MIN
            : Math.max(MIN, MAX, defaultValue);
    }

    spread() {
        const spread = this.config.spreadFactor ?? 3;
        switch (Math.round(Math.random() * 4)) {
            case 0:
                this.pos.x += spread;
                break;
            case 1:
                this.pos.x -= spread;
                break;
            case 2:
                this.pos.y += spread;
                break;
            case 3:
                this.pos.y -= spread;
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
        const curvature = this.config.curvature ?? {};
        const curveAmplitude = curvature.amplitude ?? 5;
        const curveFrequency = curvature.frequency ?? 0.1;
        const velocity = this.velocity;

        if (distance > velocity) {
            const vx = (dx / distance) * velocity;
            const vy = (dy / distance) * velocity;

            const perpX = -vy;
            const perpY = vx;

            let curve;

            if (typeof curvature.curve === "number") {
                curve = curvature.curve;
            } else if (curvature.curve === "cos") {
                curve =
                    Math.cos(time * curveFrequency + this.pos.x * 0.05) *
                    curveAmplitude;
            } else if (curvature.curve === "tan") {
                curve =
                    Math.tan(time * curveFrequency + this.pos.x * 0.05) *
                    curveAmplitude;
            } else {
                curve =
                    Math.sin(time * curveFrequency + this.pos.x * 0.05) *
                    curveAmplitude;
            }

            this.pos.x += vx + perpX * curve * 0.1;
            this.pos.y += vy + perpY * curve * 0.1;
        }

        if (
            Math.abs(this.pos.x - target.x) < velocity &&
            Math.abs(this.pos.y - target.y) < velocity &&
            this.targetsArr.length > 0
        ) {
            this.target = this.targetsArr[this.targetIndex];
        }
    }
}

export default ParticlesJS;
