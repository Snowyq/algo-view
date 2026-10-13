import registryApi from "../algorithms/algorithmsRegistryApi";
import {
    OVERLAY_FRONTIER,
    OVERLAY_PATH,
    OVERLAY_VISITED,
    type PathAlgorithm,
} from "../algorithms/path/PathAlgorithm";
import type { AlgorithmConstructor } from "../algorithms/types";
import {
    CELL_MUD,
    CELL_WALL,
    gridLayout,
    type GridInput,
} from "../utils/grid";

/*
 * Path-finding canvas worker. Same contract as the sort canvas worker:
 * mount → render-algorithm (computes every step here, off the main
 * thread) → draws whichever step the shared clock broadcasts, at most
 * once per frame.
 */

type Colors = Record<string, string>;
type Rect = { width: number; height: number };
type Incoming = { type: string; payload?: unknown; canvas?: OffscreenCanvas };

let AlgorithmClass: AlgorithmConstructor<PathAlgorithm> | null = null;
let instance: PathAlgorithm | null = null;
let grid: GridInput | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let colors: Colors = {};
let dpr = 1;
let width = 0;
let height = 0;
let currentStep = 0;
let channel: BroadcastChannel | undefined;
let revealUntil = 0;

function postError(message: string): void {
    postMessage({ type: "error", message });
}

self.onmessage = (event: MessageEvent<Incoming>) => {
    const { type, payload, canvas } = event.data;

    if (type === "tab") {
        channel = new BroadcastChannel(`animation-tick:${payload}`);
        channel.onmessage = (e: MessageEvent<{ step: number }>) =>
            scheduleDraw(e.data.step);
        return;
    }

    if (type === "mount") {
        const { id } = (payload ?? {}) as { id?: string };
        const Class = id
            ? (registryApi.getAlgorithmClass("path", id) as
                  | AlgorithmConstructor<PathAlgorithm>
                  | undefined)
            : undefined;
        if (!Class) {
            postError(`Path algorithm ${id} not found`);
            return;
        }
        AlgorithmClass = Class;
        postMessage({ type: "mounted" });
        return;
    }

    if (type === "init-canvas") {
        if (!canvas) return postError("canvas offscreen not provided");
        ctx = canvas.getContext("2d");
        if (!ctx) return postError("Cannot initialize 2d context");
        if (instance) draw(currentStep);
        postMessage({ type: "canvas-initialized" });
        return;
    }

    if (type === "load-step-colors") {
        const next = (payload as { stepColors?: Colors })?.stepColors;
        if (next) colors = next;
        if (instance) draw(currentStep);
        postMessage({ type: "colors-loaded" });
        return;
    }

    if (type === "resize") {
        const { width: w, height: h, devicePixelRatio } = (payload ??
            {}) as Rect & { devicePixelRatio?: number };
        if (resize(w, h, devicePixelRatio) && instance) draw(currentStep);
        postMessage({ type: "resized" });
        return;
    }

    if (type === "render-algorithm") {
        const { input, rect, devicePixelRatio } = (payload ?? {}) as {
            input?: GridInput;
            rect?: Rect;
            devicePixelRatio?: number;
        };
        if (!input || !rect) return postError("Grid or rect not provided");
        if (!AlgorithmClass) return postError("Algorithm not mounted");
        resize(rect.width, rect.height, devicePixelRatio);
        postMessage({ type: "render-start" });
        grid = input;
        instance = new AlgorithmClass(input);
        currentStep = 0;
        postMessage({
            type: "render-done",
            payload: {
                stepsLength: instance.getStepsLength(),
                metrics: instance.getMetrics(),
            },
        });
        // A fresh grid wipes in row by row.
        revealUntil = performance.now() + 360;
        animateReveal();
        return;
    }
};

// ---------- Sizing ----------

function resize(w?: number, h?: number, nextDpr?: number): boolean {
    if (!ctx || typeof w !== "number" || typeof h !== "number") return false;
    const ratio = nextDpr || dpr;
    if (w === width && h === height && ratio === dpr) return false;
    width = w;
    height = h;
    dpr = ratio;
    ctx.canvas.width = Math.round(width * dpr);
    ctx.canvas.height = Math.round(height * dpr);
    return true;
}

// ---------- Frame pacing ----------

const nextFrame: (cb: () => void) => void =
    typeof requestAnimationFrame === "function"
        ? (cb) => requestAnimationFrame(() => cb())
        : (cb) => setTimeout(cb, 16);

let scheduledStep: number | null = null;
let drawScheduled = false;

function scheduleDraw(step: number): void {
    scheduledStep = step;
    if (drawScheduled) return;
    drawScheduled = true;
    nextFrame(() => {
        drawScheduled = false;
        if (scheduledStep === null) return;
        const target = scheduledStep;
        scheduledStep = null;
        draw(target);
    });
}

function animateReveal(): void {
    draw(currentStep);
    if (performance.now() < revealUntil) nextFrame(animateReveal);
}

const METRICS_INTERVAL_MS = 50;
let lastMetricsAt = 0;
let metricsTimer: ReturnType<typeof setTimeout> | null = null;
let pendingMetrics: unknown = null;

function flushMetrics(): void {
    metricsTimer = null;
    if (pendingMetrics === null) return;
    lastMetricsAt = performance.now();
    postMessage({ type: "step-metrics", payload: pendingMetrics });
    pendingMetrics = null;
}

function postStepMetrics(payload: unknown): void {
    pendingMetrics = payload;
    const wait = METRICS_INTERVAL_MS - (performance.now() - lastMetricsAt);
    if (wait <= 0) flushMetrics();
    else if (metricsTimer === null) metricsTimer = setTimeout(flushMetrics, wait);
}

// ---------- Drawing ----------

function color(name: string, fallback: string): string {
    return colors[name] || fallback;
}

function draw(stepIndex: number): void {
    if (!ctx || !instance || !grid || width === 0) return;
    currentStep = Math.max(0, Math.min(stepIndex, instance.getStepsLength() - 1));
    const step = instance.getStepByIndex(currentStep);
    const { overlay, current } = instance.getStateByStepsIndex(currentStep);
    if (step) {
        postStepMetrics({
            stepIndex: currentStep,
            metrics: step.metrics,
            stepType: step.type,
            instructionId: step.instructionId ?? [],
        });
    }

    const { cols, rows, cells, start, end } = grid;
    const layout = gridLayout(cols, rows, width, height);
    const size = layout.cell - layout.gap;
    // Rows still waiting to be revealed after a new grid.
    const now = performance.now();
    const revealRows =
        now < revealUntil
            ? Math.floor(rows * (1 - (revealUntil - now) / 360))
            : rows;

    const empty = color("path-empty", "#2b251f");
    const wall = color("path-wall", "#5a4f42");
    const mud = color("path-mud", "#4a3424");
    const mudDot = color("path-mud-dot", "#7a5236");
    const frontier = color("frontier", "#f5cd4e");
    const visited = color("visit", "#7fb0ff");
    const pathColor = color("path", "#5fd6c6");
    const currentColor = color("current", "#ee8fd0");
    const startColor = color("path-start", "#e8825c");
    const endColor = color("path-end", "#f4ede0");
    const lit = "rgba(255, 255, 255, 0.28)";

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    for (let y = 0; y < revealRows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
            const i = y * cols + x;
            const px = layout.x + x * layout.cell;
            const py = layout.y + y * layout.cell;
            const kind = cells[i];
            const state = overlay[i];

            if (kind === CELL_WALL) {
                ctx.fillStyle = wall;
                ctx.fillRect(px, py, size, size);
                if (size >= 6) {
                    ctx.fillStyle = lit;
                    ctx.fillRect(px, py, size, 1);
                }
                continue;
            }

            let fill = kind === CELL_MUD ? mud : empty;
            if (state === OVERLAY_VISITED) fill = visited;
            else if (state === OVERLAY_FRONTIER) fill = frontier;
            else if (state === OVERLAY_PATH) fill = pathColor;
            ctx.fillStyle = fill;
            // Visited cells sit a touch back so the frontier pops.
            if (state === OVERLAY_VISITED) ctx.globalAlpha = 0.62;
            ctx.fillRect(px, py, size, size);
            ctx.globalAlpha = 1;

            // Mud keeps its texture under every state.
            if (kind === CELL_MUD && size >= 5) {
                ctx.fillStyle = mudDot;
                const d = Math.max(1, Math.floor(size / 5));
                ctx.fillRect(px + d, py + d * 2, d, d);
                ctx.fillRect(px + d * 3, py + d * 3, d, d);
            }
            if (state === OVERLAY_PATH && size >= 6) {
                ctx.fillStyle = lit;
                ctx.fillRect(px, py, size, Math.max(1, Math.floor(size / 5)));
            }
        }
    }

    // The cell being expanded right now.
    if (current >= 0 && current !== start && current !== end) {
        const px = layout.x + (current % cols) * layout.cell;
        const py = layout.y + Math.floor(current / cols) * layout.cell;
        ctx.fillStyle = currentColor;
        ctx.fillRect(px, py, size, size);
    }

    // Start: solid block; end: notched ring.
    const marker = (cell: number, fill: string, ring: boolean): void => {
        const px = layout.x + (cell % cols) * layout.cell;
        const py = layout.y + Math.floor(cell / cols) * layout.cell;
        if (!ctx) return;
        ctx.fillStyle = fill;
        if (!ring || size < 6) {
            ctx.fillRect(px, py, size, size);
            return;
        }
        const t = Math.max(2, Math.floor(size / 4));
        ctx.fillRect(px + 1, py, size - 2, t);
        ctx.fillRect(px + 1, py + size - t, size - 2, t);
        ctx.fillRect(px, py + 1, t, size - 2);
        ctx.fillRect(px + size - t, py + 1, t, size - 2);
    };
    marker(start, startColor, false);
    marker(end, endColor, true);

    ctx.restore();
}
