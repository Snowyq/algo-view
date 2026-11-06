import {
    OVERLAY_FRONTIER,
    OVERLAY_PATH,
    OVERLAY_VISITED,
    type PathAlgorithm,
} from "../algorithms/path/PathAlgorithm";
import { CELL_MUD, CELL_WALL, gridLayout, type GridInput } from "../utils/grid";
import { createCanvasWorker, type DescribeApi } from "./runtime/canvasWorker";
import { cellName, cellOrigin, highlight } from "./runtime/draw";

/*
 * Path finding: walls and mud are the map, the overlay (frontier, visited,
 * route) is the search at this step.
 */

function describePath({
    algorithm,
    input,
    step,
}: DescribeApi<GridInput, PathAlgorithm>): string {
    const info = algorithm.getStepByIndex(step);
    if (!info) return "";
    const m = info.metrics;
    const at = (cell: number): string => cellName(cell, input.cols);
    const visited = m.visited?.count ?? 0;
    const open = m.open?.count ?? 0;
    switch (info.type) {
        case "initial":
            return `Start at ${at(input.start)}, end at ${at(input.end)}.`;
        case "visit":
            return `Expand ${at(info.current)}: ${visited} visited, ${open} waiting.`;
        case "frontier":
            return `Queue ${info.cells.length} new neighbour${info.cells.length === 1 ? "" : "s"}.`;
        case "path":
            return `Trace the route back: ${m.path?.count ?? info.cells.length} cells, cost ${m.cost?.count ?? "?"}.`;
        case "finish":
            return m.noPath?.count || m.gaveUp?.count
                ? "No route found."
                : `Done: ${visited} cells visited.`;
        default:
            return "";
    }
}

createCanvasWorker<GridInput, PathAlgorithm>({
    category: "path",
    describe: describePath,
    draw: ({ ctx, width, height, color, algorithm, input, step, reveal }) => {
        const { overlay, current } = algorithm.getStateByStepsIndex(step);
        const { cols, rows, cells, start, end } = input;
        const layout = gridLayout(cols, rows, width, height);
        const size = layout.cell - layout.gap;
        const shownRows = Math.ceil(rows * reveal);

        const empty = color("path-empty");
        const wall = color("path-wall");
        const mud = color("path-mud", "#4f3524");
        const mudDot = color("path-mud-dot", "#8a5a3a");
        const frontier = color("frontier");
        const visited = color("visit");
        const route = color("path");

        const at = (cell: number): [number, number] =>
            cellOrigin(layout, cols, cell);

        for (let y = 0; y < shownRows; y += 1) {
            for (let x = 0; x < cols; x += 1) {
                const i = y * cols + x;
                const px = layout.x + x * layout.cell;
                const py = layout.y + y * layout.cell;
                const kind = cells[i];
                if (kind === CELL_WALL) {
                    ctx.fillStyle = wall;
                    ctx.fillRect(px, py, size, size);
                    if (size >= 6) highlight(ctx, px, py, size, 1);
                    continue;
                }
                const state = overlay[i];
                let fill = kind === CELL_MUD ? mud : empty;
                if (state === OVERLAY_VISITED) fill = visited;
                else if (state === OVERLAY_FRONTIER) fill = frontier;
                else if (state === OVERLAY_PATH) fill = route;
                // Visited cells sit back a little so the frontier pops.
                ctx.globalAlpha = state === OVERLAY_VISITED ? 0.62 : 1;
                ctx.fillStyle = fill;
                ctx.fillRect(px, py, size, size);
                ctx.globalAlpha = 1;
                if (kind === CELL_MUD && size >= 5) {
                    const d = Math.max(1, Math.floor(size / 5));
                    ctx.fillStyle = mudDot;
                    ctx.fillRect(px + d, py + d * 2, d, d);
                    ctx.fillRect(px + d * 3, py + d * 3, d, d);
                }
                if (state === OVERLAY_PATH && size >= 6) {
                    highlight(
                        ctx,
                        px,
                        py,
                        size,
                        Math.max(1, Math.floor(size / 5))
                    );
                }
            }
        }

        if (current >= 0 && current !== start && current !== end) {
            const [px, py] = at(current);
            ctx.fillStyle = color("current");
            ctx.fillRect(px, py, size, size);
        }

        // Start: solid block. End: notched ring.
        const [sx, sy] = at(start);
        ctx.fillStyle = color("path-start");
        ctx.fillRect(sx, sy, size, size);
        const [ex, ey] = at(end);
        ctx.fillStyle = color("path-end");
        if (size < 6) {
            ctx.fillRect(ex, ey, size, size);
        } else {
            const t = Math.max(2, Math.floor(size / 4));
            ctx.fillRect(ex + 1, ey, size - 2, t);
            ctx.fillRect(ex + 1, ey + size - t, size - 2, t);
            ctx.fillRect(ex, ey + 1, t, size - 2);
            ctx.fillRect(ex + size - t, ey + 1, t, size - 2);
        }
    },
});
