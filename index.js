import ParticlesJS from "./particles.js";

const pjsTargets = await fetchFile("targets.json");
const pjsSpawners = await fetchFile("spawners.json");

const P = new ParticlesJS();

P.config = {
	canvas: {
		appendTo: document.body,
		backgroundColor: "#101010",
		size: { width: window.innerWidth, height: window.innerHeight / 2 },
		// threshold: window.innerWidth * 0.2,
	},
	particles: {
		quantity: 2_000,
		maxLength: 10, // add fixed lenght
		maxSize: 10, // add fixed size
		velocity: 0, // add random velocity (maxVelocity)
		lifespan: 2 * 60, // add random lifespan (maxLifespan)
		spreadFactor: 2,
		// color: "white",
		curvature: {
			amplitude: 5,
			frequency: 0.1,
			curve: -5, // check jsdoc complaining about string values
		},
	},
	// targets: pjsTargets,
	// spawners: pjsSpawners,
	// add listeners functionability
	// listeners: {
	// 	spawners: {
	// 		enableListener: true,
	// 		keyboardTrigger: "Shift",
	// 		identifier: {
	// 			color: "red",
	// 			size: 12,
	// 			font: "monospace",
	// 		},
	// 	},
	// 	targets: {
	// 		enableListener: true,
	// 		keyboardTrigger: "Control",
	// 	},
	// },
};

/** @param {string} url */
async function fetchFile(url) {
	const fullUrl = window.location.href + url;

	const response = await fetch(fullUrl, {
		method: "GET",
		mode: "same-origin",
	});

	const res = await response.json();

	return res;
}
