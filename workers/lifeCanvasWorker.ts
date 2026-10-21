import type { LifeAlgorithm } from "../algorithms/life/LifeAlgorithm";
import type { LifeInput } from "../utils/lifeInput";
import { gridLayout } from "../utils/grid";
import { createCanvasWorker } from "./runtime/canvasWorker";

/*
 * Cellular automata: live cells in cream on the dark floor, cells born
 * this generation in yellow, cells that just died as a faint red ghost,
 * Brian's Brain "dying" cells in pink and Langton's ant as a ringed cell.
 */

createCanvasWorker<LifeInput, LifeAlgorithm>({
    category: "life",
    draw: ({ ctx, width, height, color, algorithm, input, step, reveal }) => {
        const state = algorithm.getStateByStepsIndex(step);
        const { cols, rows } = input;
        const layout = gridLayout(cols, rows, width, height);
        const size = layout.cell - layout.gap;
        const shown = Math.ceil(rows * reveal);
        const fresh = state.type === "generation";

        const floor = color("path-empty", "#2b251f");
        const alive = color("path-end", "#f4ede0");
        const born = color("frontier", "#f5cd4e");
        const died = color("check-false", "#ff7a68");
        const dying = color("select", "#ee8fd0");

        ctx.fillStyle = floor;
        ctx.fillRect(
            layout.x,
            layout.y,
            cols * layout.cell,
            shown * layout.cell
        );
        for (let y = 0; y < shown; y += 1) {
            for (let x = 0; x < cols; x += 1) {
                const i = y * cols + x;
                const now = state.cells[i];
                const before = state.previous[i];
                let fill: string | null = null;
                if (now === 1) fill = fresh && before !== 1 ? born : alive;
                else if (now === 2) fill = dying;
                else if (fresh && before === 1) {
                    ctx.globalAlpha = 0.35;
                    fill = died;
                }
                if (fill) {
                    ctx.fillStyle = fill;
                    ctx.fillRect(
                        layout.x + x * layout.cell,
                        layout.y + y * layout.cell,
                        size,
                        size
                    );
                }
                ctx.globalAlpha = 1;
            }
        }

        if (state.marker >= 0) {
            const px = layout.x + (state.marker % cols) * layout.cell;
            const py = layout.y + Math.floor(state.marker / cols) * layout.cell;
            const t = Math.max(1, Math.floor(size / 4));
            ctx.fillStyle = color("current", "#ee8fd0");
            ctx.fillRect(px - t * 2, py - t * 2, size + t * 4, size + t * 4);
            ctx.fillStyle = floor;
            ctx.fillRect(px - t, py - t, size + t * 2, size + t * 2);
            ctx.fillStyle = color("current", "#ee8fd0");
            ctx.fillRect(px, py, size, size);
        }
    },
});
