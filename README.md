# entropy-particles

[![npm](https://img.shields.io/npm/v/entropy-particles.svg)](https://www.npmjs.com/package/entropy-particles)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/GustavoLGregorio/entropy-particles/pulls)

![EntropyParticles two layer Galaxy & Space preview](./demo/preview/demo.gif)

A lightweight and configurable **JavaScript particle engine** for creating dynamic, colorful, and chaotic visual effects.

ParticlesJS allows you to easily create and manage particle systems using simple configuration objects.  
It supports multiple emitters, motion curvature, interactive listeners, and persistent state storage — all powered by plain, and dependency-free, JavaScript.

## Features

- **JSDoc documentation** — methods and properties are well documented for a better use
- **TypeScript support** — supports type imports
- **Configurable systems** — control every property via simple JSON-like configs.
- **Dynamic colors** — supports arrays of color values or gradients.
- **Curvature motion** — add natural or chaotic motion through curve parameters.
- **Event listeners** — trigger resets, spawns, and effects using keyboard or external events.
- **Persistent storage** — save and restore spawners/targets using `sessionStorage` or `localStorage`.
- **Ease download of storage points** — save targets and spawners points direct into a JSON file for future use
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

Or include it manually (file can be found in the `dist` folder):

```html
<script src="lib/entropy-particles.js"><script>
```

## Basic Usage with JS + JSDoc

```javascript
import EntropyParticles from "entropy-particles";

/** @typedef {import("entropy-particles").EntropyParticlesConfig} EntropyParticlesConfig */

const particles = new EntropyParticles();

/** @type {EntropyParticlesConfig} */
particles.config = {
    canvas: {
        id: "particles",
        appendTo: document.body,
        size: { width: window.innerWidth, height: window.innerHeight },
        backgroundColor: "black",
    },
    particles: {
        quantity: 2000,
        color: ["red", "rbga(155,155,155,0.5)", "hsl(220,100%,50%)", "#0F0"],
        velocity: 0.25,
        lifespan: 2 * 60,
        maxLifespan: 3 * 60,
        spreadFactor: 3,
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

## Basic Usage with TS + React

```typescript
import { useRef, useEffect } from "react";

import EntropyParticles from "entropy-particles";
import type { EntropyParticlesConfig } from "entropy-particles";

export default function Particles() {
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const divCurrent = divRef.current!;

        const particles = new EntropyParticles();

        const pConfig: EntropyParticlesConfig = {
            canvas: {
                id: "particles",
                appendTo: divCurrent,
                backgroundColor: "transparent",
                size: { width: divCurrent.clientWidth, height: divCurrent.clientHeight },
                threshold: divCurrent.clientWidth * 0.2,
            },
            particles: {
                quantity: 1_000,
                color: ["red", "purple", "pink"],
            },
        };

        particles.config = pConfig;
        particles.start();
    }, []);

    return <div ref={divRef} className="absolute z-[-10] h-dvh w-dvw"></div>;
}
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
