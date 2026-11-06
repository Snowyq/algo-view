import type { StringAlgorithm } from "../algorithms/strings/StringAlgorithm";
import type { TextInput } from "../utils/textInput";
import { createCanvasWorker, type DescribeApi } from "./runtime/canvasWorker";
import { DARK, highlight, LIT_SOFT, monoFont } from "./runtime/draw";

/*
 * Pattern matching: text tiles on top, the pattern below at its alignment,
 * and the helper table (prefix, skip, hash, Z) under its row. Text wider than
 * the panel scrolls with the pattern; a strip on top shows all of it.
 */

const TABLE_TINT = "rgba(238, 143, 208, 0.18)";
const PAD = 16;
const MIN_CELL = 24;
const MAX_CELL = 44;

/* Spaces show as a middle dot. */
const glyph = (ch: string | undefined): string =>
    ch === " " ? "·" : (ch ?? "");

function describeStrings({
    algorithm,
    input,
    step,
}: DescribeApi<TextInput, StringAlgorithm>): string {
    const state = algorithm.getStateByStepsIndex(step);
    switch (state.type) {
        case "initial":
            return `Find "${input.pattern}" in a ${input.text.length}-letter text.`;
        case "compare":
            return `text[${state.i}] '${glyph(input.text[state.i])}' vs pattern[${state.j}] '${glyph(input.pattern[state.j])}': ${state.ok ? "match" : "mismatch"}.`;
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

        const tile = color("path-empty");
        const ink = color("label", "#d4cab9");
        const ok = color("check-true");
        const bad = color("check-false");
        const found = color("finish");
        const tableColor = color("select");
        const patternFill = color("default");

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
            ctx.font = monoFont(px);
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
            if (fill !== tile) highlight(ctx, x, yy, size, 2, LIT_SOFT);
            ctx.fillStyle = fg;
            ctx.fillText(label, x + size / 2, yy + size / 2 + 1);
        };

        // Overview strip: whole text, matches and the visible window.
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
            drawTile(
                xOf(i),
                y,
                fill,
                glyph(text[i]),
                fill === tile ? ink : DARK
            );
        }
        // Chevrons at the edges when text continues off-screen.
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
                    fill === patternFill ? color("fg") : DARK
                );
            }
        }

        if (state.tableOn === "pattern") {
            y += cell + rowGap;
            drawTable(y, shift, m);
        }
    },
});
