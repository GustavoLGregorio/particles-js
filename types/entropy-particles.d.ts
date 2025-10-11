/* --- LOGIC TYPES --- */

/**
 * @property {number} x - Horizontal coordinate in 2D space.
 * @property {number} y - Vertical coordinate in 2D space.
 */
export interface Vec2 {
    x: number;
    y: number;
}

/* --- LIB TYPES --- */

/* --- CANVAS --- */
/**
 * @property {number} width - Canvas width in pixels.
 * @property {number} height - Canvas height in pixels.
 */
export interface ScreenDimensions {
    width: number;
    height: number;
}

/**
 * @property {ScreenDimensions} size - Canvas dimensions (width and height).
 * @property {number} [threshold] - Extra area outside canvas before removing particles.
 * @property {string} backgroundColor - Background color of the canvas.
 * @property {HTMLElement} appendTo - HTML element to append the canvas to.
 * @property {"low" | "medium" | "high"} [smoothing] - Defines the image smoothing quality for rendering.
 * @property {string} id - Unique identifier for the canvas element.
 */
export interface CanvasConfig {
    size: ScreenDimensions;
    threshold?: number;
    backgroundColor: string;
    appendTo: HTMLElement;
    smoothing?: "low" | "medium" | "high";
    id: string;
}

/* --- PARTICLES --- */
/**
 * @property {number} [amplitude] - Strength of the oscillation curve applied to movement ("sin"/"cos" only).
 * @property {number} [frequency] - Speed of oscillation for the curve motion ("sin"/"cos" only).
 * @property {'sin' | 'cos' | number} [curve] - Type of curvature applied to particle movement (sinusoidal, cosine, or numeric value).
 * @property {Vec2} [axisCurve] - Defines how curvature is applied across the X/Y axes.
 */
export interface ParticleCurvature {
    amplitude?: number;
    frequency?: number;
    curve?: "sin" | "cos" | number;
    axisCurve?: Vec2;
}

/**
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
export interface ParticlesConfig {
    quantity?: number;
    velocity?: number;
    maxVelocity?: number;
    length?: number;
    maxLength?: number;
    size?: number;
    maxSize?: number;
    lifespan?: number;
    maxLifespan?: number;
    color?: string | string[] | null;
    spreadFactor?: number;
    curvature?: ParticleCurvature;
}

/**
 * @property {Vec2[]} [targets] - Starting positions where particles will move toward.
 * @property {Vec2[]} [spawners] - Spawn points where particles originate.
 */
export interface InitialPositionsConfig {
    targets?: Vec2[];
    spawners?: Vec2[];
}

/* --- STORAGE --- */
/**
 * @property {boolean} targets - Whether to store target positions.
 * @property {boolean} spawners - Whether to store spawner positions.
 */
export interface StoragePositions {
    targets: boolean;
    spawners: boolean;
}

/**
 * @property {"sessionStorage" | "localStorage"} storageType - Defines which storage type is used to save positions.
 * @property {StoragePositions} [storeListenersPositions] - Determines if positions added via listeners are saved.
 * @property {StoragePositions} [storeNewPositions] - Determines if new positions added via API methods are saved.
 */
export interface StorageConfig {
    storageType: "sessionStorage" | "localStorage";
    storeListenersPositions?: StoragePositions;
    storeNewPositions?: StoragePositions;
}

/* --- LISTENERS --- */
/**
 * @property {string} [color] - Color of the listener's visual marker.
 * @property {number} [size] - Size of the visual marker (square drawn on canvas).
 */
export interface ListenerIdentifier {
    color?: string;
    size?: number;
}

/**
 * @property {string} [keyboardTrigger] - Key that triggers listener behavior (e.g., spawn or target creation).
 * @property {ListenerIdentifier} [identifier] - Visual settings for listener markers.
 */
export interface Listener {
    keyboardTrigger?: string;
    identifier?: ListenerIdentifier;
}

/**
 * @property {string} [resetPositions] - Key used to clear all stored positions.
 * @property {string} [downloadPositions] - Key used to stored positions as JSON.
 * @property {Listener} [spawners] - Listener settings for spawner creation.
 * @property {Listener} [targets] - Listener settings for target creation.
 */
export interface ListenersConfig {
    resetPositions?: string;
    downloadPositions?: string;
    spawners?: Listener;
    targets?: Listener;
}

/* --- MAIN CONFIG --- */
/**
 * @property {CanvasConfig} canvas - Canvas setup (dimensions, color, and target container).
 * @property {ParticlesConfig} [particles] - Particle behavior and visual configuration.
 * @property {InitialPositionsConfig} [initialPositions] - Starting targets and spawners positions.
 * @property {ListenersConfig} [listeners] - Keyboard/mouse listener configurations.
 * @property {StorageConfig} [storage] - Storage options for saving and restoring positions.
 */
export interface EntropyParticlesConfig {
    canvas: CanvasConfig;
    particles?: ParticlesConfig;
    initialPositions?: InitialPositionsConfig;
    listeners?: ListenersConfig;
    storage?: StorageConfig;
}

// MAIN CLASS

/**
 * Main class for managing particle systems.
 * Handles initialization, rendering, and event listeners.
 */
export default class EntropyParticles {
    /**
     * Applies and validates the provided configuration.
     * Initializes the canvas and event listeners.
     */
    set config(configValue: EntropyParticlesConfig);

    /** Returns current configuration. */
    get config(): EntropyParticlesConfig | null;

    /** Returns initialized canvas element. */
    get canvas(): HTMLCanvasElement;

    /** Returns active target positions. */
    get targets(): Vec2[];

    /** Returns active spawner positions. */
    get spawners(): Vec2[];

    /**
     * Starts the animation loop.
     * Begins continuous particle rendering.
     */
    start(): void;

    /**
     * Pauses the animation loop.
     * Stops updating and rendering frames.
     */
    pause(): void;

    /**
     * Adds a new target point and optionally persists it to storage (storage config).
     */
    addTarget(newTarget: Vec2): void;

    /**
     * Adds a new spawner point and optionally persists it to storage (storage config).
     */
    addSpawner(newSpawner: Vec2): void;

    /**
     * Removes a target at the given position.
     */
    removeTargetAt(targetPosition: Vec2): void;

    /**
     * Removes a spawner at the given position.
     */
    removeSpawnerAt(spawnerPosition: Vec2): void;
}
