import registryApi from "../../algorithms/algorithmsRegistryApi";
import type {
    AlgorithmConstructor,
    StepAlgorithm,
} from "../../algorithms/types";

/*
 * Shared runtime for every canvas worker. It owns the protocol with the
 * main thread and the playback clock:
 *
 *   tab               → subscribe to the step broadcast for this tab
 *   mount {id}        → look the algorithm class up in the registry
 *   init-canvas       → take the OffscreenCanvas
 *   load-step-colors  → palette from CSS custom properties
 *   resize            → CSS size + device pixel ratio
 *   render-algorithm  → run the algorithm on the input (all steps, here)
 *
 *   line-steps {ids}  → every step that runs one of these code lines
 *                       (breakpoints)
 *
 * and posts back mounted / canvas-initialized / render-start /
 * render-done {stepsLength, metrics} / step-metrics {…, caption} /
 * line-steps {steps}. A category worker provides draw() and, optionally,
 * describe() for the plain-language caption of a step.
 */

type Colors = Record<string, string>;
type Rect = { width: number; height: number };
type Incoming = { type: string; payload?: unknown; canvas?: OffscreenCanvas };

export type DrawApi<TInput, TAlgo extends StepAlgorithm> = {
    ctx: OffscreenCanvasRenderingContext2D;
    /** CSS pixels; the transform already includes the pixel ratio. */
    width: number;
    height: number;
    dpr: number;
    color: (name: string, fallback: string) => string;
    algorithm: TAlgo;
    input: TInput;
    options: Record<string, unknown>;
    /** Step to draw (already clamped). */
    step: number;
    /** 0→1 while a fresh run animates in, then 1. */
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
    /** One short sentence: what the algorithm does on this step. */
    describe?: (api: DescribeApi<TInput, TAlgo>) => string;
    revealMs?: number;
};

/* Counters re-render React on the main thread: 20 a second reads live. */
const METRICS_INTERVAL_MS = 50;

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

    const postError = (message: string): void =>
        postMessage({ type: "error", message });

    // ---------- Frame pacing ----------

    // Ticks can arrive far faster than the screen refreshes: keep only the
    // newest step and draw it once per frame, so no backlog builds up.
    const nextFrame: (cb: () => void) => void =
        typeof requestAnimationFrame === "function"
            ? (cb) => requestAnimationFrame(() => cb())
            : (cb) => setTimeout(cb, 16);

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

    let lastMetricsAt = 0;
    let metricsTimer: ReturnType<typeof setTimeout> | null = null;
    let pendingMetrics: Record<string, unknown> | null = null;
    const flushMetrics = (): void => {
        metricsTimer = null;
        if (pendingMetrics === null) return;
        lastMetricsAt = performance.now();
        // The caption is only worked out for steps that actually get sent
        // (20 a second at most), never for every drawn frame.
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

    const color = (name: string, fallback: string): string =>
        colors[name] || fallback;

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

    // ---------- Protocol ----------

    self.onmessage = (event: MessageEvent<Incoming>) => {
        const { type, payload, canvas } = event.data;
        switch (type) {
            case "tab": {
                const channel = new BroadcastChannel(
                    `animation-tick:${payload}`
                );
                channel.onmessage = (e: MessageEvent<{ step: number }>) =>
                    schedule(e.data.step);
                return;
            }
            case "mount": {
                const { id } = (payload ?? {}) as { id?: string };
                const Class = id
                    ? registryApi.getAlgorithmClass(category, id)
                    : undefined;
                if (!Class) return postError(`${category}/${id} not found`);
                AlgorithmClass = Class;
                postMessage({ type: "mounted" });
                return;
            }
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
                // The size actually drawn, so the page can show the bitmap
                // at it instead of stretching the old one meanwhile.
                postMessage({ type: "resized", payload: { width, height } });
                return;
            }
            case "line-steps": {
                const { ids } = (payload ?? {}) as { ids?: string[] };
                const wanted = new Set(ids ?? []);
                const steps: number[] = [];
                if (algorithm && wanted.size > 0) {
                    const total = algorithm.getStepsLength();
                    for (let i = 0; i < total; i += 1) {
                        const lines =
                            algorithm.getStepByIndex(i)?.instructionId;
                        if (lines?.some((id) => wanted.has(id))) steps.push(i);
                    }
                }
                postMessage({ type: "line-steps", payload: { steps } });
                return;
            }
            case "render-algorithm": {
                const p = (payload ?? {}) as {
                    input?: TInput;
                    options?: Record<string, unknown>;
                    rect?: Rect;
                    devicePixelRatio?: number;
                };
                if (p.input === undefined || !p.rect) {
                    return postError("Input or rect not provided");
                }
                if (!AlgorithmClass) return postError("Algorithm not mounted");
                resize(p.rect.width, p.rect.height, p.devicePixelRatio);
                postMessage({ type: "resized", payload: { width, height } });
                postMessage({ type: "render-start" });
                input = p.input;
                options = p.options ?? {};
                algorithm = new AlgorithmClass(
                    p.input,
                    options
                ) as unknown as TAlgo;
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
                return;
            }
        }
    };
}
