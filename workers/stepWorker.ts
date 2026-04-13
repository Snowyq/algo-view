export {};

type StepWorkerStartPayload = {
    sharedBuffer?: SharedArrayBuffer;
    interval?: number;
    maxStep?: number;
};

type StepWorkerChangePayload = {
    step: number;
};

type WorkerScope = {
    postMessage: (message: unknown) => void;
};

type StepWorkerMessage =
    | { type: "tab"; payload: string | number }
    | { type: "start"; payload: StepWorkerStartPayload }
    | { type: "stop" }
    | { type: "change"; payload: StepWorkerChangePayload };

let sharedIndex: Int32Array | null = null;
let localStep: number = 0;
let interval: number = 100; // default ms
let maxStep: number = 100;
let timerId: ReturnType<typeof setInterval> | null = null;
let channel: BroadcastChannel | undefined;
let tabId: string | number | undefined;

onmessage = (event: MessageEvent<StepWorkerMessage>): void => {
    const message = event.data;
    console.log("step: ", message.type);
    if (message.type === "tab") {
        tabId = message.payload;
        channel = new BroadcastChannel(`animation-tick:${tabId}`);
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
        if (!timerId) {
            const workerScope = self as unknown as WorkerScope;
            timerId = setInterval(() => tick(workerScope), interval);
        }
    }

    if (message.type === "stop") {
        if (timerId !== null) {
            clearInterval(timerId);
            timerId = null;
        }
    }

    if (message.type === "change") {
        const { step } = message.payload;
        changeIndex(step);
        channel!.postMessage({ step });
    }
};

function changeIndex(index: number): number {
    if (sharedIndex) {
        Atomics.store(sharedIndex, 0, index);
        return Atomics.load(sharedIndex, 0);
    }
    localStep = index;
    return localStep;
}

function tick(workerScope: WorkerScope): void {
    let step: number;
    if (sharedIndex) {
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
        step = Atomics.load(sharedIndex, 0);
    } else {
        if (localStep < maxStep) {
            localStep += 1;
        } else {
            if (timerId !== null) {
                clearInterval(timerId);
                timerId = null;
            }
        }
        step = localStep;
    }
    channel!.postMessage({ step });
    workerScope.postMessage({ type: "ticked", payload: { step } });
}
