/** LOGIC TYPES */
/**
 * @typedef Vec2
 * @property {number} x - Horizontal coordinate in 2D space.
 * @property {number} y - Vertical coordinate in 2D space.
 */

/* --- LIB TYPES --- */
/* --- CANVAS --- */
/**
 * @typedef ScreenDimensions
 * @property {number} width - Canvas width in pixels.
 * @property {number} height - Canvas height in pixels.
 */
/**
 * @typedef CanvasConfig
 * @property {ScreenDimensions} size - Canvas dimensions (width and height).
 * @property {number} [threshold] - Extra area outside canvas before removing particles.
 * @property {string} backgroundColor - Background color of the canvas.
 * @property {HTMLElement} appendTo - HTML element to append the canvas to.
 * @property {"low" | "medium" | "high"} [smoothing] - Defines the image smoothing quality for rendering.
 * @property {string} id - Unique identifier for the canvas element.
 */

/* --- PARTICLES --- */
/**
 * @typedef ParticleCurvature
 * @property {number} [amplitude] - Strength of the oscillation curve applied to movement ("sin"/"cos" only).
 * @property {number} [frequency] - Speed of oscillation for the curve motion ("sin"/"cos" only).
 * @property {'sin' | 'cos' | number} [curve] - Type of curvature applied to particle movement (sinusoidal, cosine, or numeric value).
 * @property {Vec2} [axisCurve] - Defines how curvature is applied across the X/Y axes.
 */
/**
 * @typedef ParticlesConfig
 * @property {number} [quantity] - Total number of particles to render.
 * @property {number} [velocity] - Base velocity for particle movement.
 * @property {number} [maxVelocity] - Maximum velocity limit.
 * @property {number} [length] - Base length of the particle trail.
 * @property {number} [maxLength] - Maximum trail length.
 * @property {number} [size] - Base visual size of each particle.
 * @property {number} [maxSize] - Maximum particle size.
 * @property {number} [lifespan] - Base lifespan of a particle (in frames).
 * @property {number} [maxLifespan] - Maximum lifespan variation.
 * @property {string | string[] | null} [color] - Color or color palette for particles ('null' for random colors).
 * @property {number} [spreadFactor] - Defines random dispersion strength during particle movement.
 * @property {ParticleCurvature} [curvature] - Curvature motion configuration for particles.
 */
/**
 * @typedef InitialPositionsConfig
 * @property {Vec2[]} [targets] - Starting positions where particles will move toward.
 * @property {Vec2[]} [spawners] - Spawn points where particles originate.
 */

/* --- STORAGE --- */
/**
 * @typedef StorageConfig
 * @property {"sessionStorage" | "localStorage"} storageType - Defines which storage type is used to save positions.
 * @property {StoragePositions} [storeListenersPositions] - Determines if positions added via listeners are saved.
 * @property {StoragePositions} [storeNewPositions] - Determines if new positions added via API methods are saved.
 */
/**
 * @typedef StoragePositions
 * @property {boolean} targets - Whether to store target positions.
 * @property {boolean} spawners - Whether to store spawner positions.
 */

/* --- LISTENERS --- */
/**
 * @typedef ListenerIdentifier
 * @property {string} [color] - Color of the listener’s visual marker.
 * @property {number} [size] - Size of the visual marker (square drawn on canvas).
 */
/**
 * @typedef Listener
 * @property {string} [keyboardTrigger] - Key that triggers listener behavior (e.g., spawn or target creation).
 * @property {ListenerIdentifier} [identifier] - Visual settings for listener markers.
 */
/**
 * @typedef ListenersConfig
 * @property {string} [resetPositions] - Key used to clear all stored positions.
 * @property {string} [downloadPositions] - Key used to export stored positions as JSON.
 * @property {Listener} [spawners] - Listener settings for spawner creation.
 * @property {Listener} [targets] - Listener settings for target creation.
 */

/* --- MAIN CONFIG --- */
/**
 * @typedef EntropyParticlesConfig
 * @property {CanvasConfig} canvas - Canvas setup (dimensions, color, and target container).
 * @property {ParticlesConfig} [particles] - Particle behavior and visual configuration.
 * @property {InitialPositionsConfig} [initialPositions] - Starting targets and spawners positions.
 * @property {ListenersConfig} [listeners] - Keyboard/mouse listener configurations.
 * @property {StorageConfig} [storage] - Storage options for saving and restoring positions.
 */

// MAIN CLASS

/**
 * @class
 * Main class for managing particle systems.
 * Handles initialization, rendering, and event listeners.
 */
class EntropyParticles {
    // MAIN CONFIG
    /** @type {EntropyParticlesConfig | null} */
    #config = null;

    // CANVAS
    /** @type {HTMLCanvasElement | null} */
    #canvas = null;
    /** @type {string | null} */
    #canvasId = null;
    /** @type {CanvasRenderingContext2D | null} */
    #ctx = null;

    // POSITIONS
    /** @type {Vec2[]} */
    #spawners = [];
    /** @type {Vec2[]} */
    #targets = [];

    // LISTENERS
    /** @type {number[]} */
    #keysPressed = [];

    // STORAGE
    #storageTargetsName = `particles-js.${this.#canvasId}.targets`;
    #storageSpawnersName = `particles-js.${this.#canvasId}.spawners`;

    // UPDATE LOOP
    #isRunning = false;
    #loopPrevFrame = 0;
    #loopId = 0;

    // --- GETTERS & SETTERS ---

    /**
     * Applies and validates the provided configuration.
     * Initializes the canvas and event listeners.
     * @param {EntropyParticlesConfig} configValue - Full configuration object.
     */
    set config(configValue) {
        if (!configValue.canvas.appendTo || !configValue.canvas.size || !configValue.canvas.backgroundColor) {
            throw new Error("EntropyParticles.config necessary properties where not found");
        }

        this.#canvasId = configValue.canvas.id;

        const storageSpawners =
            sessionStorage.getItem(this.#storageSpawnersName) ??
            localStorage.getItem(this.#storageSpawnersName);
        const storageTargets =
            sessionStorage.getItem(this.#storageTargetsName) ??
            localStorage.getItem(this.#storageTargetsName);

        if (storageSpawners) {
            this.#spawners = JSON.parse(storageSpawners);
        } else if (configValue.initialPositions?.spawners) {
            for (let i = 0; i < configValue.initialPositions.spawners.length; ++i) {
                this.#spawners.push(configValue.initialPositions.spawners[i]);
            }
        }

        if (storageTargets) {
            this.#targets = JSON.parse(storageTargets);
        } else if (configValue.initialPositions?.targets) {
            this.#targets = configValue.initialPositions?.targets;
        }

        this.#config = configValue;
        this.#initCanvas();
        this.#attachListeners();
    }

    /** @returns {EntropyParticlesConfig | null} - Returns current configuration. */
    get config() {
        return this.#config;
    }

    /** @returns {HTMLCanvasElement} - Returns initialized canvas element. */
    get canvas() {
        if (this.#canvas === null) throw new Error("Canvas doesn't exist. Initialize the config first");

        return this.#canvas;
    }

    /** @returns {Vec2[]} - Returns active target positions. */
    get targets() {
        return this.#targets;
    }
    /** @returns {Vec2[]} - Returns active spawner positions. */
    get spawners() {
        return this.#spawners;
    }

    // --- METHODS ---

    /**
     * Initializes the canvas element with size, color, and smoothing.
     * Creates and attaches the canvas to the target HTML container.
     */
    #initCanvas() {
        if (!this.#config || !this.#config.canvas.id || !this.#canvasId) return;

        // CANVAS CONFIG
        this.#canvas = document.createElement("canvas");
        this.#canvas.id = this.#canvasId;
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
    }

    /**
     * Creates and returns a new particle instance.
     * @returns {Particle} - New particle object.
     */
    #getParticle() {
        if (!this.#config || !this.#config) {
            throw new Error("Object was not configured");
        }
        return new Particle(this.#config.particles ?? {}, this.#config.canvas, this.#spawners, this.#targets);
    }

    /**
     * Starts the particle rendering loop.
     * Handles particle creation, drawing, and cleanup.
     */
    #render() {
        if (!this.#config || !this.#ctx || !this.#config) return;

        const canvasThreshold = this.#config.canvas.threshold ?? 100;
        const config = this.#config;

        /** @type {Particle[]} */
        const ps = [];

        // reusable variables
        let i = 0;
        let y = 0;

        /** @param {number} currentTime */
        const updateLoop = (currentTime) => {
            if (!this.#config || !this.#ctx || !this.#config) {
                throw new Error("EntropyParticles.config or canvas.context not found");
            }

            if (!this.#isRunning) {
                console.info("ended");
                return;
            }

            const deltaTime = (currentTime - this.#loopPrevFrame) / 1000;

            this.#ctx.clearRect(0, 0, config.canvas.size.width, config.canvas.size.height);

            // adding particles
            const particleQuantity = this.#config.particles?.quantity ?? 2_000;
            if (ps.length < particleQuantity) {
                for (; i < particleQuantity - ps.length; ++i) {
                    ps.push(this.#getParticle());
                }
                i = 0;
            }

            // rendering particles
            for (; i < ps.length; ++i) {
                ps[i].lifespan -= 1 * deltaTime * 60;

                for (; y < ps[i].trail.length - 1; ++y) {
                    this.#ctx.strokeStyle = ps[i].color;
                    this.#ctx.beginPath();
                    this.#ctx.moveTo(ps[i].trail[y].x, ps[i].trail[y].y);
                    this.#ctx.lineTo(ps[i].trail[y + 1].x, ps[i].trail[y + 1].y);
                    this.#ctx.lineWidth = ps[i].size;
                    this.#ctx.stroke();
                }
                y = 0;

                ps[i].spread(deltaTime);

                if (config.particles?.velocity === 0) {
                    ps[i].follow(ps[i].target, 0);
                } else {
                    ps[i].follow(ps[i].target, deltaTime);
                }

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
            if (this.#targets) {
                for (; i < this.#targets.length; ++i) {
                    const size = config.listeners?.targets?.identifier?.size ?? 4;
                    this.#ctx.fillStyle = config.listeners?.targets?.identifier?.color ?? "transparent";
                    this.#ctx.fillRect(this.#targets[i].x, this.#targets[i].y, size, size);
                    this.#ctx.fillStyle = config.listeners?.targets?.identifier?.color ?? "transparent";
                    this.#ctx.fillText(`${i}`, this.#targets[i].x, this.#targets[i].y - 5, 32);
                }
                i = 0;
            }

            // rendering spawnpoints
            if (this.#spawners) {
                for (; i < this.#spawners.length; ++i) {
                    const size = config.listeners?.spawners?.identifier?.size ?? 4;
                    this.#ctx.fillStyle = config.listeners?.spawners?.identifier?.color ?? "transparent";
                    this.#ctx.fillRect(this.#spawners[i].x, this.#spawners[i].y, size, size);
                    this.#ctx.fillStyle = config.listeners?.spawners?.identifier?.color ?? "transparent";
                    this.#ctx.fillText(`${i}`, this.#spawners[i].x, this.#spawners[i].y - 5, 32);
                }
                i = 0;
            }

            this.#loopPrevFrame = currentTime;
            this.#loopId = window.requestAnimationFrame(updateLoop);
        };

        updateLoop(this.#loopPrevFrame);
    }

    /**
     * Attaches keyboard and mouse listeners for interaction.
     * Enables dynamic creation and saving of targets/spawners.
     */
    #attachListeners() {
        if (!this.#canvas) return;

        const listeners = this.#config?.listeners;
        const storage = this.#config?.storage;

        // listeners and 'adding spawns and targets' logic
        window.addEventListener("keydown", (key) => {
            switch (key.key) {
                case listeners?.targets?.keyboardTrigger:
                    this.#keysPressed.push(0);
                    break;
                case listeners?.spawners?.keyboardTrigger:
                    this.#keysPressed.push(1);
                    break;
                case listeners?.resetPositions:
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                    break;
                case listeners?.downloadPositions:
                    const link = document.createElement("a");

                    const objData = `{"spawners": ${JSON.stringify(this.#targets)}, "targets": ${JSON.stringify(
                        this.#spawners,
                    )}}`;

                    const blobData = new Blob([objData], {
                        type: "application/json",
                    });

                    const objURL = URL.createObjectURL(blobData);
                    link.href = objURL;
                    link.download = "particles-js.json";
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

                if (storage?.storeListenersPositions?.targets) {
                    if (storage?.storageType === "localStorage") {
                        localStorage.setItem(this.#storageTargetsName, JSON.stringify(this.#targets));
                    } else if (storage?.storageType === "sessionStorage") {
                        sessionStorage.setItem(this.#storageTargetsName, JSON.stringify(this.#targets));
                    }
                }
            } else if (this.#keysPressed.includes(1)) {
                this.#spawners.push({ x: mouse.offsetX, y: mouse.offsetY });

                if (storage?.storeListenersPositions?.spawners) {
                    if (storage?.storageType === "localStorage") {
                        localStorage.setItem(this.#storageSpawnersName, JSON.stringify(this.#spawners));
                    } else if (storage?.storageType === "sessionStorage") {
                        sessionStorage.setItem(this.#storageSpawnersName, JSON.stringify(this.#spawners));
                    }
                }
            }
        });
    }

    /**
     * Starts the animation loop.
     * Begins continuous particle rendering.
     */
    start() {
        if (!this.#isRunning) {
            this.#isRunning = true;
            this.#render();
        }
    }

    /**
     * Pauses the animation loop.
     * Stops updating and rendering frames.
     */
    pause() {
        console.info("startPause");
        this.#isRunning = false;
        window.cancelAnimationFrame(this.#loopId);
    }

    /**
     * Adds a new target point and optionally persists it to storage (storage config).
     * @param {Vec2} newTarget - Target position to add.
     */
    addTarget(newTarget) {
        this.#targets.push(newTarget);
        if (this.#config?.storage?.storeNewPositions?.targets) {
            if (this.#config.storage.storageType === "sessionStorage") {
                sessionStorage.setItem(this.#storageTargetsName, JSON.stringify(this.#targets));
            } else if (this.#config.storage.storageType === "localStorage") {
                localStorage.setItem(this.#storageTargetsName, JSON.stringify(this.#targets));
            }
        }
    }

    /**
     * Adds a new spawner point and optionally persists it to storage (storage config).
     * @param {Vec2} newSpawner - Spawner position to add.
     */
    addSpawner(newSpawner) {
        this.#spawners.push(newSpawner);
        if (this.#config?.storage?.storeNewPositions?.spawners) {
            if (this.#config.storage.storageType === "sessionStorage") {
                sessionStorage.setItem(this.#storageSpawnersName, JSON.stringify(this.#spawners));
            } else if (this.#config.storage.storageType === "localStorage") {
                localStorage.setItem(this.#storageSpawnersName, JSON.stringify(this.#spawners));
            }
        }
    }

    /**
     * Removes a target at the given position.
     * @param {Vec2} targetPosition - Target coordinates to remove.
     */
    removeTargetAt(targetPosition) {
        const targets = this.#targets;
        for (let i = 0; i < targets.length; ++i) {
            if (targetPosition.x === targets[i].x && targetPosition.y === targets[i].y) {
                targets.splice(i, 1);
            }
        }
    }

    /**
     * Removes a spawner at the given position.
     * @param {Vec2} spawnerPosition - Spawner coordinates to remove.
     */
    removeSpawnerAt(spawnerPosition) {
        const spawner = this.#spawners;
        for (let i = 0; i < spawner.length; ++i) {
            if (spawnerPosition.x === spawner[i].x && spawnerPosition.y === spawner[i].y) {
                spawner.splice(i, 1);
            }
        }
    }
}

// PARTICLES CLASS

/**
 * Represents a single moving particle.
 * Handles physics, position, curvature, and trail logic.
 * @private
 */
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
     * Creates a new particle instance with random or defined properties.
     * @param {ParticlesConfig} pConfig - Particle behavior configuration.
     * @param {CanvasConfig} canvasConfig - Canvas parameters for positioning.
     * @param {Vec2[]} spawners - Available spawn locations.
     * @param {Vec2[]} targets - Available movement targets.
     */
    constructor(pConfig, canvasConfig, spawners, targets) {
        this.config = pConfig;
        this.canvasConfig = canvasConfig;
        this.spawnersArr = spawners;
        this.targetsArr = targets;

        const PARTICLE_LENGTH = pConfig.length ?? 2;
        const CANVAS_SIZE_X = Math.abs(canvasConfig.size?.width) || 400;
        const CANVAS_SIZE_Y = Math.abs(canvasConfig.size?.height) || 400;

        this.size = this.#getRangeProp(pConfig.size, pConfig.maxSize, 5);
        this.velocity = this.#getRangeProp(pConfig.velocity, pConfig.maxVelocity, 2);
        this.trailLength = this.#getRangeProp(pConfig.length, pConfig.maxLength, 2);
        this.lifespan = this.#getRangeProp(pConfig.lifespan, pConfig.maxLifespan, 60);

        this.targetIndex = Math.floor(Math.random() * targets.length);
        this.spawnIndex = Math.floor(Math.random() * spawners.length);

        // particle spawn position
        this.pos.x =
            spawners.length > 0 ? spawners[this.spawnIndex].x : Math.floor(Math.random() * CANVAS_SIZE_X);
        this.pos.y =
            spawners.length > 0 ? spawners[this.spawnIndex].y : Math.floor(Math.random() * CANVAS_SIZE_Y);

        // particle target
        // prettier-ignore
        this.target =
            targets.length > 0
                ? targets[this.targetIndex]
                : { x: CANVAS_SIZE_X / 2, y: CANVAS_SIZE_Y / 2 };

        // particle color
        if (pConfig.color && Array.isArray(pConfig.color)) {
            const iColor = Math.round(Math.random() * pConfig.color.length);
            this.color = pConfig.color[iColor];
        } else {
            this.color =
                pConfig.color ?? `#${Math.max(0x100, Math.round(Math.random() * 0xfff)).toString(16)}`;
        }

        // creating trail
        for (let i = 0; i < this.trailLength; ++i) {
            this.trail.push({ x: this.pos.x, y: this.pos.y });
        }
    }

    /**
     * Returns a random value within a given numeric range.
     * @param {number | undefined} min - Minimum value.
     * @param {number | undefined} max - Maximum value.
     * @param {number} defaultValue - Fallback value.
     * @returns {number} - Generated number within range.
     */
    #getRangeProp(min, max, defaultValue) {
        const MIN = min ? Math.abs(min) : defaultValue;
        const MAX = max ? Math.abs(max) : defaultValue;
        const RANGE = MAX - MIN > 0 ? MAX - MIN : 0;

        return RANGE > 0
            ? (Math.round(Math.random() * MAX) % (RANGE + 1)) + MIN
            : Math.max(MIN, MAX, defaultValue);
    }

    /**
     * Adds chaotic spread to the particle’s position.
     * Produces random direction movement.
     * @param {number} dt - Delta time since last frame.
     */
    spread(dt) {
        const spread = this.config.spreadFactor ?? 3;
        switch (Math.round(Math.random() * 4)) {
            case 0:
                this.pos.x += spread * 50 * dt;
                break;
            case 1:
                this.pos.x -= spread * 50 * dt;
                break;
            case 2:
                this.pos.y += spread * 50 * dt;
                break;
            case 3:
                this.pos.y -= spread * 50 * dt;
                break;
        }
    }

    /**
     * Moves the particle toward its target with optional curvature.
     * Updates trail and applies curved motion.
     * @param {Vec2} target - Target point to follow.
     * @param {number} dt - Delta time since last frame.
     */
    follow(target, dt) {
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
            const vx = (dx / distance) * velocity * 100 * dt;
            const vy = (dy / distance) * velocity * 100 * dt;

            const perpX = -vy;
            const perpY = vx;

            let curve;

            if (typeof curvature.curve === "number") {
                curve = curvature.curve;
            } else if (curvature.curve === "cos") {
                curve = Math.cos(time * curveFrequency + this.pos.x * 0.05) * curveAmplitude;
            } else {
                curve = Math.sin(time * curveFrequency + this.pos.x * 0.05) * curveAmplitude;
            }

            const aCX = curvature.axisCurve?.x ?? 0;
            const aCY = curvature.axisCurve?.y ?? 0;

            this.pos.x += vx + perpX * curve * 0.1 * (aCX * 10) * dt;
            this.pos.y += vy + perpY * curve * 0.1 * (aCY * 10) * dt;
        }

        if (
            Math.abs(this.pos.x - target.x) < velocity &&
            Math.abs(this.pos.y - target.y) < velocity &&
            this.targetsArr.length > 0
        ) {
            // this.target = this.targetsArr[this.targetIndex];
        }
    }
}

export default EntropyParticles;
