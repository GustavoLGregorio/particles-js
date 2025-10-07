import ParticlesJS from "./dist/particles.js";

// importing types
/** @typedef {import("./dist/particles.js").ParticlesJSConfig} ParticlesJSConfig */
/** @typedef {import("./dist/particles.js").Vec2} Vec2 */

const win_width = window.innerWidth;
const win_height = window.innerHeight;

const P = new ParticlesJS();
const pColors = ["red", "#c30020ff", "indigo", "purple", "magenta", "#d500aeff"];

/** @type {ParticlesJSConfig} */
const pConfig = {
    canvas: {
        appendTo: document.body,
        backgroundColor: "#0A0C12",
        size: { width: win_width, height: win_height },
        threshold: window.innerWidth * 0.2,
    },
    particles: {
        quantity: 2_000,
        length: 2,
        size: 1,
        maxSize: 5,
        velocity: 2,
        maxVelocity: 4,
        lifespan: 1 * 60,
        maxLifespan: 2.5 * 60,
        spreadFactor: 3,
        color: pColors,
        curvature: {
            curve: 0,
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
    // initialPositions sample bellow
    // initialPositions: {
    //     // spawners: (() => {
    //     //     const sps = [];
    //     //     for (let i = 0; i < 50; i++) {
    //     //         sps.push({
    //     //             x: window.innerWidth,
    //     //             y: Math.round(Math.random() * window.innerHeight),
    //     //         });
    //     //     }
    //     //     return sps;
    //     // })(),
    //     // targets: (() => {
    //     //     const tgs = [];
    //     //     for (let i = 0; i < 50; i++) {
    //     //         tgs.push({
    //     //             x: -20,
    //     //             y: Math.round(Math.random() * window.innerHeight),
    //     //         });
    //     //     }
    //     //     return tgs;
    //     // })(),
    // },
};

P.config = pConfig;

// movement effect
const maxCurve = 40;
let reverse = false;
setInterval(() => {
    if (
        pConfig.particles &&
        pConfig.particles.curvature &&
        typeof pConfig.particles.curvature.curve === "number"
    ) {
        if (pConfig.particles.curvature.curve === maxCurve) reverse = true;
        else if (pConfig.particles.curvature.curve === -maxCurve) reverse = false;

        if (reverse) pConfig.particles.curvature.curve -= 1;
        else pConfig.particles.curvature.curve += 1;
    }
}, 32);
