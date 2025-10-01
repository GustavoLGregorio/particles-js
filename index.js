import ParticlesJS from "./particles.js";

const P = new ParticlesJS();

P.config = {
	canvas: {
		appendCanvasTo: document.body,
		backgroundColor: "#101010",
		size: { width: 350, height: 250 },
		threshold: window.innerWidth * 1.3,
	},
	particles: {
		quantity: 1_000,
		maxLength: 5,
		maxSize: 10,
		velocity: 0,
		lifespan: 2 * 60,
		spreadFactor: 2,
		color: "white",
	},
	targets: [],
	spawners: [],
	listeners: {
		spawners: {
			enableListener: true,
			keyboardTrigger: "Shift",
			identifier: {
				color: "red",
				size: 12,
				font: "monospace",
			},
		},
		targets: {
			enableListener: true,
			keyboardTrigger: "Control",
		},
	},
};
