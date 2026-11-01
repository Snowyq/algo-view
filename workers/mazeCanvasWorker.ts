import {
    MARK_FRONTIER,
    MARK_IN_MAZE,
    MARK_WALK,
    type MazeAlgorithm,
    type MazeInput,
} from "../algorithms/maze/MazeAlgorithm";
import { gridLayout } from "../utils/grid";
import { createCanvasWorker, type DescribeApi } from "./runtime/canvasWorker";
import { cellName, cellOrigin } from "./runtime/draw";

/*
 * Maze generation: solid rock gets carved into floor. The open stack or
 * random walk glows, frontier rooms wait in yellow.
 */

function describeMaze({
    algorithm,
    input,
    step,
}: DescribeApi<MazeInput, MazeAlgorithm>): string {
    const info = algorithm.getStepByIndex(step);
    if (!info) return "";
    const carved = info.metrics.carved?.count ?? 0;
    switch (info.type) {
        case "initial":
            return "Solid rock: nothing carved yet.";
        case "carve":
            return `Knock down a wall: ${carved} cells open.`;
        case "frontier":
            return `${info.mark.length} room${info.mark.length === 1 ? "" : "s"} join the frontier.`;
        case "visit":
            return info.current >= 0
                ? `Look around ${cellName(info.current, input.cols)}.`
                : "";
        case "walk":
            return "Random walk: wander until the maze is hit.";
        case "finish":
            return `Done: ${carved} cells carved, ${info.metrics.deadEnds?.count ?? 0} dead ends.`;
        default:
            return "";
    }
}

createCanvasWorker<MazeInput, MazeAlgorithm>({
    category: "maze",
    describe: describeMaze,
    draw: ({ ctx, width, height, color, algorithm, input, step, reveal }) => {
        const { walls, marks, current } = algorithm.getStateByStepsIndex(step);
        const { cols, rows } = input;
        const layout = gridLayout(cols, rows, width, height);
        const size = layout.cell - layout.gap;
        const shown = Math.ceil(rows * reveal);

        const rock = color("path-wall");
        const floor = color("path-empty");
        const settled = color("visit");
        const walk = color("path");
        const frontier = color("frontier");

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
                ctx.fillStyle = mark === MARK_WALK ? walk : floor;
                ctx.fillRect(px, py, size, size);
                // Faint tint on settled passages.
                if (mark === MARK_IN_MAZE) {
                    ctx.globalAlpha = 0.18;
                    ctx.fillStyle = settled;
                    ctx.fillRect(px, py, size, size);
                    ctx.globalAlpha = 1;
                }
            }
        }

        if (current >= 0) {
            const [px, py] = cellOrigin(layout, cols, current);
            ctx.fillStyle = color("current");
            ctx.fillRect(px, py, size, size);
        }
    },
});
