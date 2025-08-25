let sharedIndex;
let interval = 1000;

onmessage = event => {
	if (event.data.sharedBuffer) {
		sharedIndex = new Int32Array(event.data.sharedBuffer);
	}
	if (event.data.interval) interval = event.data.interval;

	setInterval(() => {
		// Move shared index forward safely
		const len = 5; // length of state arrays
		const newIndex = (Atomics.load(sharedIndex, 0) + 1) % len;
		Atomics.store(sharedIndex, 0, newIndex);

		// notify main thread to forward tick
		postMessage({ type: "tick" });
	}, interval);
};
