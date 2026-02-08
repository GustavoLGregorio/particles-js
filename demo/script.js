import EntropyParticles from "./lib/entropy-particles.js";

/** @typedef {import("./lib/entropy-particles.js").EntropyParticlesConfig} EPConfig */
/** @typedef {import("./lib/entropy-particles.js").Vec2} Vec2 */

let win_width = window.innerWidth;
let win_height = window.innerHeight;
const centerX = () => win_width / 2;
const centerY = () => win_height / 2;

// === MOUSE INTERACTION ===

let mouseInteractionEnabled = false;
let mousePos = { x: centerX(), y: centerY() };
let smoothMousePos = { x: centerX(), y: centerY() };
let isMouseDown = false;
let mouseClickTime = 0;

// Mouse interaction modes per phase
const mouseInteractionModes = {
    vortex: "attract",      // Particles spiral toward mouse
    explosion: "burst",      // Click creates explosion from mouse
    spiral: "orbit",         // Mouse becomes orbit center
    waves: "ripple",         // Mouse creates wave disturbance
    convergence: "repel",    // Mouse pushes particles away
    pulse: "spawn"           // Mouse spawns particles on click
};

// === UTILITY FUNCTIONS ===

/** Linear interpolation */
const lerp = (start, end, t) => start + (end - start) * Math.min(1, Math.max(0, t));

/** Easing function for smooth transitions */
const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/** Generate circular positions */
const getCirclePositions = (cx, cy, radius, count) => {
    const positions = [];
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        positions.push({
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius
        });
    }
    return positions;
};

/** Generate spiral positions */
const getSpiralPositions = (cx, cy, startRadius, endRadius, turns, count) => {
    const positions = [];
    for (let i = 0; i < count; i++) {
        const t = i / count;
        const angle = t * Math.PI * 2 * turns;
        const radius = lerp(startRadius, endRadius, t);
        positions.push({
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius
        });
    }
    return positions;
};

/** Generate grid positions */
const getGridPositions = (startX, startY, cols, rows, spacing) => {
    const positions = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            positions.push({
                x: startX + c * spacing,
                y: startY + r * spacing
            });
        }
    }
    return positions;
};

// === COLOR PALETTES ===

const palettes = {
    galaxy: ["#d500ae", "#8b00ff", "#4b0082", "#9400d3", "#ff00ff", "#c71585"],
    fire: ["#ff4500", "#ff6347", "#ff8c00", "#ffa500", "#ffd700", "#ffff00"],
    ocean: ["#00008b", "#0000cd", "#1e90ff", "#00bfff", "#00ffff", "#7fffd4"],
    aurora: ["#00ff00", "#00ff7f", "#00fa9a", "#40e0d0", "#48d1cc", "#00ced1"],
    sunset: ["#ff1493", "#ff4500", "#ff6347", "#ff7f50", "#ffa07a", "#ffd700"],
    cosmic: ["#9400d3", "#4b0082", "#0000ff", "#00ff00", "#ffff00", "#ff7f00"],
    neon: ["#ff00ff", "#00ffff", "#ff0080", "#80ff00", "#0080ff", "#ff8000"],
    ice: ["#e0ffff", "#afeeee", "#87ceeb", "#00bfff", "#1e90ff", "#4169e1"]
};

const paletteNames = Object.keys(palettes);
let currentPaletteIndex = 0;
let nextPaletteIndex = 1;
let paletteTransition = 0;

/** Interpolate between two colors */
const lerpColor = (color1, color2, t) => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    const r = Math.round(lerp(r1, r2, t));
    const g = Math.round(lerp(g1, g2, t));
    const b = Math.round(lerp(b1, b2, t));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/** Get interpolated palette */
const getTransitionPalette = () => {
    const current = palettes[paletteNames[currentPaletteIndex]];
    const next = palettes[paletteNames[nextPaletteIndex]];
    const t = easeInOut(paletteTransition);
    return current.map((c, i) => lerpColor(c, next[i % next.length], t));
};

// === ANIMATION PHASES ===

const phases = [
    {
        name: "vortex",
        duration: 12000,
        mouseMode: "attract",
        setup: (config, spawners, targets) => {
            spawners.length = 0;
            targets.length = 0;
            const circleSpawns = getCirclePositions(centerX(), centerY(), Math.min(win_width, win_height) * 0.35, 8);
            circleSpawns.forEach(p => spawners.push(p));
            targets.push({ x: centerX(), y: centerY() });
        },
        update: (config, elapsedMs) => {
            const t = elapsedMs * 0.001;
            if (config.particles?.curvature) {
                config.particles.curvature.curve = Math.sin(t) * 25;
                config.particles.curvature.axisCurve = {
                    x: 30 + Math.sin(t * 0.5) * 10,
                    y: 5 + Math.cos(t * 0.7) * 3
                };
            }
            if (config.particles) {
                config.particles.velocity = 0.2 + Math.sin(t * 0.3) * 0.1;
                const chaos = Math.sin(t * 0.4) * 0.5 + 0.5;
                config.particles.spreadFactor = 0.5 + chaos * 4;
                config.particles.size = 1 + Math.sin(t * 1.5) * 0.5;
                config.particles.maxSize = 3 + Math.sin(t * 0.8) * 1;
            }
        },
        onMouseMove: (config, spawners, targets, mouseX, mouseY) => {
            // Attract: increase curvature toward mouse direction
            if (config.particles?.curvature && mouseInteractionEnabled) {
                const dx = mouseX - centerX();
                const dy = mouseY - centerY();
                const angle = Math.atan2(dy, dx);
                config.particles.curvature.axisCurve = {
                    x: 30 + Math.cos(angle) * 15,
                    y: 5 + Math.sin(angle) * 10
                };
            }
        },
        onMouseClick: (config, spawners, targets, mouseX, mouseY) => {
            // Create temporary attraction point
        }
    },
    {
        name: "explosion",
        duration: 10000,
        mouseMode: "burst",
        setup: (config, spawners, targets) => {
            spawners.length = 0;
            targets.length = 0;
            spawners.push({ x: centerX(), y: centerY() });
            const edgeTargets = getCirclePositions(centerX(), centerY(), Math.min(win_width, win_height) * 0.45, 12);
            edgeTargets.forEach(p => targets.push(p));
        },
        update: (config, elapsedMs) => {
            const t = elapsedMs * 0.001;
            if (config.particles?.curvature) {
                config.particles.curvature.curve = Math.cos(t * 2) * 15;
                config.particles.curvature.axisCurve = {
                    x: 15 + Math.sin(t) * 10,
                    y: 15 + Math.cos(t) * 10
                };
            }
            if (config.particles) {
                config.particles.velocity = 0.4 + Math.sin(t) * 0.2;
                const burst = Math.abs(Math.sin(t * 1.5));
                config.particles.spreadFactor = 3 + burst * 6;
                config.particles.size = 1 + burst * 2;
                config.particles.maxSize = 2 + burst * 3;
            }
        },
        onMouseMove: (config, spawners, targets, mouseX, mouseY) => {
            // Burst mode: spawner follows mouse when enabled
            if (mouseInteractionEnabled && spawners.length > 0) {
                spawners[0].x = lerp(spawners[0].x, mouseX, 0.05);
                spawners[0].y = lerp(spawners[0].y, mouseY, 0.05);
            }
        },
        onMouseClick: (config, spawners, targets, mouseX, mouseY) => {
            // Burst: temporarily increase particle count and spread
            if (config.particles) {
                config.particles.quantity = 3500;
                config.particles.spreadFactor = 12;
                config.particles.velocity = 0.8;
                // Reset after burst
                setTimeout(() => {
                    if (config.particles) {
                        config.particles.quantity = 2000;
                    }
                }, 500);
            }
        }
    },
    {
        name: "spiral",
        duration: 15000,
        mouseMode: "orbit",
        setup: (config, spawners, targets) => {
            spawners.length = 0;
            targets.length = 0;
            const spiralSpawns = getSpiralPositions(centerX(), centerY(), 50, Math.min(win_width, win_height) * 0.4, 3, 16);
            spiralSpawns.forEach(p => spawners.push(p));
            targets.push({ x: centerX(), y: centerY() });
        },
        update: (config, elapsedMs) => {
            const t = elapsedMs * 0.001;
            if (config.particles?.curvature) {
                const wave = Math.sin(t * 0.8) * 20;
                config.particles.curvature.curve = wave;
                config.particles.curvature.axisCurve = {
                    x: 20 + wave * 0.5,
                    y: 10 + Math.cos(t) * 5
                };
            }
            if (config.particles) {
                config.particles.velocity = 0.15 + Math.abs(Math.sin(t * 0.5)) * 0.15;
                config.particles.length = 2 + Math.round(Math.sin(t) * 1);
                const pulse = Math.pow(Math.sin(t * 0.6), 4);
                config.particles.spreadFactor = 0.3 + pulse * 3;
                config.particles.size = 0.5 + Math.abs(Math.sin(t * 0.7)) * 1.5;
                config.particles.maxSize = 2 + Math.sin(t * 0.5) * 1;
            }
        },
        onMouseMove: (config, spawners, targets, mouseX, mouseY) => {
            // Orbit: target follows mouse, creating orbital motion
            if (mouseInteractionEnabled && targets.length > 0) {
                targets[0].x = lerp(targets[0].x, mouseX, 0.08);
                targets[0].y = lerp(targets[0].y, mouseY, 0.08);
            }
        },
        onMouseClick: (config, spawners, targets, mouseX, mouseY) => {
            // Add orbiting spawners around click position
            const orbitSpawns = getCirclePositions(mouseX, mouseY, 100, 4);
            orbitSpawns.forEach(p => spawners.push(p));
            // Remove after delay
            setTimeout(() => {
                for (let i = 0; i < 4; i++) {
                    spawners.pop();
                }
            }, 3000);
        }
    },
    {
        name: "waves",
        duration: 12000,
        mouseMode: "ripple",
        setup: (config, spawners, targets) => {
            spawners.length = 0;
            targets.length = 0;
            for (let i = 0; i < 10; i++) {
                spawners.push({ x: 0, y: (win_height / 10) * i + win_height / 20 });
            }
            for (let i = 0; i < 10; i++) {
                targets.push({ x: win_width, y: (win_height / 10) * i + win_height / 20 });
            }
        },
        update: (config, elapsedMs) => {
            const t = elapsedMs * 0.001;
            if (config.particles?.curvature) {
                config.particles.curvature.curve = "sin";
                config.particles.curvature.amplitude = 8 + Math.sin(t) * 4;
                config.particles.curvature.frequency = 0.08 + Math.sin(t * 0.5) * 0.04;
                config.particles.curvature.axisCurve = { x: 1, y: 20 };
            }
            if (config.particles) {
                config.particles.velocity = 0.5 + Math.sin(t) * 0.2;
                config.particles.spreadFactor = 0.1 + Math.abs(Math.sin(t * 0.3)) * 0.4;
                config.particles.size = 1 + Math.sin(t * 2) * 0.5;
                config.particles.maxSize = 2 + Math.cos(t * 1.5) * 1;
            }
        },
        onMouseMove: (config, spawners, targets, mouseX, mouseY) => {
            // Ripple: mouse Y position affects wave amplitude
            if (mouseInteractionEnabled && config.particles?.curvature) {
                const normalizedY = (mouseY / win_height - 0.5) * 2;
                config.particles.curvature.amplitude = 8 + normalizedY * 10;
                config.particles.curvature.frequency = 0.08 + (mouseX / win_width) * 0.1;
            }
        },
        onMouseClick: (config, spawners, targets, mouseX, mouseY) => {
            // Ripple burst: add spawner at mouse Y level
            const newSpawner = { x: 0, y: mouseY };
            const newTarget = { x: win_width, y: mouseY };
            spawners.push(newSpawner);
            targets.push(newTarget);
            // Remove after delay
            setTimeout(() => {
                const sIdx = spawners.indexOf(newSpawner);
                const tIdx = targets.indexOf(newTarget);
                if (sIdx > -1) spawners.splice(sIdx, 1);
                if (tIdx > -1) targets.splice(tIdx, 1);
            }, 4000);
        }
    },
    {
        name: "convergence",
        duration: 10000,
        mouseMode: "repel",
        setup: (config, spawners, targets) => {
            spawners.length = 0;
            targets.length = 0;
            spawners.push({ x: 0, y: 0 });
            spawners.push({ x: win_width, y: 0 });
            spawners.push({ x: 0, y: win_height });
            spawners.push({ x: win_width, y: win_height });
            spawners.push({ x: win_width / 2, y: 0 });
            spawners.push({ x: win_width / 2, y: win_height });
            spawners.push({ x: 0, y: win_height / 2 });
            spawners.push({ x: win_width, y: win_height / 2 });
            targets.push({ x: centerX(), y: centerY() });
        },
        update: (config, elapsedMs) => {
            const t = elapsedMs * 0.001;
            if (config.particles?.curvature) {
                config.particles.curvature.curve = Math.sin(t) * 10;
                config.particles.curvature.axisCurve = {
                    x: 5 + Math.sin(t * 2) * 5,
                    y: 5 + Math.cos(t * 2) * 5
                };
            }
            if (config.particles) {
                config.particles.velocity = 0.3 + Math.sin(t * 0.8) * 0.15;
                const intensity = (t % 5) / 5;
                config.particles.spreadFactor = 1 + intensity * 2.5 + Math.sin(t * 2) * 0.5;
                config.particles.size = 0.8 + intensity * 1.5;
                config.particles.maxSize = 2 + intensity * 2;
            }
        },
        onMouseMove: (config, spawners, targets, mouseX, mouseY) => {
            // Repel: push target away from mouse
            if (mouseInteractionEnabled && targets.length > 0) {
                const dx = centerX() - mouseX;
                const dy = centerY() - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const pushStrength = Math.max(0, 200 - dist) / 200;
                targets[0].x = centerX() + dx * pushStrength * 0.5;
                targets[0].y = centerY() + dy * pushStrength * 0.5;
            }
        },
        onMouseClick: (config, spawners, targets, mouseX, mouseY) => {
            // Scatter: temporarily add multiple targets around mouse
            const scatterTargets = getCirclePositions(mouseX, mouseY, 150, 6);
            scatterTargets.forEach(p => targets.push(p));
            setTimeout(() => {
                for (let i = 0; i < 6; i++) {
                    targets.pop();
                }
            }, 2500);
        }
    },
    {
        name: "pulse",
        duration: 12000,
        mouseMode: "spawn",
        setup: (config, spawners, targets) => {
            spawners.length = 0;
            targets.length = 0;
            spawners.push({ x: centerX(), y: centerY() });
            const rings = [0.15, 0.3, 0.45];
            rings.forEach(r => {
                const ringTargets = getCirclePositions(centerX(), centerY(), Math.min(win_width, win_height) * r, 6);
                ringTargets.forEach(p => targets.push(p));
            });
        },
        update: (config, elapsedMs) => {
            const t = elapsedMs * 0.001;
            const pulse = Math.sin(t * 2) * 0.5 + 0.5;
            if (config.particles?.curvature) {
                config.particles.curvature.curve = pulse * 30 - 15;
                config.particles.curvature.axisCurve = {
                    x: 10 + pulse * 20,
                    y: 10 + pulse * 10
                };
            }
            if (config.particles) {
                config.particles.velocity = 0.2 + pulse * 0.3;
                config.particles.quantity = 1500 + Math.round(pulse * 1000);
                config.particles.spreadFactor = 0.2 + pulse * 5;
                config.particles.size = 0.5 + pulse * 2;
                config.particles.maxSize = 2 + pulse * 2;
            }
        },
        onMouseMove: (config, spawners, targets, mouseX, mouseY) => {
            // Spawn: spawner follows mouse
            if (mouseInteractionEnabled && spawners.length > 0) {
                spawners[0].x = lerp(spawners[0].x, mouseX, 0.1);
                spawners[0].y = lerp(spawners[0].y, mouseY, 0.1);
            }
        },
        onMouseClick: (config, spawners, targets, mouseX, mouseY) => {
            // Add new ring of targets around click
            const clickRing = getCirclePositions(mouseX, mouseY, 100, 4);
            clickRing.forEach(p => targets.push(p));
            // Add spawner at click
            const clickSpawner = { x: mouseX, y: mouseY };
            spawners.push(clickSpawner);
            // Burst effect
            if (config.particles) {
                config.particles.quantity = 3000;
                config.particles.spreadFactor = 8;
            }
            setTimeout(() => {
                for (let i = 0; i < 4; i++) {
                    targets.pop();
                }
                const sIdx = spawners.indexOf(clickSpawner);
                if (sIdx > -1) spawners.splice(sIdx, 1);
                if (config.particles) {
                    config.particles.quantity = 2000;
                }
            }, 2000);
        }
    }
];

let currentPhaseIndex = 0;
let phaseStartTime = 0;

const pSpace = new EntropyParticles();
const pGalaxy = new EntropyParticles();

/** @type {EPConfig} */
const pGalaxyConfig = {
    canvas: {
        id: "galaxy",
        appendTo: document.body,
        backgroundColor: "transparent",
        size: { width: win_width, height: win_height },
        threshold: window.innerWidth * 0.2,
    },
    particles: {
        quantity: 2000,
        length: 2,
        size: 1,
        maxSize: 3,
        velocity: 0.25,
        maxVelocity: 0.85,
        lifespan: 1 * 60,
        maxLifespan: 3 * 60,
        spreadFactor: 3,
        color: palettes.galaxy,
        curvature: {
            curve: 15,
            axisCurve: { x: 30, y: 5 },
        },
    },
    listeners: {
        resetPositions: "r",
        downloadPositions: "d",
        spawners: { keyboardTrigger: "Control" },
        targets: { keyboardTrigger: "Shift" },
    },
    storage: {
        storageType: "localStorage",
        storeNewPositions: { spawners: true, targets: true },
        storeListenersPositions: { spawners: true, targets: true },
    },
};

/** @type {EPConfig} */
const pSpaceConfig = {
    canvas: {
        id: "space",
        appendTo: document.body,
        backgroundColor: "transparent",
        size: { width: win_width, height: win_height },
        threshold: window.innerWidth * 0.2,
    },
    particles: {
        quantity: 300,
        length: 2,
        size: 1,
        maxSize: 3,
        velocity: 0,
        lifespan: 3 * 60,
        maxLifespan: 6 * 60,
        spreadFactor: 0.2,
        color: ["white", "#e0e0ff", "#fffacd", "#f0f8ff"],
        curvature: {
            curve: 0,
            axisCurve: { x: 0, y: 0 },
            amplitude: 0,
            frequency: 0,
        },
    },
    listeners: {
        resetPositions: "r",
        downloadPositions: "d",
        spawners: { keyboardTrigger: "Control" },
        targets: { keyboardTrigger: "Shift" },
    },
    storage: {
        storageType: "localStorage",
        storeNewPositions: { spawners: true, targets: true },
        storeListenersPositions: { spawners: true, targets: true },
    },
};

pSpace.config = pSpaceConfig;
pGalaxy.config = pGalaxyConfig;

// Initial phase setup
phases[currentPhaseIndex].setup(pGalaxyConfig, pGalaxy.spawners, pGalaxy.targets);

pSpace.start();
pGalaxy.start();

// === MOUSE INTERACTION SETUP ===

/** @type {Vec2 | null} */
let mouseTarget = null;

const updateMouseTarget = () => {
    smoothMousePos.x = lerp(smoothMousePos.x, mousePos.x, 0.1);
    smoothMousePos.y = lerp(smoothMousePos.y, mousePos.y, 0.1);
    
    if (mouseInteractionEnabled && mouseTarget) {
        mouseTarget.x = smoothMousePos.x;
        mouseTarget.y = smoothMousePos.y;
    }
    
    // Call phase-specific mouse move handler
    const currentPhase = phases[currentPhaseIndex];
    if (currentPhase.onMouseMove && mouseInteractionEnabled) {
        currentPhase.onMouseMove(pGalaxyConfig, pGalaxy.spawners, pGalaxy.targets, smoothMousePos.x, smoothMousePos.y);
    }
};

const enableMouseInteraction = () => {
    mouseTarget = { x: smoothMousePos.x, y: smoothMousePos.y };
    pGalaxy.targets.unshift(mouseTarget);
    mouseInteractionEnabled = true;
};

const disableMouseInteraction = () => {
    if (mouseTarget && pGalaxy.targets.includes(mouseTarget)) {
        const index = pGalaxy.targets.indexOf(mouseTarget);
        pGalaxy.targets.splice(index, 1);
    }
    mouseTarget = null;
    mouseInteractionEnabled = false;
    
    // Reset phase to default state
    phases[currentPhaseIndex].setup(pGalaxyConfig, pGalaxy.spawners, pGalaxy.targets);
    if (mouseInteractionEnabled) {
        enableMouseInteraction();
    }
};

// Mouse move listener
window.addEventListener("mousemove", (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
});

// Mouse click listener for interactions
window.addEventListener("mousedown", (e) => {
    isMouseDown = true;
    mouseClickTime = performance.now();
    
    if (mouseInteractionEnabled) {
        const currentPhase = phases[currentPhaseIndex];
        if (currentPhase.onMouseClick) {
            currentPhase.onMouseClick(pGalaxyConfig, pGalaxy.spawners, pGalaxy.targets, e.clientX, e.clientY);
        }
    }
});

window.addEventListener("mouseup", () => {
    isMouseDown = false;
});

// Touch support
window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
        mousePos.x = e.touches[0].clientX;
        mousePos.y = e.touches[0].clientY;
    }
});

window.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0 && mouseInteractionEnabled) {
        const currentPhase = phases[currentPhaseIndex];
        if (currentPhase.onMouseClick) {
            currentPhase.onMouseClick(pGalaxyConfig, pGalaxy.spawners, pGalaxy.targets, e.touches[0].clientX, e.touches[0].clientY);
        }
    }
});

// Toggle button setup
document.addEventListener("DOMContentLoaded", () => {
    const btnMouse = document.getElementById("btn-mouse");
    if (btnMouse) {
        btnMouse.addEventListener("click", () => {
            const isActive = btnMouse.getAttribute("data-active") === "true";
            if (isActive) {
                disableMouseInteraction();
                btnMouse.setAttribute("data-active", "false");
            } else {
                enableMouseInteraction();
                btnMouse.setAttribute("data-active", "true");
            }
        });
    }

    // Copy button functionality
    const btnCopy = document.getElementById("btn-copy");
    if (btnCopy) {
        btnCopy.addEventListener("click", () => {
            navigator.clipboard.writeText("npm i entropy-particles").then(() => {
                btnCopy.classList.add("copied");
                setTimeout(() => {
                    btnCopy.classList.remove("copied");
                }, 2000);
            });
        });
    }

    // Hide UI functionality
    const btnHide = document.getElementById("btn-hide");
    if (btnHide) {
        btnHide.addEventListener("click", () => {
            const isHidden = document.body.getAttribute("data-ui-hidden") === "true";
            document.body.setAttribute("data-ui-hidden", isHidden ? "false" : "true");
            btnHide.setAttribute("data-active", isHidden ? "false" : "true");
        });
    }
});

// === MAIN ANIMATION LOOP ===

let lastTime = 0;
const PALETTE_TRANSITION_SPEED = 0.08;

const animate = (currentTime) => {
    if (lastTime === 0) {
        lastTime = currentTime;
        phaseStartTime = currentTime;
    }
    
    const dtMs = currentTime - lastTime;
    const dtSec = dtMs / 1000;
    lastTime = currentTime;

    const currentPhase = phases[currentPhaseIndex];
    const phaseElapsed = currentTime - phaseStartTime;

    // Update mouse target position and phase-specific behavior
    updateMouseTarget();

    // Update current phase
    currentPhase.update(pGalaxyConfig, phaseElapsed);

    // Color palette transition
    paletteTransition += dtSec * PALETTE_TRANSITION_SPEED;
    if (paletteTransition >= 1) {
        paletteTransition = 0;
        currentPaletteIndex = nextPaletteIndex;
        nextPaletteIndex = (nextPaletteIndex + 1) % paletteNames.length;
    }
    
    if (pGalaxyConfig.particles) {
        pGalaxyConfig.particles.color = getTransitionPalette();
    }

    // Phase transition
    if (phaseElapsed >= currentPhase.duration) {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        phaseStartTime = currentTime;
        
        const wasMouseEnabled = mouseInteractionEnabled;
        if (wasMouseEnabled) {
            disableMouseInteraction();
        }
        
        phases[currentPhaseIndex].setup(pGalaxyConfig, pGalaxy.spawners, pGalaxy.targets);
        
        if (wasMouseEnabled) {
            enableMouseInteraction();
        }
    }

    // Background stars subtle movement
    if (pSpaceConfig.particles) {
        const starTime = currentTime * 0.001;
        pSpaceConfig.particles.spreadFactor = 0.15 + Math.sin(starTime * 0.1) * 0.1;
    }

    requestAnimationFrame(animate);
};

phaseStartTime = 0;
requestAnimationFrame(animate);

// === RESIZE HANDLER ===

window.addEventListener("resize", () => {
    win_width = window.innerWidth;
    win_height = window.innerHeight;
    
    if (pGalaxyConfig.canvas) {
        pGalaxyConfig.canvas.size = { width: win_width, height: win_height };
    }
    if (pSpaceConfig.canvas) {
        pSpaceConfig.canvas.size = { width: win_width, height: win_height };
    }
    
    const wasMouseEnabled = mouseInteractionEnabled;
    if (wasMouseEnabled) {
        disableMouseInteraction();
    }
    
    phases[currentPhaseIndex].setup(pGalaxyConfig, pGalaxy.spawners, pGalaxy.targets);
    
    if (wasMouseEnabled) {
        enableMouseInteraction();
    }
});
