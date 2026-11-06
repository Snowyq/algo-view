import {
    EDGE_REJECT,
    EDGE_SEEN,
    EDGE_TREE,
    type GraphAlgorithm,
    NODE_DONE,
    NODE_FRONTIER,
} from "../algorithms/graph/GraphAlgorithm";
import { type GraphInput, nodeName } from "../utils/graphInput";
import { createCanvasWorker, type DescribeApi } from "./runtime/canvasWorker";
import {
    DARK,
    focusRing,
    highlight,
    LIT_SOFT,
    monoFont,
    pixelLine,
} from "./runtime/draw";

/*
 * Graphs: square nodes joined by stepped lines. Edges change colour as they
 * are checked, taken or dropped (dotted); the edge in focus is drawn thick.
 * Nodes carry their letter and, once set, a tag with their label.
 */

const PAD = 30;

type Point = { x: number; y: number };

/* Pixel chevron pointing at b, just outside the node. */
function arrowhead(
    ctx: OffscreenCanvasRenderingContext2D,
    A: Point,
    B: Point,
    half: number
): void {
    const len = Math.hypot(B.x - A.x, B.y - A.y) || 1;
    const ux = (B.x - A.x) / len;
    const uy = (B.y - A.y) / len;
    const tipX = B.x - ux * (half + 4);
    const tipY = B.y - uy * (half + 4);
    for (let k = 0; k < 4; k += 1) {
        for (const side of [-1, 1]) {
            const x = tipX - ux * k * 2 + -uy * side * k * 2;
            const y = tipY - uy * k * 2 + ux * side * k * 2;
            ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
        }
    }
}

function describeGraph({
    algorithm,
    input,
    step,
}: DescribeApi<GraphInput, GraphAlgorithm>): string {
    const state = algorithm.getStateByStepsIndex(step);
    const edge = state.edge >= 0 ? input.edges[state.edge] : undefined;
    const pair = edge
        ? `${nodeName(edge.a)}–${nodeName(edge.b)} (${edge.w})`
        : "";
    const node = state.node >= 0 ? nodeName(state.node) : "";
    const label =
        state.node >= 0 && !Number.isNaN(state.labels[state.node])
            ? state.labels[state.node]
            : null;
    switch (state.type) {
        case "initial":
            return `${input.nodes.length} nodes, ${input.edges.length} edges. Start at A.`;
        case "check":
            return `Consider edge ${pair}.`;
        case "take":
            return edge
                ? `Take ${pair}${node ? `: ${node} joins` : ""}.`
                : node
                  ? `Settle ${node}.`
                  : "All distances are final.";
        case "reject":
            return `Drop ${pair}: not useful.`;
        case "relax":
            return `Shorter way to ${node} via ${pair}${label !== null ? `: ${label}` : ""}.`;
        case "visit":
            return node
                ? `Visit ${node}${label !== null ? ` (${label})` : ""}.`
                : "Next round.";
        case "finish":
            return `Done: tree weight ${algorithm.getMetrics().weight?.count ?? 0}.`;
        default:
            return "";
    }
}

createCanvasWorker<GraphInput, GraphAlgorithm>({
    category: "graph",
    describe: describeGraph,
    draw: ({ ctx, width, height, color, algorithm, input, step, reveal }) => {
        const state = algorithm.getStateByStepsIndex(step);
        const { nodes, edges } = input;
        const n = nodes.length;

        const idleEdge = color("path-wall");
        const seen = color("check");
        const tree = color("path");
        const reject = color("check-false");
        const frontier = color("frontier");
        const done = color("visit", "#f08a5d");
        const current = color("current");
        const idleNode = color("default");
        const ink = color("label", "#d4cab9");
        const fg = color("fg");
        const tagBg = color("path-empty");

        const size = Math.max(
            16,
            Math.min(
                28,
                Math.round(Math.min(width, height) / (Math.sqrt(n) * 3))
            )
        );
        const half = Math.floor(size / 2);
        const at = nodes.map((p) => ({
            x: Math.round(PAD + p.x * (width - PAD * 2)),
            y: Math.round(PAD + p.y * (height - PAD * 2)),
        }));
        const shownNodes = Math.ceil(n * reveal);
        const finished = state.type === "finish";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const focusColor =
            state.type === "take"
                ? tree
                : state.type === "reject"
                  ? reject
                  : state.type === "relax"
                    ? frontier
                    : seen;
        const edgeColor = (value: number): string =>
            value === EDGE_TREE
                ? tree
                : value === EDGE_SEEN
                  ? seen
                  : value === EDGE_REJECT
                    ? reject
                    : idleEdge;

        edges.forEach(({ a, b, w }, e) => {
            if (a >= shownNodes || b >= shownNodes) return;
            const value = state.edges[e];
            const focus = !finished && state.edge === e;
            const dropped = value === EDGE_REJECT && !focus;
            const A = at[a];
            const B = at[b];
            ctx.fillStyle = focus ? focusColor : edgeColor(value);
            ctx.globalAlpha = dropped ? 0.5 : 1;
            const t = focus || value === EDGE_TREE ? 4 : 2;
            pixelLine(ctx, A.x, A.y, B.x, B.y, t, dropped);
            ctx.globalAlpha = 1;
            if (state.directed) arrowhead(ctx, A, B, half);

            // Weight tag at the midpoint.
            if (algorithm.edgeList.length && size >= 16) {
                const mx = Math.round((A.x + B.x) / 2);
                const my = Math.round((A.y + B.y) / 2);
                ctx.fillStyle = value === EDGE_TREE ? tree : tagBg;
                ctx.fillRect(mx - 7, my - 6, 14, 12);
                ctx.fillStyle = value === EDGE_TREE ? DARK : ink;
                ctx.font = monoFont(10);
                ctx.fillText(String(w), mx, my + 1);
            }
        });

        const labelTag = (
            x: number,
            y: number,
            label: number,
            fill: string
        ) => {
            const text = label === Infinity ? "∞" : String(label);
            ctx.font = monoFont(10);
            const w = Math.max(12, Math.ceil(ctx.measureText(text).width) + 6);
            const tx = x + half - 2;
            const ty = y - half - 8;
            ctx.fillStyle = DARK;
            ctx.fillRect(tx, ty, w, 12);
            ctx.fillStyle = fill === idleNode ? ink : fill;
            ctx.fillText(text, tx + w / 2, ty + 7);
        };

        for (let i = 0; i < shownNodes; i += 1) {
            const { x, y } = at[i];
            const value = state.nodes[i];
            const isCurrent = !finished && state.node === i;
            const fill = isCurrent
                ? current
                : value === NODE_DONE
                  ? done
                  : value === NODE_FRONTIER
                    ? frontier
                    : idleNode;
            if (isCurrent) focusRing(ctx, x - half, y - half, size, fg);
            ctx.fillStyle = fill;
            ctx.fillRect(x - half, y - half, size, size);
            highlight(ctx, x - half, y - half, size, 2, LIT_SOFT);
            ctx.fillStyle = fill === idleNode ? fg : DARK;
            ctx.font = monoFont(Math.max(10, Math.floor(size * 0.5)));
            ctx.fillText(nodeName(i), x, y + 1);
            const label = state.labels[i];
            if (!Number.isNaN(label)) labelTag(x, y, label, fill);
        }
    },
});
