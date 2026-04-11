export {};

let sharedIndex: Int32Array | null = null;
let interval = 100; // default ms
let maxStep = 100;
let timerId = null;
const channel = new BroadcastChannel("animation-tick");
let tabId: string | number | undefined;

onmessage = (event) => {
    console.log(location.origin);
    const { type, payload } = event.data;

    if (type === "tab") {
        tabId === payload;
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
    }

    if (type === "start") {
        if (!timerId) {
            timerId = setInterval(tick, interval);
        }
    }

    if (type === "stop") {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
    }
};

function tick() {
    if (!sharedIndex) return;
    const current = Atomics.load(sharedIndex, 0);
    if (current < maxStep) {
        Atomics.store(sharedIndex, 0, current + 1);
    } else {
        // Stop automatically if reached maxStep
        clearInterval(timerId);
        timerId = null;
    }

    const step = Atomics.load(sharedIndex, 0);
    channel.postMessage({ step });
}
