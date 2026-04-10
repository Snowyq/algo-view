export { };

let sharedIndex: Int32Array | null = null;
let localStep = 0;
let interval = 100; // default ms
let maxStep = 100;
let timerId = null;
let channel: BroadcastChannel | undefined;
let tabId: string | number | undefined;

onmessage = event => {
	const { type, payload } = event.data;
	console.log("step: ", type);
	if (type === "tab") {
		tabId = payload;
		channel = new BroadcastChannel(`animation-tick:${tabId}`);
	}

	if (type === "start") {
		const {
			sharedBuffer,
			interval: passedInterval,
			maxStep: passedMaxStep,
		} = payload;

		if (sharedBuffer) sharedIndex = new Int32Array(sharedBuffer);
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
	if (sharedIndex) {
		Atomics.store(sharedIndex, 0, index);
		return Atomics.load(sharedIndex, 0);
	}
	localStep = index;
	return localStep;
}

function tick(self: any) {
	let step;
	if (sharedIndex) {
		const current = Atomics.load(sharedIndex, 0);
		if (current < maxStep) {
			Atomics.store(sharedIndex, 0, current + 1);
		} else {
			// Stop automatically if reached maxStep
			clearInterval(timerId);
			timerId = null;
		}
		step = Atomics.load(sharedIndex, 0);
	} else {
		if (localStep < maxStep) {
			localStep += 1;
		} else {
			clearInterval(timerId);
			timerId = null;
		}
		step = localStep;
	}
	channel.postMessage({ step });
	self.postMessage({ type: "ticked", payload: { step } });
}
