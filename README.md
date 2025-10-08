# entropy-particles

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/GustavoLGregorio/entropy-particles/pulls)

<!-- [![npm](https://img.shields.io/npm/v/entropy-particles.svg)](https://www.npmjs.com/package/entropy-particles) -->

A lightweight and configurable **JavaScript particle engine** for creating dynamic, colorful, and chaotic visual effects.

ParticlesJS allows you to easily create and manage particle systems using simple configuration objects.  
It supports multiple emitters, motion curvature, interactive listeners, and persistent state storage — all powered by plain, and dependency-free, JavaScript.

## Features

- **JSDoc documentation** — methods and properties are well documented for a better use
- **Configurable systems** — control every property via simple JSON-like configs.
- **Dynamic colors** — supports arrays of color values or gradients.
- **Curvature motion** — add natural or chaotic motion through curve parameters.
- **Event listeners** — trigger resets, spawns, and effects using keyboard or external events.
- **Persistent storage** — save and restore spawners/targets using `sessionStorage` or `localStorage`.
- **Ease download of storage points** — save targets and spawners points direct into a `json` file for future use
- **Lightweight** — zero dependencies, runs directly in the browser.

## Installation

Using **npm**:

```bash
npm install entropy-particles
```

Using **bun**:

```bash
bun install entropy-particles
```

Or include manually:

```html
<script src="dist/index.js"><script>
```

## Basic Usage

```javascript
import EntropyParticles from "entropy-particles";

// optional type imports with JSDoc
/** @typedef {import("entropy-particles").EntropyParticlesConfig} EntropyParticlesConfig */

const particles = new EntropyParticles();

/** @type {EntropyParticlesConfig} */
particles.config = {
    canvas: {
        appendTo: document.body,
        size: { width: window.innerWidth, height: window.innerHeight },
        backgroundColor: "transparent",
    },
    particles: {
        quantity: 2000,
        color: ["red", "rbga(155,155,155,0.5)", "hsl(220,100%,50%)", "#0F0"],
        velocity: 0.25,
        curvature: {
            curve: 15,
            axisCurve: { x: 30, y: 5 },
        },
    },
    listeners: {
        resetPositions: "r",
        spawners: { keyboardTrigger: "Control" },
        targets: { keyboardTrigger: "Shift" },
    },
    storage: {
        storageType: "localStorage",
        storeNewPositions: { spawners: true, targets: true },
        storeListenersPositions: { spawners: true, targets: true },
    },
};

particles.start();
```

## Example: Dual Particle Systems

You can run multiple particle systems simultaneously for layered or mixed effects. Full example code in the [`demo/script.js`](https://github.com/GustavoLGregorio/entropy-particles/blob/main/demo/script.js) file.

```javascript
import EntropyParticles from "entropy-particles";

const pSpace = new EntropyParticles();
const pGalaxy = new EntropyParticles();

pSpace.config = {
    /* background stars */
};
pGalaxy.config = {
    /* colorful vortex */
};

pSpace.start();
pGalaxy.start();
```

## License

MIT © 2025 [Gustavo L. Gregorio](https://github.com/GustavoLGregorio)
