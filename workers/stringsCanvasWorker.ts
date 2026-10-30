import type { StringAlgorithm } from "../algorithms/strings/StringAlgorithm";
import type { TextInput } from "../utils/textInput";
import { createCanvasWorker, type DescribeApi } from "./runtime/canvasWorker";

/*
 * Pattern matching: the text as a row of letter tiles, the pattern
 * underneath at its current alignment, letters lighting green or red as
 * they are compared, found occurrences glowing in the text, and the
 * helper table (prefix / skip / hash / Z) filling in under its row.
 * Tiles stay readable: when the text is wider than the panel, a camera
 * keeps the pattern centred and a strip on top shows the whole text.
 */

const LIT = "rgba(255, 255, 255, 0.22)";
const TABLE_TINT = "rgba(238, 143, 208, 0.18)";
const DARK = "#1d110b";
const PAD = 16;
const MIN_CELL = 24;
const MAX_CELL = 44;

/* "text[12] 'r' vs pattern[2] 'r': match". */
function describeStrings({
    algorithm,
    input,
    step,
}: DescribeApi<TextInput, StringAlgorithm>): string {
    const state = algorithm.getStateByStepsIndex(step);
    const show = (ch: string | undefined): string =>
        ch === " " ? "·" : (ch ?? "");
    switch (state.type) {
        case "initial":
            return `Find "${input.pattern}" in a ${input.text.length}-letter text.`;
        case "compare":
            return `text[${state.i}] '${show(input.text[state.i])}' vs pattern[${state.j}] '${show(input.pattern[state.j])}': ${state.ok ? "match" : "mismatch"}.`;
        case "shift":
            return `Slide the pattern to position ${state.shift}.`;
        case "match":
            return `Occurrence at position ${state.i}.`;
        case "table":
            return `${state.tableLabel || "table"}[${state.tableIndex}] = ${state.tableValue}.`;
        case "finish":
            return `${state.matches.length} occurrence${state.matches.length === 1 ? "" : "s"} found.`;
        default:
            return "";
    }
}

createCanvasWorker<TextInput, StringAlgorithm>({
    category: "strings",
    describe: describeStrings,
    draw: ({ ctx, width, height, color, algorithm, input, step, reveal }) => {
        const state = algorithm.getStateByStepsIndex(step);
        const { text, pattern } = input;
        const n = text.length;
        const m = pattern.length;

        const tile = color("path-empty", "#2b251f");
        const ink = color("label", "#d4cab9");
        const ok = color("check-true", "#8fdc8a");
        const bad = color("check-false", "#ff7a68");
        const found = color("finish", "#5fd6c6");
        const tableColor = color("select", "#ee8fd0");
        const patternFill = color("default", "#7a6c5a");

        const hasTable = state.tableOn !== "none";
        const rows = hasTable ? 3 : 2;
        const usableW = width - PAD * 2;
        const byHeight = Math.floor((height - 60) / (rows + (rows - 1) * 0.6));
        const cell = Math.max(
            MIN_CELL,
            Math.min(MAX_CELL, Math.floor(usableW / n), byHeight)
        );
        const size = cell - 2;
        const visible = Math.max(1, Math.min(n, Math.floor(usableW / cell)));
        const scrolling = visible < n;

        // Camera: keep the pattern (or the compared letter) in view.
        const focus = state.type === "compare" ? state.i : state.shift + m / 2;
        const start = scrolling
            ? Math.max(
                  0,
                  Math.min(n - visible, Math.round(focus - visible / 2))
              )
            : 0;
        const x0 = Math.floor((width - visible * cell) / 2);
        const xOf = (index: number): number => x0 + (index - start) * cell;
        const inView = (index: number): boolean =>
            index >= start && index < start + visible;

        const rowGap = Math.round(cell * 0.6);
        const stripH = scrolling ? 18 : 0;
        const blockH = stripH + rows * cell + (rows - 1) * rowGap;
        let y = Math.max(PAD, Math.floor((height - blockH) / 2));

        const inMatch = new Uint8Array(n);
        state.matches.forEach((s) => {
            for (let k = s; k < s + m && k < n; k += 1) inMatch[k] = 1;
        });
        const comparing = state.type === "compare";
        const shown = Math.ceil(n * reveal);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const font = (px: number): void => {
            ctx.font = `bold ${px}px ui-monospace, monospace`;
        };
        const letterPx = Math.max(10, Math.floor(cell * 0.6));

        const drawTile = (
            x: number,
            yy: number,
            fill: string,
            label: string,
            fg: string
        ): void => {
            ctx.fillStyle = fill;
            ctx.fillRect(x, yy, size, size);
            if (fill !== tile) {
                ctx.fillStyle = LIT;
                ctx.fillRect(x, yy, size, 2);
            }
            ctx.fillStyle = fg;
            ctx.fillText(label, x + size / 2, yy + size / 2 + 1);
        };

        // Overview strip: the whole text, matches, and the camera window.
        if (scrolling) {
            const unit = Math.max(2, Math.floor(usableW / n));
            const sx = Math.floor((width - unit * n) / 2);
            for (let i = 0; i < shown; i += 1) {
                let fill = inMatch[i] ? found : tile;
                if (comparing && state.i === i) fill = state.ok ? ok : bad;
                ctx.fillStyle = fill;
                ctx.fillRect(sx + i * unit, y, unit - 1, 6);
            }
            ctx.fillStyle = ink;
            ctx.fillRect(sx + start * unit, y + 8, visible * unit - 1, 2);
            y += stripH;
        }

        // Text row.
        font(letterPx);
        for (let i = start; i < Math.min(start + visible, shown); i += 1) {
            let fill = inMatch[i] ? found : tile;
            if (comparing && state.i === i) fill = state.ok ? ok : bad;
            const ch = text[i] === " " ? "·" : text[i];
            drawTile(xOf(i), y, fill, ch, fill === tile ? ink : DARK);
        }
        // More text off-screen: small pixel chevrons at the edges.
        if (scrolling) {
            ctx.fillStyle = ink;
            const mid = y + size / 2;
            if (start > 0) {
                ctx.fillRect(x0 - 8, mid - 1, 2, 2);
                ctx.fillRect(x0 - 6, mid - 3, 2, 6);
            }
            if (start + visible < n) {
                const right = x0 + visible * cell + 2;
                ctx.fillRect(right + 4, mid - 1, 2, 2);
                ctx.fillRect(right + 2, mid - 3, 2, 6);
            }
        }

        const drawTable = (yy: number, offset: number, count: number): void => {
            for (let k = 0; k < count; k += 1) {
                const index = offset + k;
                if (!inView(index)) continue;
                const value = state.table[k];
                const filled = !Number.isNaN(value);
                const current =
                    state.type === "table" && state.tableIndex === k;
                const label = filled ? String(value) : "";
                font(
                    label.length > 2
                        ? Math.floor(letterPx * 0.6)
                        : Math.floor(letterPx * 0.8)
                );
                drawTile(
                    xOf(index),
                    yy,
                    current ? tableColor : filled ? TABLE_TINT : tile,
                    label,
                    current ? DARK : ink
                );
            }
            if (state.tableLabel) {
                ctx.textAlign = "left";
                ctx.fillStyle = tableColor;
                font(10);
                ctx.fillText(
                    state.tableLabel,
                    x0,
                    yy - Math.min(8, rowGap / 2)
                );
                ctx.textAlign = "center";
            }
        };

        y += cell + rowGap;
        if (state.tableOn === "text") {
            drawTable(y, 0, n);
            y += cell + rowGap;
        }

        // Pattern row at its current alignment.
        const shift = Math.max(0, state.shift);
        if (reveal === 1) {
            font(letterPx);
            for (let j = 0; j < m; j += 1) {
                if (!inView(shift + j)) continue;
                let fill = patternFill;
                if (comparing && state.j === j) fill = state.ok ? ok : bad;
                if (state.type === "match") fill = found;
                drawTile(
                    xOf(shift + j),
                    y,
                    fill,
                    pattern[j],
                    fill === patternFill ? color("fg", "#f4ede0") : DARK
                );
            }
        }

        if (state.tableOn === "pattern") {
            y += cell + rowGap;
            drawTable(y, shift, m);
        }
    },
});
