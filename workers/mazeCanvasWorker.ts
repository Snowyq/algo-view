import {
    MARK_FRONTIER,
    MARK_IN_MAZE,
    MARK_WALK,
    type MazeAlgorithm,
    type MazeInput,
} from "../algorithms/maze/MazeAlgorithm";
import { gridLayout } from "../utils/grid";
import { createCanvasWorker } from "./runtime/canvasWorker";

/*
 * Maze generation: solid rock that gets carved. Passages are drawn in
 * the floor color, the open stack / random walk glows, frontier rooms
 * wait in yellow, and the cursor shows where the algorithm is looking.
 */

createCanvasWorker<MazeInput, MazeAlgorithm>({
    category: "maze",
    draw: ({ ctx, width, height, color, algorithm, input, step, reveal }) => {
        const { walls, marks, current } = algorithm.getStateByStepsIndex(step);
        const { cols, rows } = input;
        const layout = gridLayout(cols, rows, width, height);
        const size = layout.cell - layout.gap;
        const shown = Math.ceil(rows * reveal);

        const rock = color("path-wall", "#6b5f50");
        const floor = color("path-empty", "#2b251f");
        const settled = color("visit", "#7fb0ff");
        const walk = color("path", "#5fd6c6");
        const frontier = color("frontier", "#f5cd4e");

        for (let y = 0; y < shown; y += 1) {
            for (let x = 0; x < cols; x += 1) {
                const i = y * cols + x;
                const px = layout.x + x * layout.cell;
                const py = layout.y + y * layout.cell;
                const mark = marks[i];
                if (walls[i] === 1) {
                    // Rock, unless a walk or the frontier passes over it.
                    ctx.fillStyle =
                        mark === MARK_WALK
                            ? walk
                            : mark === MARK_FRONTIER
                              ? frontier
                              : rock;
                    ctx.globalAlpha = mark === MARK_WALK ? 0.55 : 1;
                    ctx.fillRect(px, py, size, size);
                    ctx.globalAlpha = 1;
                    continue;
                }
                ctx.fillStyle =
                    mark === MARK_WALK
                        ? walk
                        : mark === MARK_IN_MAZE
                          ? floor
                          : floor;
                ctx.fillRect(px, py, size, size);
                // Settled passages carry a faint tint of "done".
                if (mark === MARK_IN_MAZE) {
                    ctx.globalAlpha = 0.18;
                    ctx.fillStyle = settled;
                    ctx.fillRect(px, py, size, size);
                    ctx.globalAlpha = 1;
                }
            }
        }

        if (current >= 0) {
            const px = layout.x + (current % cols) * layout.cell;
            const py = layout.y + Math.floor(current / cols) * layout.cell;
            ctx.fillStyle = color("current", "#ee8fd0");
            ctx.fillRect(px, py, size, size);
        }
    },
});
