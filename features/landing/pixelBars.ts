import { createRng } from "../../utils/randoms";

/*
 * Landing-page data graphics: a tiny insertion sort recorded step by step,
 * and a renderer that draws each value as a column of square blocks, in
 * the same step colors the playground canvas uses.
 */

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
    const steps: BarStep[] = [
        { values: values.slice(), a: -1, b: -1, kind: "initial", sorted: 0 },
    ];
    for (let i = 1; i < values.length; i += 1) {
        let j = i;
        while (j > 0) {
            steps.push({
                values: values.slice(),
                a: j - 1,
                b: j,
                kind: "check",
                sorted: i,
            });
            if (values[j - 1] <= values[j]) break;
            [values[j - 1], values[j]] = [values[j], values[j - 1]];
            steps.push({
                values: values.slice(),
                a: j - 1,
                b: j,
                kind: "swap",
                sorted: i,
            });
            j -= 1;
        }
    }
    steps.push({
        values: values.slice(),
        a: -1,
        b: -1,
        kind: "done",
        sorted: values.length,
    });
    return steps;
}

export type BarColors = {
    idle: string;
    check: string;
    swap: string;
    finish: string;
    lit: string;
};

export function readBarColors(
    el: Element = document.documentElement
): BarColors {
    const css = getComputedStyle(el);
    const v = (name: string, fallback: string): string =>
        css.getPropertyValue(name).trim() || fallback;
    return {
        idle: v("--color-step-default", "#7a6c5a"),
        check: v("--color-step-check", "#f5cd4e"),
        swap: v("--color-step-swap", "#7fb0ff"),
        finish: v("--color-step-finish", "#5fd6c6"),
        lit: "rgba(255, 255, 255, 0.28)",
    };
}

type DrawOptions = {
    width: number;
    height: number;
    /** Block size in CSS px (square). */
    block: number;
    gap?: number;
    /** 0–1: how far a left-to-right "finished" sweep has gone. */
    sweep?: number;
};

/* Columns of square blocks; the top block of each column is lit. */
export function drawBlockBars(
    ctx: CanvasRenderingContext2D,
    step: BarStep,
    colors: BarColors,
    { width, height, block, gap = 2, sweep = 0 }: DrawOptions
): void {
    const { values, a, b, kind } = step;
    const count = values.length;
    const max = Math.max(...values);
    const colW = Math.floor((width + gap) / count) - gap;
    const used = count * (colW + gap) - gap;
    const left = Math.floor((width - used) / 2);
    const rows = Math.max(1, Math.floor((height + gap) / (block + gap)));
    ctx.clearRect(0, 0, width, height);

    values.forEach((value, i) => {
        let color = colors.idle;
        if (kind === "done" || i < count * sweep) color = colors.finish;
        else if (i === a || i === b)
            color = kind === "swap" ? colors.swap : colors.check;
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
