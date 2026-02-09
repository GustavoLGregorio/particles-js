<div align="center">

# 🌌 Entropy Particles

**Lightweight canvas particle system with trail effects, curvature motion, and chaotic animations**

[![npm version](https://img.shields.io/npm/v/entropy-particles.svg?style=flat-square)](https://www.npmjs.com/package/entropy-particles)
[![npm downloads](https://img.shields.io/npm/dm/entropy-particles.svg?style=flat-square)](https://www.npmjs.com/package/entropy-particles)
[![license](https://img.shields.io/npm/l/entropy-particles.svg?style=flat-square)](https://github.com/GustavoLGregorio/entropy-particles/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.npmjs.com/package/entropy-particles)

<video src="https://raw.githubusercontent.com/GustavoLGregorio/entropy-particles/main/demo/videos/entropy-particles.mp4" autoplay loop muted playsinline style="max-width: 100%; border-radius: 8px;"></video>

[Live Demo](https://particles-js-pi.vercel.app) • [Documentation](#%EF%B8%8F-configuration) • [Examples](#-usage)

</div>

---

## ✨ Features

- 🎨 **Dynamic Color Palettes** - Single colors, arrays, or random generation
- 🌀 **Curvature Motion** - Sinusoidal, cosine, or numeric curve patterns
- 🎯 **Spawner & Target System** - Control particle origin and destination points
- 📏 **Trail Effects** - Configurable particle trails with variable length
- ⚡ **Real-time Config Updates** - Change any property on the fly
- 💾 **Position Persistence** - Save spawners/targets to localStorage or sessionStorage
- 🖱️ **Interactive Listeners** - Keyboard and mouse events for dynamic control
- 📦 **Zero Dependencies** - Pure vanilla JavaScript
- 📝 **TypeScript Support** - Full type definitions included

## 📦 Installation

```bash
npm i entropy-particles
```

Or via CDN:

```html
<script type="module">
  import EntropyParticles from 'https://unpkg.com/entropy-particles/dist/entropy-particles.js';
</script>
```

## 🚀 Quick Start

```javascript
import EntropyParticles from "entropy-particles";

const particles = new EntropyParticles();

particles.config = {
  canvas: {
    id: "my-canvas",
    appendTo: document.body,
    backgroundColor: "#0a0c12",
    size: { width: window.innerWidth, height: window.innerHeight },
  },
  particles: {
    quantity: 2000,
    color: ["#d500ae", "#8b00ff", "#ff00ff"],
    velocity: 0.3,
    spreadFactor: 2,
    curvature: {
      curve: 15,
      axisCurve: { x: 20, y: 5 },
    },
  },
};

particles.start();
```

## 📖 Usage

### Basic Setup

```javascript
import EntropyParticles from "entropy-particles";

const ep = new EntropyParticles();

ep.config = {
  canvas: {
    id: "particles",
    appendTo: document.getElementById("container"),
    backgroundColor: "transparent",
    size: { width: 800, height: 600 },
    threshold: 100, // Extra area before removing particles
  },
  particles: {
    quantity: 1500,
    velocity: 0.25,
    maxVelocity: 0.8,
    size: 1,
    maxSize: 4,
    length: 3,        // Trail length
    maxLength: 6,
    lifespan: 120,    // Frames
    maxLifespan: 300,
    spreadFactor: 3,  // Chaos/randomness
    color: "#ff00ff", // Single color, array, or null for random
  },
};

ep.start();
```

### Spawners & Targets

Control where particles spawn and where they move toward:

```javascript
ep.config = {
  // ...canvas config
  initialPositions: {
    spawners: [
      { x: 0, y: 300 },
      { x: 800, y: 300 },
    ],
    targets: [
      { x: 400, y: 300 }, // Center point
    ],
  },
};

// Dynamic updates (real-time)
ep.spawners.push({ x: 100, y: 100 });
ep.targets[0].x = 500; // Move target
```

### Curvature Effects

Create mesmerizing curved motion patterns:

```javascript
particles: {
  curvature: {
    // Numeric value for constant curve
    curve: 15,
    
    // Or use "sin" / "cos" for oscillating curves
    // curve: "sin",
    // amplitude: 5,
    // frequency: 0.1,
    
    // Axis-specific curvature
    axisCurve: { x: 30, y: 10 },
  },
}
```

### Interactive Listeners

Enable keyboard/mouse interactions:

```javascript
listeners: {
  resetPositions: "r",      // Press R to reset
  downloadPositions: "d",   // Press D to export JSON
  spawners: {
    keyboardTrigger: "Control", // Ctrl+Click to add spawner
    identifier: { color: "blue", size: 6 },
  },
  targets: {
    keyboardTrigger: "Shift",   // Shift+Click to add target
    identifier: { color: "gold", size: 6 },
  },
},
```

### Position Persistence

Save positions across sessions:

```javascript
storage: {
  storageType: "localStorage", // or "sessionStorage"
  storeNewPositions: {
    spawners: true,
    targets: true,
  },
  storeListenersPositions: {
    spawners: true,
    targets: true,
  },
},
```

### Real-time Updates

All config properties can be updated dynamically:

```javascript
// Change colors on the fly
ep.config.particles.color = ["#00ff00", "#00ffff"];

// Animate curvature
setInterval(() => {
  ep.config.particles.curvature.curve = Math.sin(Date.now() * 0.001) * 25;
}, 16);

// Adjust particle count
ep.config.particles.quantity = 3000;
```

## ⚙️ Configuration

### Canvas Config

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Canvas element ID |
| `appendTo` | `HTMLElement` | Parent container |
| `backgroundColor` | `string` | Canvas background color |
| `size` | `{ width, height }` | Canvas dimensions |
| `threshold` | `number` | Buffer zone outside canvas |
| `smoothing` | `"low" \| "medium" \| "high"` | Image smoothing quality |

### Particles Config

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `quantity` | `number` | 2000 | Total particle count |
| `velocity` | `number` | 2 | Base movement speed |
| `maxVelocity` | `number` | - | Maximum velocity |
| `size` | `number` | 5 | Base particle size |
| `maxSize` | `number` | - | Maximum size |
| `length` | `number` | 2 | Trail length |
| `maxLength` | `number` | - | Maximum trail length |
| `lifespan` | `number` | 60 | Particle lifetime (frames) |
| `maxLifespan` | `number` | - | Maximum lifespan |
| `color` | `string \| string[] \| null` | random | Particle color(s) |
| `spreadFactor` | `number` | 3 | Random movement intensity |

### Curvature Config

| Property | Type | Description |
|----------|------|-------------|
| `curve` | `number \| "sin" \| "cos"` | Curvature type/value |
| `amplitude` | `number` | Oscillation strength (sin/cos) |
| `frequency` | `number` | Oscillation speed (sin/cos) |
| `axisCurve` | `{ x, y }` | Per-axis curvature multiplier |

## 🎮 API Methods

```javascript
const ep = new EntropyParticles();

// Lifecycle
ep.start();              // Start animation
ep.pause();              // Pause animation

// Position management
ep.addTarget({ x, y });      // Add target point
ep.addSpawner({ x, y });     // Add spawn point
ep.removeTargetAt({ x, y }); // Remove target
ep.removeSpawnerAt({ x, y }); // Remove spawner

// Direct access (reactive)
ep.targets;   // Vec2[] - Target positions array
ep.spawners;  // Vec2[] - Spawner positions array
ep.canvas;    // HTMLCanvasElement
ep.config;    // Current configuration
```

## 🌐 Live Demo

Check out the interactive demo at **[particles-js-pi.vercel.app](https://particles-js-pi.vercel.app)**

Features in the demo:
- 🎭 Multiple animation phases (vortex, explosion, spiral, waves, convergence, pulse)
- 🎨 Dynamic color palette transitions
- 🖱️ Mouse interaction mode (toggle with button)
- 📱 Touch support for mobile devices

## 📄 License

MIT © [Gustavo Luiz Gregorio](https://github.com/GustavoLGregorio)

---

<div align="center">

**[⬆ Back to top](#-entropy-particles)**

</div>
