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
import { pixelLine } from "./runtime/pixelLine";

/*
 * Graphs: square pixel nodes joined by stepped pixel lines. Edges change
 * colour as they are considered, taken into the tree or dropped (dotted);
 * the edge in focus is drawn thick. Each node carries its letter, and a
 * small tag with its label (distance, hops, order…) once it has one.
 */

const DARK = "#1d110b";
const PAD = 30;

/* "Relax D–H (7): H is now 12 away". */
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

        const idleEdge = color("path-wall", "#6b5f50");
        const seen = color("check", "#f5cd4e");
        const tree = color("path", "#5fd6c6");
        const reject = color("check-false", "#ff7a68");
        const frontier = color("frontier", "#f5cd4e");
        const done = color("visit", "#f08a5d");
        const current = color("current", "#ee8fd0");
        const idleNode = color("default", "#7a6c5a");
        const ink = color("label", "#d4cab9");
        const fg = color("fg", "#f4ede0");
        const tagBg = color("path-empty", "#2b251f");

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

        // Edges.
        const focusColor =
            state.type === "take"
                ? tree
                : state.type === "reject"
                  ? reject
                  : state.type === "relax"
                    ? frontier
                    : seen;
        edges.forEach(({ a, b, w }, e) => {
            if (a >= shownNodes || b >= shownNodes) return;
            const value = state.edges[e];
            const focus = !finished && state.edge === e;
            const t = focus || value === EDGE_TREE ? 4 : 2;
            ctx.fillStyle = focus
                ? focusColor
                : value === EDGE_TREE
                  ? tree
                  : value === EDGE_SEEN
                    ? seen
                    : value === EDGE_REJECT
                      ? reject
                      : idleEdge;
            ctx.globalAlpha = value === EDGE_REJECT && !focus ? 0.5 : 1;
            const A = at[a];
            const B = at[b];
            pixelLine(
                ctx,
                A.x,
                A.y,
                B.x,
                B.y,
                t,
                value === EDGE_REJECT && !focus
            );
            ctx.globalAlpha = 1;

            // Arrowhead (directed graphs): a pixel chevron near b.
            if (state.directed) {
                const len = Math.hypot(B.x - A.x, B.y - A.y) || 1;
                const ux = (B.x - A.x) / len;
                const uy = (B.y - A.y) / len;
                const tipX = B.x - ux * (half + 4);
                const tipY = B.y - uy * (half + 4);
                for (let k = 0; k < 4; k += 1) {
                    for (const side of [-1, 1]) {
                        const x = tipX - ux * k * 2 + -uy * side * k * 2;
                        const y = tipY - uy * k * 2 + ux * side * k * 2;
                        ctx.fillRect(
                            Math.round(x) - 1,
                            Math.round(y) - 1,
                            3,
                            3
                        );
                    }
                }
            }

            // Weight tag at the midpoint.
            if (algorithm.edgeList.length && size >= 16) {
                const mx = Math.round((A.x + B.x) / 2);
                const my = Math.round((A.y + B.y) / 2);
                ctx.fillStyle = value === EDGE_TREE ? tree : tagBg;
                ctx.fillRect(mx - 7, my - 6, 14, 12);
                ctx.fillStyle = value === EDGE_TREE ? DARK : ink;
                ctx.font = "bold 10px ui-monospace, monospace";
                ctx.fillText(String(w), mx, my + 1);
            }
        });

        // Nodes.
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
            if (isCurrent) {
                ctx.fillStyle = fg;
                ctx.fillRect(x - half - 3, y - half - 3, size + 6, size + 6);
                ctx.fillStyle = DARK;
                ctx.fillRect(x - half - 1, y - half - 1, size + 2, size + 2);
            }
            ctx.fillStyle = fill;
            ctx.fillRect(x - half, y - half, size, size);
            ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
            ctx.fillRect(x - half, y - half, size, 2);
            ctx.fillStyle = fill === idleNode ? fg : DARK;
            ctx.font = `bold ${Math.max(10, Math.floor(size * 0.5))}px ui-monospace, monospace`;
            ctx.fillText(nodeName(i), x, y + 1);

            const label = state.labels[i];
            if (!Number.isNaN(label)) {
                const text = label === Infinity ? "∞" : String(label);
                ctx.font = "bold 10px ui-monospace, monospace";
                const w = Math.max(
                    12,
                    Math.ceil(ctx.measureText(text).width) + 6
                );
                const tx = x + half - 2;
                const ty = y - half - 8;
                ctx.fillStyle = DARK;
                ctx.fillRect(tx, ty, w, 12);
                ctx.fillStyle = fill === idleNode ? ink : fill;
                ctx.fillText(text, tx + w / 2, ty + 7);
            }
        }
    },
});
