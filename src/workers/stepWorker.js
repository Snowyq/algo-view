let sharedIndex = null; // Uint32Array wrapping SharedArrayBuffer
let interval = 100; // default ms
let maxStep = 100;
let timerId = null;
const channel = new BroadcastChannel("animation-tick");

onmessage = event => {
	const { type, payload } = event.data;

	if (type === "start") {
		const {
			sharedBuffer,
			interval: passedInterval,
			maxStep: passedMaxStep,
		} = payload;

		if (sharedBuffer) sharedIndex = new Uint32Array(sharedBuffer);
		if (passedInterval) interval = passedInterval;
		if (passedMaxStep) maxStep = passedMaxStep;
		if (!timerId) {
			timerId = setInterval(() => tick(self), interval);
		}
	}

	if (type === "stop") {
		if (timerId) {
			clearInterval(timerId);
			timerId = null;
		}
	}

	if (type === "change") {
		const { step } = payload;
		changeIndex(step);
		channel.postMessage({ step });
	}
};

function changeIndex(index) {
	if (!sharedIndex) return;
	Atomics.store(sharedIndex, 0, index);
	return Atomics.load(sharedIndex, 0);
}

function tick(self) {
	if (!sharedIndex) return;
	let current = Atomics.load(sharedIndex, 0);
	if (current < maxStep) {
		Atomics.store(sharedIndex, 0, current + 1);
	} else {
		// Stop automatically if reached maxStep
		clearInterval(timerId);
		timerId = null;
	}

	const step = Atomics.load(sharedIndex, 0);
	channel.postMessage({ step });
	console.log(channel);
	self.postMessage({ type: "ticked", payload: { step } });
}
