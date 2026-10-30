import {
    type FillAlgorithm,
    MARK_QUEUED,
} from "../algorithms/fill/FillAlgorithm";
import type { FillInput } from "../utils/fillInput";
import { gridLayout } from "../utils/grid";
import { createCanvasWorker, type DescribeApi } from "./runtime/canvasWorker";

/*
 * Flood fill on a bitmap: walls, open floor, cells waiting in the queue
 * or stack (yellow), and paint (teal). Freshly painted cells glow and
 * cool down, so the shape of the wavefront — diamond, square, snake,
 * runs, mould — is visible at a glance. Labelling gives every region its
 * own colour instead.
 */

const FRESH = 24;
const LABEL_TOKENS = [
    "finish",
    "swap",
    "select",
    "check",
    "check-true",
    "check-false",
];

/* "Paint (12, 4): 230 painted, 18 waiting". */
function describeFill({
    algorithm,
    input,
    step,
}: DescribeApi<FillInput, FillAlgorithm>): string {
    const info = algorithm.getStepByIndex(step);
    if (!info) return "";
    const m = info.metrics;
    const at = (cell: number): string =>
        `(${cell % input.cols}, ${Math.floor(cell / input.cols)})`;
    switch (info.type) {
        case "initial":
            return `Pour paint at ${at(input.start)}.`;
        case "fill":
            return `Paint ${at(info.cell)}: ${m.filled?.count ?? 0} painted.`;
        case "span":
            return `Paint the whole run through ${at(info.cell)}: ${m.filled?.count ?? 0} painted.`;
        case "label":
            return `Label ${at(info.cell)}.`;
        case "merge":
            return "Second pass: merge labels that touch.";
        case "finish":
            return `Done: ${m.filled?.count ?? 0} cells.`;
        default:
            return "";
    }
}

createCanvasWorker<FillInput, FillAlgorithm>({
    category: "fill",
    describe: describeFill,
    draw: ({ ctx, width, height, color, algorithm, input, step, reveal }) => {
        const state = algorithm.getStateByStepsIndex(step);
        const { cols, rows, walls, start } = input;
        const layout = gridLayout(cols, rows, width, height);
        const size = layout.cell - layout.gap;
        const shown = Math.ceil(rows * reveal);
        const finished = state.type === "finish";

        const wall = color("path-wall", "#6b5f50");
        const floor = color("path-empty", "#2b251f");
        const queued = color("frontier", "#f5cd4e");
        const paint = color("path", "#5fd6c6");
        const palette = LABEL_TOKENS.map((t) => color(t, "#5fd6c6"));
        const fresh = Math.max(FRESH, Math.round(state.order * 0.04));

        for (let y = 0; y < shown; y += 1) {
            for (let x = 0; x < cols; x += 1) {
                const i = y * cols + x;
                const px = layout.x + x * layout.cell;
                const py = layout.y + y * layout.cell;
                const mark = state.marks[i];
                let fill = walls[i] ? wall : floor;
                let glow = 0;
                if (mark === MARK_QUEUED) fill = queued;
                else if (mark > 0 && state.mode === "label") {
                    fill = palette[(mark - 1) % palette.length];
                    ctx.globalAlpha =
                        Math.floor((mark - 1) / palette.length) % 2 ? 0.55 : 1;
                } else if (mark > 0) {
                    fill = paint;
                    if (!finished)
                        glow = Math.max(0, 1 - (state.order - mark) / fresh);
                }
                ctx.fillStyle = fill;
                ctx.fillRect(px, py, size, size);
                ctx.globalAlpha = 1;
                if (glow > 0) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${(glow * 0.55).toFixed(3)})`;
                    ctx.fillRect(px, py, size, size);
                }
            }
        }

        const ring = (cell: number, stroke: string): void => {
            const px = layout.x + (cell % cols) * layout.cell;
            const py = layout.y + Math.floor(cell / cols) * layout.cell;
            if (Math.floor(cell / cols) >= shown) return;
            const t = size >= 8 ? 2 : 1;
            ctx.fillStyle = stroke;
            ctx.fillRect(px - t, py - t, size + t * 2, t);
            ctx.fillRect(px - t, py + size, size + t * 2, t);
            ctx.fillRect(px - t, py, t, size);
            ctx.fillRect(px + size, py, t, size);
        };
        if (state.mode === "order") ring(start, color("path-start", "#e8825c"));
        if (!finished && state.cell >= 0)
            ring(state.cell, color("current", "#ee8fd0"));
    },
});
