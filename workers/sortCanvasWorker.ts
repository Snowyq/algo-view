import type { SortAlgorithm } from "../algorithms/sort/SortAlgorithm";
import { createCanvasWorker } from "./runtime/canvasWorker";

/*
 * Sorting: one bar per value, colored by what the current step does to
 * it. Edges snap to device pixels and heights to 2px for a bitmap look.
 */

const BLOCK_RATIO = 0.8;
const TOP_MARGIN = 15;
const LABEL_MIN_WIDTH = 10;
const HEIGHT_STEP = 2;
const LIT = "rgba(255, 255, 255, 0.28)";

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

createCanvasWorker<number[], SortAlgorithm>({
    category: "sort",
    revealMs: 480,
    draw: ({ ctx, width, height, dpr, color, algorithm, step, reveal }) => {
        const values = algorithm.getStateByStepsIndex(step);
        const info = algorithm.getStepByIndex(step) as SortStepLike | undefined;
        const max = algorithm.getArrayMinMax().max || 1;
        const n = values.length;
        if (n === 0) return;

        let blockW = (width / n) * BLOCK_RATIO;
        let gapW = n > 1 ? (width / (n - 1)) * (1 - BLOCK_RATIO) : 0;
        if (gapW < 1) {
            blockW += gapW;
            gapW = 0;
        }
        const snap = (v: number): number => Math.round(v * dpr) / dpr;
        const usable = height - TOP_MARGIN;

        ctx.font = "bold 10px ui-monospace, monospace";
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
            const left = snap(i * (blockW + gapW));
            const right = snap(i * (blockW + gapW) + blockW);
            const w = Math.max(1 / dpr, right - left);
            const y = height - h;
            const type = displayType(info, i);
            ctx.fillStyle = color(type, color("default", "#7a6c5a"));
            ctx.fillRect(left, y, w, h);
            if (w >= 4 && h >= HEIGHT_STEP * 2) {
                ctx.fillStyle = LIT;
                ctx.fillRect(left, y, w, HEIGHT_STEP);
            }
            if (blockW >= LABEL_MIN_WIDTH && reveal === 1) {
                ctx.fillStyle = color("label", "#a99d8a");
                ctx.fillText(String(value), left + blockW / 2, y - 5);
            }
        });
    },
});
