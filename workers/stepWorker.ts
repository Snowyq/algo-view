export {};

type StepWorkerStartPayload = {
    sharedBuffer?: SharedArrayBuffer;
    interval?: number;
    maxStep?: number;
};

type StepWorkerConfigPayload = {
    interval?: number;
    maxStep?: number;
};

type StepWorkerChangePayload = {
    step: number;
};

type StepWorkerMessage =
    | { type: "tab"; payload: string | number }
    | { type: "start"; payload: StepWorkerStartPayload }
    | { type: "config"; payload: StepWorkerConfigPayload }
    | { type: "stop" }
    | { type: "change"; payload: StepWorkerChangePayload };

/*
 * The playback clock. Steps advance by elapsed time, not by timer calls:
 * the timer wakes every frame (16ms) and moves as many steps as the
 * interval says have passed. A 1ms speed therefore means ~16 steps
 * per tick instead of 1000 messages a second that nobody can draw.
 */

const TICK_MS = 16;
/* After a stall (hidden tab, GC) don't jump more than this much time. */
const MAX_CATCH_UP_MS = 250;
/* Never cap below one full interval, or slow speeds could never step. */
const catchUpLimit = (): number => Math.max(MAX_CATCH_UP_MS, interval * 2);

let sharedIndex: Int32Array | null = null;
let localStep = 0;
let interval = 100;
let maxStep = 100;
let timerId: ReturnType<typeof setInterval> | null = null;
let lastTime = 0;
let carry = 0;
let channel: BroadcastChannel | undefined;

function readStep(): number {
    return sharedIndex ? Atomics.load(sharedIndex, 0) : localStep;
}

function writeStep(step: number): void {
    if (sharedIndex) Atomics.store(sharedIndex, 0, step);
    localStep = step;
}

function stopTimer(): void {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
}

function startTimer(): void {
    stopTimer();
    lastTime = performance.now();
    carry = 0;
    // Always wake every frame: a 500ms timer that fires 0.1ms early would
    // round down to zero steps and silently halve the speed.
    timerId = setInterval(tick, TICK_MS);
}

function publish(step: number): void {
    channel?.postMessage({ step });
    postMessage({ type: "ticked", payload: { step } });
}

function tick(): void {
    const now = performance.now();
    carry = Math.min(carry + (now - lastTime), catchUpLimit());
    lastTime = now;
    const steps = Math.floor(carry / interval);
    if (steps < 1) return;
    carry -= steps * interval;

    const next = Math.min(maxStep, readStep() + steps);
    writeStep(next);
    publish(next);
    if (next >= maxStep) stopTimer();
}

onmessage = (event: MessageEvent<StepWorkerMessage>): void => {
    const message = event.data;

    if (message.type === "tab") {
        channel = new BroadcastChannel(`animation-tick:${message.payload}`);
        return;
    }

    if (message.type === "start") {
        const {
            sharedBuffer,
            interval: nextInterval,
            maxStep: nextMax,
        } = message.payload;
        if (sharedBuffer) sharedIndex = new Int32Array(sharedBuffer);
        if (nextInterval) interval = nextInterval;
        if (typeof nextMax === "number") maxStep = nextMax;
        if (readStep() < maxStep) startTimer();
        return;
    }

    // Speed or length changed mid-play: retune without losing the position.
    if (message.type === "config") {
        const { interval: nextInterval, maxStep: nextMax } = message.payload;
        if (nextInterval) interval = nextInterval;
        if (typeof nextMax === "number") maxStep = nextMax;
        if (timerId !== null) startTimer();
        return;
    }

    if (message.type === "stop") {
        stopTimer();
        return;
    }

    if (message.type === "change") {
        writeStep(message.payload.step);
        channel?.postMessage({ step: message.payload.step });
    }
};
