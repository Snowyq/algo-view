import type { SortAlgorithm } from "../algorithms/sort/SortAlgorithm";
import { createCanvasWorker, type DescribeApi } from "./runtime/canvasWorker";
import { highlight, monoFont } from "./runtime/draw";

/*
 * Sorting: one bar per value, coloured by what the step does to it.
 * Edges snap to device pixels and heights to 2px.
 */

const BLOCK_RATIO = 0.8;
const TOP_MARGIN = 15;
const LABEL_MIN_WIDTH = 10;
const HEIGHT_STEP = 2;

type SortStepLike = {
    type?: string;
    activeItems?: number[];
    selected?: Array<{ index: number }>;
};

/* Selected items stay pink; items the step touches take its color. */
function displayType(step: SortStepLike | undefined, index: number): string {
    if (!step) return "default";
    if (step.activeItems?.includes(index)) return step.type ?? "default";
    if (step.selected?.some((item) => item.index === index)) return "select";
    return "default";
}

/* Values are read from the array as it is right before this step. */
function describeSort({
    algorithm,
    step,
}: DescribeApi<number[], SortAlgorithm>): string {
    const info = algorithm.getStepByIndex(step) as
        | (SortStepLike & { operator?: string; payload?: number })
        | undefined;
    if (!info) return "";
    const values = algorithm.getStateByStepsIndex(step);
    const [a, b] = info.activeItems ?? [];
    const va = values[a];
    const vb = values[b];
    switch (info.type) {
        case "initial":
            return `Ready: ${values.length} values to sort.`;
        case "finish":
            return "Sorted.";
        case "check":
            return `Compare ${va} and ${vb}.`;
        case "check-true":
            return `Compare ${va} ${info.operator ?? "vs"} ${vb}: yes.`;
        case "check-false":
            return `Compare ${va} ${info.operator ?? "vs"} ${vb}: no.`;
        case "check-value":
        case "check-value-true":
        case "check-value-false":
            return `Compare ${va} with ${info.payload ?? vb}.`;
        case "swap":
            return `Swap ${va} and ${vb}.`;
        case "assign":
            return `Write ${info.payload ?? va} into slot ${a}.`;
        case "copy":
        case "copy-from":
        case "copy-to":
            return b === undefined
                ? `Move ${va}.`
                : `Shift ${va} from slot ${a} to slot ${b}.`;
        case "select":
            return `Remember ${va} (slot ${a}).`;
        default:
            return "";
    }
}

/*
 * One bar width and one gap in whole device pixels, so spacing stays even.
 * Picks the gap that leaves the least spare width; too dense for gaps, bars touch.
 */
function barLayout(
    n: number,
    width: number,
    dpr: number
): { offset: number; bar: number; pitch: number } {
    const total = Math.round(width * dpr);
    const ideal = (total / n) * (1 - BLOCK_RATIO);
    let best: { bar: number; gap: number; spare: number } | null = null;
    if (n > 1 && ideal >= 1) {
        const base = Math.round(ideal);
        for (const gap of [base - 1, base, base + 1]) {
            if (gap < 1) continue;
            const bar = Math.floor((total - (n - 1) * gap) / n);
            if (bar < 2) continue;
            const spare = total - n * bar - (n - 1) * gap;
            if (!best || spare < best.spare) best = { bar, gap, spare };
        }
    }
    if (!best) {
        const pitch = width / n;
        return { offset: 0, bar: Math.max(1 / dpr, pitch), pitch };
    }
    return {
        offset: Math.floor(best.spare / 2) / dpr,
        bar: best.bar / dpr,
        pitch: (best.bar + best.gap) / dpr,
    };
}

createCanvasWorker<number[], SortAlgorithm>({
    category: "sort",
    describe: describeSort,
    revealMs: 480,
    draw: ({ ctx, width, height, dpr, color, algorithm, step, reveal }) => {
        const values = algorithm.getStateByStepsIndex(step);
        const info = algorithm.getStepByIndex(step) as SortStepLike | undefined;
        const max = algorithm.getArrayMinMax().max || 1;
        const n = values.length;
        if (n === 0) return;

        const { offset, bar, pitch } = barLayout(n, width, dpr);
        const snap = (v: number): number => Math.round(v * dpr) / dpr;
        const usable = height - TOP_MARGIN;

        ctx.font = monoFont(10);
        ctx.textAlign = "center";
        values.forEach((value, i) => {
            const raw = (value / max) * usable * reveal;
            const h =
                raw > 0
                    ? Math.max(
                          HEIGHT_STEP,
                          Math.round(raw / HEIGHT_STEP) * HEIGHT_STEP
                      )
                    : 0;
            const left = snap(offset + i * pitch);
            const w = Math.max(1 / dpr, snap(offset + i * pitch + bar) - left);
            const y = height - h;
            const type = displayType(info, i);
            ctx.fillStyle = color(type, color("default"));
            ctx.fillRect(left, y, w, h);
            if (w >= 4 && h >= HEIGHT_STEP * 2) {
                highlight(ctx, left, y, w, HEIGHT_STEP);
            }
            if (bar >= LABEL_MIN_WIDTH && reveal === 1) {
                ctx.fillStyle = color("label");
                ctx.fillText(String(value), left + bar / 2, y - 5);
            }
        });
    },
});
