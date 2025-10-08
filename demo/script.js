import EntropyParticles from "./lib/entropy-particles.js";

// importing types
/** @typedef {import("./lib/entropy-particles.js").EntropyParticlesConfig} EntropyParticlesConfig */
/** @typedef {import("./lib/entropy-particles.js").Vec2} Vec2 */

const win_width = window.innerWidth;
const win_height = window.innerHeight;

const pSpace = new EntropyParticles();
const pGalaxy = new EntropyParticles();
const pGalaxyColors = ["red", "#c30020ff", "indigo", "purple", "magenta", "#d500aeff"];

/** @type {EntropyParticlesConfig} */
const pGalaxyConfig = {
    canvas: {
        id: "space",
        appendTo: document.body,
        backgroundColor: "transparent",
        size: { width: win_width, height: win_height },
        threshold: window.innerWidth * 0.2,
    },
    particles: {
        quantity: 2_000,
        length: 2,
        size: 1,
        maxSize: 5,
        velocity: 0.25,
        maxVelocity: 0.85,
        lifespan: 1 * 60,
        maxLifespan: 3 * 60,
        spreadFactor: 3,
        color: pGalaxyColors,
        curvature: {
            curve: 15,
            axisCurve: {
                x: 30,
                y: 5,
            },
            // amplitude: 5,
            // frequency: 0.1,
        },
    },
    listeners: {
        resetPositions: "r",
        downloadPositions: "d",
        spawners: {
            keyboardTrigger: "Control",
            // identifier: {
            //     color: "white",
            //     size: 4,
            // },
        },
        targets: {
            keyboardTrigger: "Shift",
            // identifier: {
            //     color: "gold",
            //     size: 4,
            // },
        },
    },
    storage: {
        storageType: "localStorage",
        storeNewPositions: {
            spawners: true,
            targets: true,
        },
        storeListenersPositions: {
            spawners: true,
            targets: true,
        },
    },
    // initialPositions: {
    //     spawners: (() => {
    //         /** @type {Vec2[]} */
    //         const sps = [];
    //         const qtd = 200;
    //         for (let i = 0; i < qtd; ++i) {
    //             sps.push({
    //                 x: Math.round(Math.random() * win_width),
    //                 y: win_height / 4 + Math.round((Math.random() * win_height) / 2),
    //             });
    //         }
    //         return sps;
    //     })(),
    // },
};

/** @type {EntropyParticlesConfig} */
const pSpaceConfig = {
    canvas: {
        id: "galaxy",
        appendTo: document.body,
        backgroundColor: "transparent",
        size: { width: win_width, height: win_height },
        threshold: window.innerWidth * 0.2,
    },
    particles: {
        quantity: 250,
        length: 4,
        size: 1,
        maxSize: 5,
        velocity: 0,
        lifespan: 2 * 60,
        maxLifespan: 5 * 60,
        spreadFactor: 0.3,
        color: "white",
        curvature: {
            curve: 0,
            axisCurve: {
                x: 0,
                y: 0,
            },
            amplitude: 0,
            frequency: 0,
        },
    },
    listeners: {
        resetPositions: "r",
        downloadPositions: "d",
        spawners: {
            keyboardTrigger: "Control",
            // identifier: {
            //     color: "white",
            //     size: 4,
            // },
        },
        targets: {
            keyboardTrigger: "Shift",
            // identifier: {
            //     color: "gold",
            //     size: 4,
            // },
        },
    },
    storage: {
        storageType: "localStorage",
        storeNewPositions: {
            spawners: true,
            targets: true,
        },
        storeListenersPositions: {
            spawners: true,
            targets: true,
        },
    },
};

pSpace.config = pSpaceConfig;
pGalaxy.config = pGalaxyConfig;

pSpace.start();
pGalaxy.start();

// movement effect

// const maxCurve = 25;
// let reverse = false;
// setInterval(() => {
//     if (
//         pGalaxyConfig.particles &&
//         pGalaxyConfig.particles.curvature &&
//         typeof pGalaxyConfig.particles.curvature.curve === "number"
//     ) {
//         if (pGalaxyConfig.particles.curvature.curve === maxCurve) reverse = true;
//         else if (pGalaxyConfig.particles.curvature.curve === -maxCurve) reverse = false;

//         if (reverse) pGalaxyConfig.particles.curvature.curve -= 1;
//         else pGalaxyConfig.particles.curvature.curve += 1;
//     }
// }, 32);
