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
    | { type: "breakpoints"; payload: { steps: number[] } }
    | { type: "tab"; payload: string | number }
    | { type: "start"; payload: StepWorkerStartPayload }
    | { type: "config"; payload: StepWorkerConfigPayload }
    | { type: "stop" }
    | { type: "change"; payload: StepWorkerChangePayload };

/*
 * Playback clock. Steps advance by elapsed time: the timer wakes every frame
 * and moves as many steps as have passed, so fast speeds batch steps per tick.
 */

const TICK_MS = 16;
/* Cap the jump after a stall (hidden tab, GC). */
const MAX_CATCH_UP_MS = 250;
/* At least two intervals, or slow speeds could never step. */
const catchUpLimit = (): number => Math.max(MAX_CATCH_UP_MS, interval * 2);

let sharedIndex: Int32Array | null = null;
let localStep = 0;
let interval = 100;
let maxStep = 100;
let timerId: ReturnType<typeof setInterval> | null = null;
let lastTime = 0;
let carry = 0;
let channel: BroadcastChannel | undefined;
/** Steps to pause on (breakpoints), ascending. */
let stops: number[] = [];

/* First stop in (from, to], or -1. */
function firstStop(from: number, to: number): number {
    for (const stop of stops) {
        if (stop > to) return -1;
        if (stop > from) return stop;
    }
    return -1;
}

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
    // Wake every frame: a long timer firing slightly early would round to zero steps.
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

    const from = readStep();
    const next = Math.min(maxStep, from + steps);
    // Stop exactly on a breakpoint in between.
    const stop = firstStop(from, next);
    if (stop >= 0) {
        writeStep(stop);
        publish(stop);
        stopTimer();
        postMessage({ type: "break", payload: { step: stop } });
        return;
    }
    writeStep(next);
    publish(next);
    if (next >= maxStep) stopTimer();
}

onmessage = (event: MessageEvent<StepWorkerMessage>): void => {
    const message = event.data;

    if (message.type === "breakpoints") {
        stops = [...message.payload.steps].sort((a, b) => a - b);
        return;
    }

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

    // Speed or length changed mid-play: retune, keep the position.
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
