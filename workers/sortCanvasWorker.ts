import type { Algorithm } from "../algorithms/Algorithm";
import registryApi from "../algorithms/algorithmsRegistryApi";
import type { AlgorithmConstructor } from "../algorithms/types";

type StepMetric = { count: number; name: string };
type StepSelection = { id?: string; index: number };
type SortStep = {
    type?: string;
    metrics?: Record<string, StepMetric>;
    activeItems?: number[];
    selected?: StepSelection[];
};

type SortAlgorithmLike = Algorithm & {
    getMetrics(): Record<string, StepMetric>;
    getStepByIndex(index: number): SortStep | undefined;
    getStateByStepsIndex(index: number): number[] | undefined;
    getArrayMinMax(): { min: number; max: number };
    getStepsLength(): number;
};

type StepColors = Record<string, string>;

type WorkerSettings = {
    blockProportion?: number;
    upperBlockMargin?: number;
    textDisplayThreshold?: number;
};

type RenderRect = {
    width: number;
    height: number;
};

type WorkerIncomingMessage = {
    type: string;
    payload?: unknown;
    canvas?: OffscreenCanvas;
};

let AlgorithmClass: AlgorithmConstructor<SortAlgorithmLike> | null = null;
let AlgorithmInstance: SortAlgorithmLike | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let currStepIndex: number | null = null;
let dpr: number | null = null;
let stepColors: StepColors | null = null;
let doFirstRender = true;
let currentAnimationFrameId: number | null = null;
let sharedIndex: Uint32Array | undefined;
let pendingDrawIndex: number | null = null;

let canvasHeight = 0;
let canvasHeightDpr = 0;
let canvasWidth = 0;
let canvasWidthDpr = 0;

let blockRatio = 0.8; // 0 - 1
let upperBlockMargin = 15; //
let textDisplayThreshold = 10; // px
const textAlign = "center"; // 'center', 'start', 'end'
const labelFont = "10px sans-serif";

let tabId: string | number | undefined;
let channel: BroadcastChannel | undefined;

self.onmessage = function (event: MessageEvent<WorkerIncomingMessage>) {
    const { type, payload, canvas } = event.data;

    function postError(message: string) {
        postMessage({
            type: "error",
            message,
        });
    }

    // Event types

    if (type === "tab") {
        if (typeof payload === "string" || typeof payload === "number") {
            tabId = payload;
            channel = new BroadcastChannel(`animation-tick:${tabId}`);
            channel.onmessage = (event: MessageEvent<{ step: number }>) => {
                draw(event.data.step); // existing function
            };
        } else {
            postError("Invalid tab id");
        }
    }

    // Draw canvas

    if (type === "draw-canvas") {
        const { devicePixelRatio, stepIndex: payloadStepIndex } = (payload ??
            {}) as { devicePixelRatio?: number; stepIndex?: number };

        let stepIndex =
            typeof payloadStepIndex === "number" ? payloadStepIndex : undefined;
        if (sharedIndex) {
            stepIndex = Atomics.load(sharedIndex, 0);
        }

        if (!AlgorithmInstance) {
            postError("Cannot draw canvas: Algorithm instance not initialized");
            return;
        }

        if (typeof stepIndex !== "number" || Number.isNaN(stepIndex)) {
            postError("Cannot draw canvas: stepIndex not set");
            return;
        }

        adjustSize(null, null, devicePixelRatio);

        draw(stepIndex);
        const metrics = AlgorithmInstance.getMetrics();
        const step = AlgorithmInstance.getStepByIndex(stepIndex);

        postMessage({
            type: "draw-done",
            payload: { step, index: stepIndex, metrics },
        });
        return;
    }

    // Resize canvas

    if (type === "resize") {
        const { width, height, devicePixelRatio } = (payload ??
            {}) as RenderRect & {
            devicePixelRatio?: number;
        };

        if (typeof width !== "number" || typeof height !== "number") {
            postError("Invalid resize payload");
            return;
        }

        const resized = adjustSize(width, height, devicePixelRatio);
        if (resized) redraw();

        postMessage({ type: "resized" });
        return;
    }

    // Initialize canvas

    if (type === "init-canvas") {
        if (!canvas) {
            postError("canvas offscreen not provided");
            return;
        }

        ctx = canvas.getContext("2d");
        if (!ctx) {
            postError("Cannot initialize 2d context");
            return;
        }
        if (AlgorithmInstance && typeof pendingDrawIndex === "number") {
            draw(pendingDrawIndex);
            pendingDrawIndex = null;
        }

        postMessage({ type: "canvas-initialized" });
        return;
    }

    // Load step colors

    if (type === "load-step-colors") {
        const { stepColors: colors } = (payload ?? {}) as {
            stepColors?: StepColors;
        };
        if (!colors) {
            postError("No step colors provided");
            return;
        }
        updateStepColors(colors);

        postMessage({ type: "colors-loaded" });
        return;
    }

    // Find algorithm class

    if (type === "mount") {
        const { id, sharedBuffer } = (payload ?? {}) as {
            id?: string;
            sharedBuffer?: SharedArrayBuffer;
        };
        if (sharedBuffer) {
            sharedIndex = new Uint32Array(sharedBuffer);
        }
        if (!id) {
            postError("No Algorithm Id provided");
            return;
        }

        const Class = findAlgorithmClass("sort", id);

        if (!Class) {
            postError(`Algorithm Class with Id: ${id} cannot be find`);
            return;
        }

        mountAlgorithmClass(Class);

        postMessage({ type: "mounted" });
        return;
    }

    // Render algorithm

    if (type === "render-algorithm") {
        const { devicePixelRatio, input, options, rect } = (payload ?? {}) as {
            devicePixelRatio?: number;
            input?: number[];
            options?: Record<string, unknown>;
            rect?: RenderRect;
        };

        if (!rect) {
            postError("Canvas rect not provided");
            return;
        }

        adjustSize(rect.width, rect.height, devicePixelRatio);

        if (!Array.isArray(input)) {
            postError("Array to sort not provided");
            return;
        }

        postMessage({ type: "render-start" });

        doFirstRender = true;
        createAlgorithmInstance(input, options ?? {});
        if (!AlgorithmInstance) {
            postError("Algorithm instance not initialized");
            return;
        }
        const stepsLength = getAlgorithmStepsLength();
        const metrics = AlgorithmInstance.getMetrics();

        postMessage({
            type: "render-done",
            payload: { stepsLength, metrics },
        });
        if (ctx) {
            draw(0);
        } else {
            pendingDrawIndex = 0;
        }
    }

    // Update settings

    if (type === "settings") {
        const { settings, devicePixelRatio } = (payload ?? {}) as {
            settings?: WorkerSettings;
            devicePixelRatio?: number;
        };
        if (!settings) {
            postError("No settings provided");
            return;
        }
        adjustSize(null, null, devicePixelRatio);
        updateSettings(settings);
        redraw();
        postMessage({ type: "settings-updated" });
        return;
    }
};

// Helper functions

function updateStepIndex(newIndex: number) {
    currStepIndex = newIndex;
}

function updateStepColors(colors: StepColors) {
    stepColors = colors;
}

function findAlgorithmClass(
    category: string,
    id: string
): AlgorithmConstructor<SortAlgorithmLike> | undefined {
    return registryApi.getAlgorithmClass(category, id) as
        | AlgorithmConstructor<SortAlgorithmLike>
        | undefined;
}

function mountAlgorithmClass(Class: AlgorithmConstructor<SortAlgorithmLike>) {
    AlgorithmClass = Class;
}

function createAlgorithmInstance(
    input: number[],
    options: Record<string, unknown>
): void {
    if (!AlgorithmClass) return;
    AlgorithmInstance = new AlgorithmClass(input, options);
}

function getAlgorithmStepsLength(): number {
    if (!AlgorithmInstance) return 0;
    return AlgorithmInstance.getStepsLength();
}

function updateSettings(payload: WorkerSettings) {
    const {
        blockProportion: blockProportionValue,
        upperBlockMargin: upperBlockMarginValue,
        textDisplayThreshold: textDisplayThresholdValue,
    } = payload;
    if (blockProportionValue) blockRatio = blockProportionValue;
    if (upperBlockMarginValue) upperBlockMargin = upperBlockMarginValue;
    if (textDisplayThresholdValue)
        textDisplayThreshold = textDisplayThresholdValue;
}

// Size adjustments

function adjustSize(
    width: number | null,
    height: number | null,
    devicePixelRatio?: number
): boolean {
    let resized = false;
    if (shouldResize(width, height, devicePixelRatio)) {
        resize(width, height, devicePixelRatio);
        resized = true;
    }
    return resized;
}

function updateDevicePixelRatio(newDpr?: number) {
    if (!newDpr) return;
    dpr = newDpr;
}

function shouldResize(
    width: number | null,
    height: number | null,
    devicePixelRatio?: number
): boolean {
    if (width !== canvasWidth || height !== canvasHeight) return true;
    if (devicePixelRatio && dpr !== devicePixelRatio) return true;
    return false;
}

function resize(
    width: number | null,
    height: number | null,
    devicePixelRatio?: number
) {
    updateDevicePixelRatio(devicePixelRatio);
    if (
        ctx &&
        ctx.canvas &&
        typeof width === "number" &&
        typeof height === "number"
    ) {
        canvasWidth = width;
        canvasHeight = height;
        const resolvedDpr = typeof dpr === "number" ? dpr : 1;
        canvasWidthDpr = canvasWidth * resolvedDpr;
        canvasHeightDpr = canvasHeight * resolvedDpr;

        ctx.canvas.width = canvasWidthDpr;
        ctx.canvas.height = canvasHeightDpr;
    }
}

// Drawing

function redraw() {
    if (typeof currStepIndex === "number" && !Number.isNaN(currStepIndex)) {
        draw(currStepIndex);
    }
}

function draw(stepIndex: number) {
    if (!AlgorithmInstance) return;

    if (currentAnimationFrameId !== null) {
        cancelAnimationFrame(currentAnimationFrameId);
        currentAnimationFrameId = null;
    }

    updateStepIndex(stepIndex);
    const state = AlgorithmInstance.getStateByStepsIndex(stepIndex);
    const step = AlgorithmInstance.getStepByIndex(stepIndex);
    const maxValue = AlgorithmInstance.getArrayMinMax().max;

    if (step && step.metrics) {
        postMessage({
            type: "step-metrics",
            payload: { stepIndex, metrics: step.metrics },
        });
    }

    if (step && step.metrics) {
        postMessage({
            type: "step-metrics",
            payload: { stepIndex, metrics: step.metrics },
        });
    }

    if (doFirstRender) {
        doFirstRender = false;
        animateDrawArray(state, step, maxValue);
    } else {
        drawArray(state, step, maxValue);
    }
}

function handleDraw(callback: () => void) {
    if (!ctx || !ctx.canvas) return;
    if (!dpr) updateDevicePixelRatio(1);
    const resolvedDpr = typeof dpr === "number" ? dpr : 1;

    ctx.save();

    ctx.scale(resolvedDpr, resolvedDpr);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    callback();

    ctx.restore();
}

function drawBlock(
    val: number,
    index: number,
    step: SortStep | undefined,
    blockWidth: number,
    gapWidth: number,
    maxValue: number,
    showText = true
) {
    if (!ctx) return;
    // Account for vertical space above each block to fit the text label

    const blockHeight = calculateBlockHeight(val, maxValue);
    const x = index * (blockWidth + gapWidth);
    const y = canvasHeight - blockHeight;
    // Determine the step type to apply corresponding highlight styles
    const type = getBlockDisplayType(step, index);

    // Apply fill style based on step type
    ctx.fillStyle = getColorByType(type);
    ctx.fillRect(x, y, blockWidth, blockHeight);

    // Display block value only if its width exceeds the configured threshold
    if (blockWidth >= textDisplayThreshold && showText) {
        displayText(val, x + blockWidth / 2, y - 5);
    }
}

function drawArray(
    state: number[] | undefined,
    step: SortStep | undefined,
    maxValue: number
): number[] {
    const output: number[] = [];
    if (!state) return output;

    // Calculate block and gap widths proportionally based on canvas size
    const { blockWidth, gapWidth } = calcBlockGapWidth(
        state.length,
        blockRatio
    );

    handleDraw(() => {
        state.forEach((val, index) => {
            drawBlock(val, index, step, blockWidth, gapWidth, maxValue);
        });
    });

    return output;
}

// Drawing helpers

function getColorByType(type: string): string {
    if (stepColors) {
        if (type in stepColors) return stepColors[type];
    }

    return "#d1d5db";
}

function calcBlockGapWidth(
    arrayLength: number,
    blockProportion: number
): { blockWidth: number; gapWidth: number } {
    const gapCount = arrayLength - 1;
    let blockWidth = (canvasWidth / arrayLength) * blockProportion;
    let gapWidth = (canvasWidth / gapCount) * (1 - blockProportion);

    if (gapWidth < 1) {
        blockWidth = blockWidth + gapWidth;
        gapWidth = 0;
    }
    return { blockWidth, gapWidth };
}

const calculateBlockHeight = (value: number, maxValue: number): number => {
    const maxBlockHeight = canvasHeight - upperBlockMargin;
    const height = (value / maxValue) * maxBlockHeight;
    return height;
};

function displayText(text: string | number, x: number, y: number) {
    if (!ctx) return;
    ctx.fillStyle = "#111827";
    ctx.font = labelFont;
    ctx.textAlign = textAlign;
    ctx.fillText(String(text), x, y);
}

function getBlockDisplayType(step: SortStep | undefined, index: number) {
    let type = "default";
    if (step) {
        const isActive = step.activeItems?.includes(index);
        const isSelected = step.selected?.some((el) => el.index === index);
        if (isSelected) type = "select";
        if (isActive) type = step.type || type;
    }
    return type;
}

// Animating

function handleAnimate(callback: (now: number, startTime: number) => boolean) {
    const startTime = performance.now();

    function frame(now: number) {
        const shouldRepeat = callback(now, startTime);
        if (shouldRepeat) {
            currentAnimationFrameId = requestAnimationFrame(frame);
        } else {
            currentAnimationFrameId = null;
        }
    }

    currentAnimationFrameId = requestAnimationFrame(frame);
}

function animateDrawArray(
    state: number[] | undefined,
    step: SortStep | undefined,
    maxValue: number,
    duration = 500,
    appearStyle: "sequence" | "atOnce" = "atOnce" // 'sequence', 'atOnce',
): number[] {
    const output: number[] = [];
    if (!state) return output;

    // Calculate block and gap widths proportionally based on canvas size
    const { blockWidth, gapWidth } = calcBlockGapWidth(
        state.length,
        blockRatio
    );

    const onDraw = (val: number, index: number, showText: boolean) => {
        drawBlock(val, index, step, blockWidth, gapWidth, maxValue, showText);
    };

    const animations: Record<"sequence" | "atOnce", () => void> = {
        sequence: () => animateInSequence(state, onDraw, duration),
        atOnce: () => animateAtOnce(state, onDraw, duration),
    };

    animations[appearStyle]();

    return output;
}

function animateAtOnce(
    state: number[],
    onDraw: (val: number, index: number, showText: boolean) => void,
    duration: number
) {
    const onFrame = (now: number, startTime: number) => {
        const progress = Math.min((now - startTime) / duration, 1);

        handleDraw(() => {
            const drawEachValue = (val: number, index: number) => {
                const animatedVal = val * progress;
                onDraw(animatedVal, index, progress === 1);
            };

            state.forEach(drawEachValue);
        });

        return progress < 1;
    };

    handleAnimate(onFrame);
}
function animateInSequence(
    state: number[],
    onDraw: (val: number, index: number, showText: boolean) => void,
    duration: number
) {
    const totalBlocks = state.length;

    const onFrame = (now: number, startTime: number) => {
        const elapsed = now - startTime;

        handleDraw(() => {
            const drawEachValue = (val: number, index: number) => {
                const delayPerBlock = (duration / totalBlocks) * index;
                const localElapsed = elapsed - delayPerBlock;
                const progress = Math.min(
                    Math.max(localElapsed / (duration / totalBlocks), 0),
                    1
                );
                const animatedVal = val * progress;
                onDraw(animatedVal, index, progress === 1);
            };
            state.forEach(drawEachValue);
        });

        return elapsed < duration + (duration / totalBlocks) * totalBlocks;
    };

    handleAnimate(onFrame);
}
