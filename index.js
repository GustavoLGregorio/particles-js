import ParticlesJS from "./particles.js";

const P = new ParticlesJS();

/** @type {import("./particles.js").ParticlesJSConfig} */
const pConfig = {
    canvas: {
        appendTo: document.body,
        backgroundColor: "hsl(220,100%,5%)",
        size: { width: window.innerWidth, height: window.innerHeight },
        threshold: window.innerWidth * 0.2,
    },
    particles: {
        quantity: 1_000,
        length: 2,
        maxLength: 2,
        size: 1,
        // maxSize: 10,
        velocity: 5,
        // maxVelocity: 5,
        lifespan: 1.5 * 60,
        maxLifespan: 3 * 60,
        spreadFactor: 5,
        color: null,
        curvature: {
            curve: 0,
            amplitude: 5,
            frequency: 0.1,
        },
    },
    // listeners: {
    //     spawners: {
    //         enableListener: true,
    //         keyboardTrigger: "Control",
    //         identifier: {
    //             color: "red",
    //             size: 12,
    //             font: "monospace",
    //         },
    //     },
    //     targets: {
    //         enableListener: true,
    //         keyboardTrigger: "Shift",
    //     },
    // },

    // spawners: (() => {
    //     const sps = [];
    //     for (let i = 0; i < 50; i++) {
    //         sps.push({
    //             x: window.innerWidth,
    //             y: Math.round(Math.random() * window.innerHeight),
    //         });
    //     }
    //     return sps;
    // })(),
    // targets: (() => {
    //     const tgs = [];
    //     for (let i = 0; i < 50; i++) {
    //         tgs.push({
    //             x: -20,
    //             y: Math.round(Math.random() * window.innerHeight),
    //         });
    //     }
    //     return tgs;
    // })(),
};

P.config = pConfig;

let reverse = false;
setInterval(() => {
    if (
        pConfig.particles &&
        pConfig.particles.curvature &&
        typeof pConfig.particles.curvature.curve === "number"
    ) {
        if (pConfig.particles.curvature.curve === 30) {
            reverse = true;
        } else if (pConfig.particles.curvature.curve === -30) {
            reverse = false;
        }

        if (reverse) {
            pConfig.particles.curvature.curve -= 1;
        } else {
            pConfig.particles.curvature.curve += 1;
        }
    }
}, 32);
