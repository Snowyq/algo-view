export {};

type TimerWorkerStartPayload = {
    sharedBuffer?: SharedArrayBuffer;
    interval?: number;
    maxStep?: number;
};

type TimerWorkerMessage =
    | { type: "tab"; payload: string | number }
    | { type: "start"; payload: TimerWorkerStartPayload }
    | { type: "stop" };

let sharedIndex: Int32Array | null = null;
let interval: number = 100; // default ms
let maxStep: number = 100;
let timerId: ReturnType<typeof setInterval> | null = null;
const channel: BroadcastChannel = new BroadcastChannel("animation-tick");
onmessage = (event: MessageEvent<TimerWorkerMessage>): void => {
    console.log(location.origin);
    const message = event.data;

    if (message.type === "tab") {
        return;
    }

    if (message.type === "start") {
        const {
            sharedBuffer,
            interval: passedInterval,
            maxStep: passedMaxStep,
        } = message.payload;

        if (sharedBuffer) sharedIndex = new Int32Array(sharedBuffer);
        if (passedInterval) interval = passedInterval;
        if (passedMaxStep) maxStep = passedMaxStep;
    }

    if (message.type === "start") {
        if (!timerId) {
            timerId = setInterval(tick, interval);
        }
    }

    if (message.type === "stop") {
        if (timerId !== null) {
            clearInterval(timerId);
            timerId = null;
        }
    }
};

function tick(): void {
    if (!sharedIndex) return;
    const current = Atomics.load(sharedIndex, 0);
    if (current < maxStep) {
        Atomics.store(sharedIndex, 0, current + 1);
    } else {
        // Stop automatically if reached maxStep
        if (timerId !== null) {
            clearInterval(timerId);
            timerId = null;
        }
    }

    const step = Atomics.load(sharedIndex, 0);
    channel.postMessage({ step });
}
