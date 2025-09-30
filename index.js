import ParticlesJS from "./particles";

const P = new ParticlesJS();

P.config = {
	canvas: {
		appendCanvasTo: document.body,
		backgroundColor: "#000",
		size: { width: window.innerWidth, height: window.innerHeight },
		smoothing: undefined,
		threshold: window.innerWidth * 1.3,
	},
	particles: {
		quantity: 2_000,
		maxLength: 5,
		maxSize: 5,
		velocity: 5,
		lifespan: 3 * 60,
		spreadFactor: 3,
		color: null,
	},
	listeners: {
		spawners: {
			enableListener: true,
			keyboardTrigger: "Shift",
		},
		targets: {
			enableListener: true,
			keyboardTrigger: "Control",
		},
	},
};
