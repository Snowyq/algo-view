import registryApi from "../../algorithms/algorithmsRegistryApi";
import type {
    AlgorithmConstructor,
    StepAlgorithm,
} from "../../algorithms/types";
import { FALLBACK_COLORS } from "./draw";

/*
 * Shared runtime for the canvas workers: the message protocol with the main
 * thread and frame pacing. A category worker only supplies draw() and describe().
 *
 * in:  tab, mount, init-canvas, load-step-colors, resize, render-algorithm, line-steps
 * out: mounted, canvas-initialized, colors-loaded, resized, render-start,
 *      render-done, step-metrics, line-steps, error
 */

type Colors = Record<string, string>;
type Rect = { width: number; height: number };
type Incoming = { type: string; payload?: unknown; canvas?: OffscreenCanvas };
type RunPayload<TInput> = {
    input?: TInput;
    options?: Record<string, unknown>;
    rect?: Rect;
    devicePixelRatio?: number;
};

export type DrawApi<TInput, TAlgo extends StepAlgorithm> = {
    ctx: OffscreenCanvasRenderingContext2D;
    /** CSS pixels; the transform already includes the pixel ratio. */
    width: number;
    height: number;
    dpr: number;
    /** Step color token; the fallback defaults to FALLBACK_COLORS. */
    color: (name: string, fallback?: string) => string;
    algorithm: TAlgo;
    input: TInput;
    options: Record<string, unknown>;
    /** Already clamped to the run. */
    step: number;
    /** 0 to 1 while a fresh run animates in, then 1. */
    reveal: number;
};

export type DescribeApi<TInput, TAlgo extends StepAlgorithm> = {
    algorithm: TAlgo;
    input: TInput;
    step: number;
};

type WorkerSpec<TInput, TAlgo extends StepAlgorithm> = {
    /** Registry category the algorithm classes live in. */
    category: string;
    draw: (api: DrawApi<TInput, TAlgo>) => void;
    /** Short caption for a step. */
    describe?: (api: DescribeApi<TInput, TAlgo>) => string;
    revealMs?: number;
};

/* Metrics re-render React on the main thread, so cap them at 20 a second. */
const METRICS_INTERVAL_MS = 50;

const nextFrame: (cb: () => void) => void =
    typeof requestAnimationFrame === "function"
        ? (cb) => requestAnimationFrame(() => cb())
        : (cb) => setTimeout(cb, 16);

const postError = (message: string): void =>
    postMessage({ type: "error", message });

export function createCanvasWorker<TInput, TAlgo extends StepAlgorithm>({
    category,
    draw,
    describe,
    revealMs = 360,
}: WorkerSpec<TInput, TAlgo>): void {
    let AlgorithmClass: AlgorithmConstructor | null = null;
    let algorithm: TAlgo | null = null;
    let input: TInput | null = null;
    let options: Record<string, unknown> = {};
    let ctx: OffscreenCanvasRenderingContext2D | null = null;
    let colors: Colors = {};
    let dpr = 1;
    let width = 0;
    let height = 0;
    let current = 0;
    let revealStart = 0;

    // ---------- Frame pacing ----------

    // Ticks can outrun the screen: keep only the newest step, draw once per frame.
    let scheduled: number | null = null;
    let frameQueued = false;
    const schedule = (step: number): void => {
        scheduled = step;
        if (frameQueued) return;
        frameQueued = true;
        nextFrame(() => {
            frameQueued = false;
            if (scheduled === null) return;
            const target = scheduled;
            scheduled = null;
            render(target);
        });
    };

    // ---------- Metrics ----------

    let lastMetricsAt = 0;
    let metricsTimer: ReturnType<typeof setTimeout> | null = null;
    let pendingMetrics: Record<string, unknown> | null = null;

    // Captions are built only for steps that actually get posted.
    const flushMetrics = (): void => {
        metricsTimer = null;
        if (pendingMetrics === null) return;
        lastMetricsAt = performance.now();
        if (describe && algorithm && input !== null) {
            try {
                pendingMetrics.caption = describe({
                    algorithm,
                    input,
                    step: pendingMetrics.stepIndex as number,
                });
            } catch {
                pendingMetrics.caption = "";
            }
        }
        postMessage({ type: "step-metrics", payload: pendingMetrics });
        pendingMetrics = null;
    };

    const postStepMetrics = (payload: Record<string, unknown>): void => {
        pendingMetrics = payload;
        const wait = METRICS_INTERVAL_MS - (performance.now() - lastMetricsAt);
        if (wait <= 0) flushMetrics();
        else if (metricsTimer === null) {
            metricsTimer = setTimeout(flushMetrics, wait);
        }
    };

    // ---------- Drawing ----------

    const color = (name: string, fallback?: string): string =>
        colors[name] || fallback || FALLBACK_COLORS[name] || "";

    function render(step: number): void {
        if (!ctx || !algorithm || input === null || width === 0) return;
        current = Math.max(0, Math.min(step, algorithm.getStepsLength() - 1));
        const info = algorithm.getStepByIndex(current);
        if (info) {
            postStepMetrics({
                stepIndex: current,
                metrics: info.metrics,
                stepType: info.type,
                instructionId: info.instructionId ?? [],
            });
        }
        const reveal = Math.min(
            1,
            (performance.now() - revealStart) / revealMs
        );
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        draw({
            ctx,
            width,
            height,
            dpr,
            color,
            algorithm,
            input,
            options,
            step: current,
            reveal,
        });
        ctx.restore();
    }

    function animateReveal(): void {
        render(current);
        if (performance.now() - revealStart < revealMs)
            nextFrame(animateReveal);
    }

    function resize(w?: number, h?: number, nextDpr?: number): boolean {
        if (!ctx || typeof w !== "number" || typeof h !== "number")
            return false;
        const ratio = nextDpr || dpr;
        if (w === width && h === height && ratio === dpr) return false;
        width = w;
        height = h;
        dpr = ratio;
        ctx.canvas.width = Math.round(width * dpr);
        ctx.canvas.height = Math.round(height * dpr);
        return true;
    }

    // The size actually drawn, so the page can scale the bitmap to match.
    const postSize = (): void =>
        postMessage({ type: "resized", payload: { width, height } });

    // ---------- Protocol ----------

    function subscribe(tab: unknown): void {
        const channel = new BroadcastChannel(`animation-tick:${tab}`);
        channel.onmessage = (e: MessageEvent<{ step: number }>) =>
            schedule(e.data.step);
    }

    function mount(id?: string): void {
        const Class = id
            ? registryApi.getAlgorithmClass(category, id)
            : undefined;
        if (!Class) return postError(`${category}/${id} not found`);
        AlgorithmClass = Class;
        postMessage({ type: "mounted" });
    }

    /* Steps that run any of these code lines (for breakpoints). */
    function stepsOnLines(ids: string[]): number[] {
        const wanted = new Set(ids);
        const steps: number[] = [];
        if (!algorithm || wanted.size === 0) return steps;
        const total = algorithm.getStepsLength();
        for (let i = 0; i < total; i += 1) {
            const lines = algorithm.getStepByIndex(i)?.instructionId;
            if (lines?.some((id) => wanted.has(id))) steps.push(i);
        }
        return steps;
    }

    function run(p: RunPayload<TInput>): void {
        if (p.input === undefined || !p.rect) {
            return postError("Input or rect not provided");
        }
        if (!AlgorithmClass) return postError("Algorithm not mounted");
        resize(p.rect.width, p.rect.height, p.devicePixelRatio);
        postSize();
        postMessage({ type: "render-start" });
        input = p.input;
        options = p.options ?? {};
        algorithm = new AlgorithmClass(p.input, options) as unknown as TAlgo;
        current = 0;
        postMessage({
            type: "render-done",
            payload: {
                stepsLength: algorithm.getStepsLength(),
                metrics: algorithm.getMetrics(),
            },
        });
        revealStart = performance.now();
        animateReveal();
    }

    self.onmessage = (event: MessageEvent<Incoming>) => {
        const { type, payload, canvas } = event.data;
        switch (type) {
            case "tab":
                return subscribe(payload);
            case "mount":
                return mount((payload as { id?: string } | undefined)?.id);
            case "init-canvas": {
                if (!canvas) return postError("canvas offscreen not provided");
                ctx = canvas.getContext("2d");
                if (!ctx) return postError("Cannot initialize 2d context");
                render(current);
                postMessage({ type: "canvas-initialized" });
                return;
            }
            case "load-step-colors": {
                const next = (payload as { stepColors?: Colors })?.stepColors;
                if (next) colors = next;
                render(current);
                postMessage({ type: "colors-loaded" });
                return;
            }
            case "resize": {
                const {
                    width: w,
                    height: h,
                    devicePixelRatio,
                } = (payload ?? {}) as Rect & { devicePixelRatio?: number };
                if (resize(w, h, devicePixelRatio)) render(current);
                postSize();
                return;
            }
            case "line-steps": {
                const { ids } = (payload ?? {}) as { ids?: string[] };
                const steps = stepsOnLines(ids ?? []);
                postMessage({ type: "line-steps", payload: { steps } });
                return;
            }
            case "render-algorithm":
                return run((payload ?? {}) as RunPayload<TInput>);
        }
    };
}
