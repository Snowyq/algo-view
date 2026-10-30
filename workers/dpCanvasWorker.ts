import type { DpAlgorithm } from "../algorithms/dp/DpAlgorithm";
import type { DpInput } from "../utils/dpInput";
import { createCanvasWorker, type DescribeApi } from "./runtime/canvasWorker";

/*
 * Dynamic programming: the table with its axis labels. The cell being
 * written is pink, the cells it reads from yellow, filled cells carry
 * their value, and the traced answer glows at the end.
 */

const LIT = "rgba(255, 255, 255, 0.22)";

function show(value: number): string {
    if (Number.isNaN(value)) return "";
    if (!Number.isFinite(value)) return "∞";
    return String(value);
}

/* "[kitten × sit] = 2, from 3 cells". */
function describeDp({
    algorithm,
    step,
}: DescribeApi<DpInput, DpAlgorithm>): string {
    const info = algorithm.getStepByIndex(step);
    if (!info) return "";
    const { cols, rowLabels, colLabels } = algorithm.table;
    const where = (cell: number): string => {
        const r = Math.floor(cell / cols);
        const c = cell % cols;
        const row = rowLabels[r] ?? String(r);
        const col = colLabels[c] ?? String(c);
        return `row ${row || "∅"}, column ${col || "∅"}`;
    };
    switch (info.type) {
        case "initial":
            return "Empty table: fill it cell by cell.";
        case "fill":
            return `${where(info.cell)} = ${show(info.value)}${info.deps.length ? `, from ${info.deps.length} earlier cell${info.deps.length === 1 ? "" : "s"}` : ""}.`;
        case "trace":
            return `Trace back through ${where(info.cell)}.`;
        case "finish":
            return `Answer: ${algorithm.getMetrics().answer?.count ?? "?"}.`;
        default:
            return "";
    }
}

createCanvasWorker<DpInput, DpAlgorithm>({
    category: "dp",
    describe: describeDp,
    draw: ({ ctx, width, height, color, algorithm, step, reveal }) => {
        const { table, values, traced, cell, deps, type } =
            algorithm.getStateByStepsIndex(step);
        const totalCols = table.cols + 1;
        const totalRows = table.rows + 1;
        const size = Math.max(
            6,
            Math.min(
                48,
                Math.floor(Math.min(width / totalCols, height / totalRows))
            )
        );
        const gap = size >= 14 ? 2 : 1;
        const left = Math.floor((width - size * totalCols) / 2);
        const top = Math.floor((height - size * totalRows) / 2);
        const fontSize = Math.max(8, Math.min(15, Math.floor(size * 0.42)));
        ctx.font = `bold ${fontSize}px ui-monospace, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const empty = color("path-empty", "#2b251f");
        const filled = color("default", "#7a6c5a");
        const reading = color("check", "#f5cd4e");
        const writing = color("select", "#ee8fd0");
        const answer = color("finish", "#5fd6c6");
        const label = color("label", "#a99d8a");
        const ink = "#1d110b";
        const depSet = new Set(deps);
        const shownRows = Math.ceil(table.rows * reveal);

        // Axis labels.
        ctx.fillStyle = label;
        table.colLabels.forEach((text, c) => {
            ctx.fillText(
                text,
                left + (c + 1) * size + size / 2,
                top + size / 2
            );
        });
        table.rowLabels.forEach((text, r) => {
            if (r < shownRows) {
                ctx.fillText(
                    text,
                    left + size / 2,
                    top + (r + 1) * size + size / 2
                );
            }
        });
        if (table.corner && size >= 22) {
            ctx.globalAlpha = 0.6;
            ctx.fillText(table.corner, left + size / 2, top + size / 2);
            ctx.globalAlpha = 1;
        }

        for (let r = 0; r < shownRows; r += 1) {
            for (let c = 0; c < table.cols; c += 1) {
                const i = r * table.cols + c;
                const x = left + (c + 1) * size;
                const y = top + (r + 1) * size;
                const value = values[i];
                const has = !Number.isNaN(value);
                let fill = has ? filled : empty;
                let text = has ? label : label;
                if (traced[i]) {
                    fill = answer;
                    text = ink;
                } else if (i === cell && type === "fill") {
                    fill = writing;
                    text = ink;
                } else if (depSet.has(i)) {
                    fill = reading;
                    text = ink;
                }
                ctx.globalAlpha = has && fill === filled ? 0.45 : 1;
                ctx.fillStyle = fill;
                ctx.fillRect(x, y, size - gap, size - gap);
                ctx.globalAlpha = 1;
                if (fill !== empty && fill !== filled && size >= 10) {
                    ctx.fillStyle = LIT;
                    ctx.fillRect(x, y, size - gap, 2);
                }
                if (has && size >= 14) {
                    ctx.fillStyle =
                        fill === filled ? color("fg", "#f4ede0") : text;
                    ctx.fillText(
                        show(value),
                        x + (size - gap) / 2,
                        y + (size - gap) / 2 + 1
                    );
                }
            }
        }
    },
});
