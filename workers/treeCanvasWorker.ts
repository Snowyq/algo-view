import { NIL, RED, type TreeAlgorithm } from "../algorithms/tree/TreeAlgorithm";
import type { TreeInput } from "../utils/treeInput";
import { createCanvasWorker } from "./runtime/canvasWorker";
import { pixelLine } from "./runtime/pixelLine";

/*
 * Trees: the keys still to insert run along the top, the tree below is
 * laid out by in-order rank (x) and depth (y), so a degenerate tree
 * visibly becomes a staircase. The key being inserted floats next to
 * the node it is compared with; rotations light both nodes involved.
 */

const DARK = "#1d110b";
const PAD = 18;

createCanvasWorker<TreeInput, TreeAlgorithm>({
    category: "tree",
    draw: ({ ctx, width, height, color, algorithm, input, step, reveal }) => {
        const state = algorithm.getStateByStepsIndex(step);
        const { root, keys, left, right, tag, tagKind } = state;
        const all = input.keys;
        const n = all.length;
        const finished = state.type === "finish";

        const idleNode = color("default", "#7a6c5a");
        const ink = color("label", "#d4cab9");
        const fg = color("fg", "#f4ede0");
        const edge = color("path-wall", "#6b5f50");
        const tile = color("path-empty", "#2b251f");
        const check = color("check", "#f5cd4e");
        const inserted = color("finish", "#5fd6c6");
        const swap = color("swap", "#f08a5d");
        const select = color("select", "#ee8fd0");
        const red = color("check-false", "#ff7a68");

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Keys to insert, in order.
        const kw = Math.max(
            10,
            Math.min(22, Math.floor((width - PAD * 2) / n) - 2)
        );
        const kx = Math.floor((width - (kw + 2) * n) / 2);
        ctx.font = `bold ${Math.max(8, Math.floor(kw * 0.5))}px ui-monospace, monospace`;
        for (let i = 0; i < n; i += 1) {
            const current = i === state.keyIndex && !finished;
            const done = i < state.keyIndex;
            ctx.fillStyle = current ? select : done ? tile : idleNode;
            ctx.fillRect(kx + i * (kw + 2), PAD, kw, kw);
            if (kw >= 14) {
                ctx.fillStyle = current ? DARK : done ? ink : fg;
                ctx.fillText(
                    String(all[i]),
                    kx + i * (kw + 2) + kw / 2,
                    PAD + kw / 2 + 1
                );
            }
        }

        // In-order rank and depth of every node in the tree.
        const rank = new Int16Array(n).fill(-1);
        const depth = new Int16Array(n);
        let count = 0;
        let maxDepth = 0;
        const stack: number[] = [];
        let x = root;
        while (x !== NIL || stack.length) {
            while (x !== NIL) {
                stack.push(x);
                x = left[x];
            }
            x = stack.pop()!;
            rank[x] = count;
            count += 1;
            x = right[x];
        }
        const order: number[] = root === NIL ? [] : [root];
        for (let k = 0; k < order.length; k += 1) {
            const u = order[k];
            for (const c of [left[u], right[u]]) {
                if (c === NIL) continue;
                depth[c] = depth[u] + 1;
                maxDepth = Math.max(maxDepth, depth[c]);
                order.push(c);
            }
        }
        if (!count) return;

        const top = PAD + kw + 18;
        const areaH = height - top - PAD;
        const colW = (width - PAD * 2) / Math.max(count, 1);
        const levelH = Math.min(56, (areaH - 20) / Math.max(1, maxDepth));
        const size = Math.max(
            6,
            Math.min(28, Math.floor(colW) - 2, Math.floor(levelH) - 2)
        );
        const half = size / 2;
        const px = (u: number): number =>
            Math.round(PAD + (rank[u] + 0.5) * colW);
        const py = (u: number): number =>
            Math.round(top + half + depth[u] * levelH);
        const shown = Math.ceil(count * reveal);

        const hot = (u: number): boolean =>
            !finished && (u === state.focus || u === state.other);

        // Edges.
        order.forEach((u) => {
            if (rank[u] >= shown) return;
            for (const c of [left[u], right[u]]) {
                if (c === NIL || rank[c] >= shown) continue;
                const lit = hot(u) && hot(c);
                ctx.fillStyle = lit ? select : edge;
                pixelLine(ctx, px(u), py(u), px(c), py(c), lit ? 3 : 2);
            }
        });

        // Nodes.
        const h = (u: number): number => (u === NIL ? 0 : tag[u]);
        order.forEach((u) => {
            if (rank[u] >= shown) return;
            const cx = px(u);
            const cy = py(u);
            let fill = idleNode;
            let text = fg;
            if (tagKind === "color") {
                fill = tag[u] === RED ? red : "#14100d";
                text = tag[u] === RED ? DARK : fg;
            }
            if (!finished) {
                const isFocus = u === state.focus;
                const isOther = u === state.other;
                if (state.type === "compare" && isFocus) fill = check;
                if (state.type === "insert" && isFocus) fill = inserted;
                if (state.type === "rotate" && isFocus) fill = swap;
                if (state.type === "rotate" && isOther) fill = select;
                if (state.type === "swap" && (isFocus || isOther)) fill = swap;
                if (state.type === "compare" && isOther) fill = select;
                if (fill !== idleNode && fill !== "#14100d" && fill !== red)
                    text = DARK;
                if (state.type === "recolor" && (isFocus || isOther)) {
                    ctx.fillStyle = select;
                    ctx.fillRect(
                        cx - half - 3,
                        cy - half - 3,
                        size + 6,
                        size + 6
                    );
                }
            }
            if (fill === "#14100d") {
                ctx.fillStyle = ink;
                ctx.fillRect(cx - half - 1, cy - half - 1, size + 2, size + 2);
            }
            ctx.fillStyle = fill;
            ctx.fillRect(cx - half, cy - half, size, size);
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.fillRect(cx - half, cy - half, size, 2);
            if (size >= 14) {
                ctx.fillStyle = text;
                ctx.font = `bold ${Math.max(9, Math.floor(size * 0.5))}px ui-monospace, monospace`;
                ctx.fillText(String(keys[u]), cx, cy + 1);
            }
            // Balance factor (AVL) or priority (treap) badge.
            if (
                size >= 16 &&
                (tagKind === "height" || tagKind === "priority")
            ) {
                const value =
                    tagKind === "height" ? h(left[u]) - h(right[u]) : tag[u];
                const label =
                    value > 0 && tagKind === "height"
                        ? `+${value}`
                        : String(value);
                ctx.font = "bold 9px ui-monospace, monospace";
                const w = Math.ceil(ctx.measureText(label).width) + 4;
                ctx.fillStyle = DARK;
                ctx.fillRect(cx + half - 3, cy - half - 7, w, 10);
                ctx.fillStyle =
                    tagKind === "height" && Math.abs(value) > 1 ? red : ink;
                ctx.fillText(label, cx + half - 3 + w / 2, cy - half - 1);
            }
        });

        // The key on its way down floats beside the node it is compared with.
        if (
            state.type === "compare" &&
            state.focus !== NIL &&
            state.other === NIL &&
            state.keyIndex < n
        ) {
            const t = Math.max(14, size);
            const fx = px(state.focus) - half - t - 4;
            const fy = py(state.focus) - half - t / 2;
            ctx.fillStyle = select;
            ctx.fillRect(fx, fy, t, t);
            ctx.fillStyle = DARK;
            ctx.font = `bold ${Math.max(9, Math.floor(t * 0.5))}px ui-monospace, monospace`;
            ctx.fillText(
                String(all[state.keyIndex]),
                fx + t / 2,
                fy + t / 2 + 1
            );
        }
    },
});
