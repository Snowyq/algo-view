import {
    OVERLAY_FRONTIER,
    OVERLAY_PATH,
    OVERLAY_VISITED,
    type PathAlgorithm,
} from "../algorithms/path/PathAlgorithm";
import { CELL_MUD, CELL_WALL, gridLayout, type GridInput } from "../utils/grid";
import { createCanvasWorker } from "./runtime/canvasWorker";

/*
 * Path finding: the grid in square tiles. Walls and mud are the map,
 * the overlay (frontier, visited, route) is the search at this step.
 * A fresh grid wipes in row by row.
 */

const LIT = "rgba(255, 255, 255, 0.28)";

createCanvasWorker<GridInput, PathAlgorithm>({
    category: "path",
    draw: ({ ctx, width, height, color, algorithm, input, step, reveal }) => {
        const { overlay, current } = algorithm.getStateByStepsIndex(step);
        const { cols, rows, cells, start, end } = input;
        const layout = gridLayout(cols, rows, width, height);
        const size = layout.cell - layout.gap;
        const shownRows = Math.ceil(rows * reveal);

        const empty = color("path-empty", "#2b251f");
        const wall = color("path-wall", "#6b5f50");
        const mud = color("path-mud", "#4f3524");
        const mudDot = color("path-mud-dot", "#8a5a3a");
        const frontier = color("frontier", "#f5cd4e");
        const visited = color("visit", "#7fb0ff");
        const route = color("path", "#5fd6c6");

        const at = (cell: number): [number, number] => [
            layout.x + (cell % cols) * layout.cell,
            layout.y + Math.floor(cell / cols) * layout.cell,
        ];

        for (let y = 0; y < shownRows; y += 1) {
            for (let x = 0; x < cols; x += 1) {
                const i = y * cols + x;
                const px = layout.x + x * layout.cell;
                const py = layout.y + y * layout.cell;
                const kind = cells[i];
                if (kind === CELL_WALL) {
                    ctx.fillStyle = wall;
                    ctx.fillRect(px, py, size, size);
                    if (size >= 6) {
                        ctx.fillStyle = LIT;
                        ctx.fillRect(px, py, size, 1);
                    }
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
                    ctx.fillStyle = LIT;
                    ctx.fillRect(
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
            ctx.fillStyle = color("current", "#ee8fd0");
            ctx.fillRect(px, py, size, size);
        }

        // Start: solid block. End: notched ring.
        const [sx, sy] = at(start);
        ctx.fillStyle = color("path-start", "#e8825c");
        ctx.fillRect(sx, sy, size, size);
        const [ex, ey] = at(end);
        ctx.fillStyle = color("path-end", "#f4ede0");
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
