import type { LifeAlgorithm } from "../algorithms/life/LifeAlgorithm";
import type { LifeInput } from "../utils/lifeInput";
import { gridLayout } from "../utils/grid";
import { createCanvasWorker, type DescribeApi } from "./runtime/canvasWorker";
import { cellOrigin } from "./runtime/draw";

/*
 * Cellular automata: live cells cream, newborns yellow, fresh deaths a faint
 * red ghost, Brian's Brain dying cells pink, Langton's ant a ringed cell.
 */

function describeLife({
    algorithm,
    step,
}: DescribeApi<LifeInput, LifeAlgorithm>): string {
    const s = algorithm.getStateByStepsIndex(step);
    const alive = s.metrics.alive?.count ?? 0;
    switch (s.type) {
        case "initial":
            return `Generation 0: ${alive} cells alive.`;
        case "generation":
            return `Generation ${s.generation}: ${alive} alive.`;
        case "finish":
            return alive === 0
                ? "Everything died out."
                : `Stopped at generation ${s.generation}: ${alive} alive.`;
        default:
            return "";
    }
}

createCanvasWorker<LifeInput, LifeAlgorithm>({
    category: "life",
    describe: describeLife,
    draw: ({ ctx, width, height, color, algorithm, input, step, reveal }) => {
        const state = algorithm.getStateByStepsIndex(step);
        const { cols, rows } = input;
        const layout = gridLayout(cols, rows, width, height);
        const size = layout.cell - layout.gap;
        const shown = Math.ceil(rows * reveal);
        const fresh = state.type === "generation";

        const floor = color("path-empty");
        const alive = color("path-end");
        const born = color("frontier");
        const died = color("check-false");
        const dying = color("select");
        const marker = color("current");

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
            const [px, py] = cellOrigin(layout, cols, state.marker);
            const t = Math.max(1, Math.floor(size / 4));
            ctx.fillStyle = marker;
            ctx.fillRect(px - t * 2, py - t * 2, size + t * 4, size + t * 4);
            ctx.fillStyle = floor;
            ctx.fillRect(px - t, py - t, size + t * 2, size + t * 2);
            ctx.fillStyle = marker;
            ctx.fillRect(px, py, size, size);
        }
    },
});
