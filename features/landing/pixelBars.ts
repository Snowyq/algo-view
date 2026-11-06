import { cssVar } from "../play/pixel/fx/dom";
import { createRng } from "../../utils/randoms";

/* Landing graphics: a recorded insertion sort drawn as columns of blocks. */

export type BarStep = {
    values: number[];
    a: number;
    b: number;
    kind: "check" | "swap" | "done" | "initial";
    /** Everything left of this index is sorted. */
    sorted: number;
};

export function shuffledValues(count: number, seed: number): number[] {
    const rng = createRng(seed);
    const values = Array.from({ length: count }, (_, i) => i + 1);
    for (let i = values.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
}

export function recordInsertionSort(start: number[]): BarStep[] {
    const values = start.slice();
    const snapshot = (
        kind: BarStep["kind"],
        a: number,
        b: number,
        sorted: number
    ): BarStep => ({ values: values.slice(), a, b, kind, sorted });

    const steps = [snapshot("initial", -1, -1, 0)];
    for (let i = 1; i < values.length; i += 1) {
        for (let j = i; j > 0; j -= 1) {
            steps.push(snapshot("check", j - 1, j, i));
            if (values[j - 1] <= values[j]) break;
            [values[j - 1], values[j]] = [values[j], values[j - 1]];
            steps.push(snapshot("swap", j - 1, j, i));
        }
    }
    steps.push(snapshot("done", -1, -1, values.length));
    return steps;
}

export type BarColors = {
    idle: string;
    check: string;
    swap: string;
    finish: string;
    lit: string;
};

export function readBarColors(): BarColors {
    const root = document.documentElement;
    return {
        idle: cssVar(root, "--color-step-default", "#7a6c5a"),
        check: cssVar(root, "--color-step-check", "#f5cd4e"),
        swap: cssVar(root, "--color-step-swap", "#7fb0ff"),
        finish: cssVar(root, "--color-step-finish", "#5fd6c6"),
        lit: "rgba(255, 255, 255, 0.28)",
    };
}

type DrawOptions = {
    width: number;
    height: number;
    /** Block size in CSS px (square). */
    block: number;
    gap?: number;
};

function barColor(step: BarStep, i: number, colors: BarColors): string {
    if (step.kind === "done") return colors.finish;
    if (i !== step.a && i !== step.b) return colors.idle;
    return step.kind === "swap" ? colors.swap : colors.check;
}

/* Columns of square blocks; the top block of each column is lit. */
export function drawBlockBars(
    ctx: CanvasRenderingContext2D,
    step: BarStep,
    colors: BarColors,
    { width, height, block, gap = 2 }: DrawOptions
): void {
    const { values } = step;
    const count = values.length;
    const max = Math.max(...values);
    const colW = Math.floor((width + gap) / count) - gap;
    const used = count * (colW + gap) - gap;
    const left = Math.floor((width - used) / 2);
    const rows = Math.max(1, Math.floor((height + gap) / (block + gap)));
    ctx.clearRect(0, 0, width, height);

    values.forEach((value, i) => {
        const color = barColor(step, i, colors);
        const blocks = Math.max(1, Math.round((value / max) * rows));
        const x = left + i * (colW + gap);
        for (let r = 0; r < blocks; r += 1) {
            const y = height - (r + 1) * (block + gap) + gap;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, colW, block);
            if (r === blocks - 1) {
                ctx.fillStyle = colors.lit;
                ctx.fillRect(x, y, colW, Math.max(1, Math.round(block / 4)));
            }
        }
    });
}

/** Matches the backing store to the CSS size (DPR capped at 2). */
export function fitCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
): { width: number; height: number } {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width, height };
}

type StepLoopOptions = {
    stepMs: number;
    holdMs: number;
    /** Caps one frame's delta so a stall doesn't skip ahead. */
    maxFrameMs?: number;
    lastIndex: () => number;
    onStep: (index: number) => void;
    onHold: () => void;
    onRestart: () => void;
};

/**
 * Steps through a recording on a fixed clock, holds on the last step, then
 * starts over. Paused while `target` is offscreen.
 */
export function playStepLoop(
    target: Element,
    options: StepLoopOptions
): { stop: () => void; rewind: () => void } {
    const { stepMs, holdMs, maxFrameMs = Infinity, lastIndex } = options;
    let index = 0;
    let acc = 0;
    let last = 0;
    let holdUntil = 0;
    let visible = false;
    let frame = 0;

    const tick = (now: number): void => {
        frame = requestAnimationFrame(tick);
        if (!visible) {
            last = 0;
            return;
        }
        const dt = last ? Math.min(maxFrameMs, now - last) : 0;
        last = now;
        let moved = false;
        if (holdUntil) {
            if (now < holdUntil) return;
            holdUntil = 0;
            index = 0;
            moved = true;
            options.onRestart();
        }
        acc += dt;
        while (acc >= stepMs && index < lastIndex()) {
            acc -= stepMs;
            index += 1;
            moved = true;
        }
        if (moved) options.onStep(index);
        if (index >= lastIndex()) {
            holdUntil = now + holdMs;
            options.onHold();
        }
    };
    frame = requestAnimationFrame(tick);

    const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
    });
    observer.observe(target);

    return {
        stop: () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        },
        rewind: () => {
            index = 0;
        },
    };
}
