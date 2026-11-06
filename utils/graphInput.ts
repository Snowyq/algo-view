import { DisjointSet } from "./disjointSet";
import { createRng, randomInt, type Rng } from "./randoms";
import { clamp, isOneOf } from "./values";

/*
 * Graph input: evenly spread nodes joined by planar weighted edges. The
 * Euclidean MST goes in first so the graph is connected; shorter
 * non-crossing edges are added until the preset's density is reached.
 */

export const GRAPH_PRESETS = ["sparse", "dense", "grid"] as const;
export type GraphPreset = (typeof GRAPH_PRESETS)[number];

export type GraphConfig = { preset: GraphPreset; nodes: number; seed: number };
export type GraphNode = { x: number; y: number };
export type GraphEdge = { a: number; b: number; w: number };
export type GraphInput = { nodes: GraphNode[]; edges: GraphEdge[] };

export const GRAPH_MIN_NODES = 6;
export const GRAPH_MAX_NODES = 24;
export const GRAPH_DEFAULT_NODES = 12;

/** Panels are wider than tall; distances are measured in that space. */
const ASPECT = 1.4;
const MAX_WEIGHT = 9;

export function isGraphPreset(value: unknown): value is GraphPreset {
    return isOneOf(GRAPH_PRESETS, value);
}

export function nodeName(index: number): string {
    return index < 26
        ? String.fromCharCode(65 + index)
        : `${String.fromCharCode(65 + (index % 26))}${Math.floor(index / 26)}`;
}

function crosses(
    p: GraphNode,
    q: GraphNode,
    r: GraphNode,
    s: GraphNode
): boolean {
    const turn = (a: GraphNode, b: GraphNode, c: GraphNode): number =>
        Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
    return (
        turn(p, q, r) * turn(p, q, s) < 0 && turn(r, s, p) * turn(r, s, q) < 0
    );
}

function gridGraph(n: number, weight: () => number): GraphInput {
    const cols = Math.max(2, Math.round(Math.sqrt(n * ASPECT)));
    const rows = Math.ceil(n / cols);
    const nodes: GraphNode[] = [];
    for (let i = 0; i < n; i += 1) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        nodes.push({
            x: cols === 1 ? 0.5 : c / (cols - 1),
            y: rows === 1 ? 0.5 : r / (rows - 1),
        });
    }
    const edges: GraphEdge[] = [];
    for (let i = 0; i < n; i += 1) {
        const c = i % cols;
        if (c + 1 < cols && i + 1 < n)
            edges.push({ a: i, b: i + 1, w: weight() });
        if (i + cols < n) edges.push({ a: i, b: i + cols, w: weight() });
    }
    return { nodes, edges };
}

/** Mitchell's best candidate: even spread that does not look like a grid. */
function spreadNodes(rng: Rng, n: number): GraphNode[] {
    const nodes: GraphNode[] = [{ x: rng(), y: rng() }];
    const gap = (p: GraphNode): number =>
        Math.min(
            ...nodes.map((q) => Math.hypot((p.x - q.x) * ASPECT, p.y - q.y))
        );
    while (nodes.length < n) {
        let best: GraphNode = { x: rng(), y: rng() };
        let bestGap = gap(best);
        for (let k = 0; k < 12; k += 1) {
            const candidate = { x: rng(), y: rng() };
            const candidateGap = gap(candidate);
            if (candidateGap > bestGap) {
                best = candidate;
                bestGap = candidateGap;
            }
        }
        nodes.push(best);
    }
    stretchToFrame(nodes);
    return nodes;
}

function stretchToFrame(nodes: GraphNode[]): void {
    const xs = nodes.map((p) => p.x);
    const ys = nodes.map((p) => p.y);
    const [x0, x1, y0, y1] = [
        Math.min(...xs),
        Math.max(...xs),
        Math.min(...ys),
        Math.max(...ys),
    ];
    nodes.forEach((p) => {
        p.x = (p.x - x0) / Math.max(1e-6, x1 - x0);
        p.y = (p.y - y0) / Math.max(1e-6, y1 - y0);
    });
}

/** All node pairs, shortest first. */
function pairsByLength(nodes: GraphNode[]): Array<[number, number]> {
    const pairs: Array<[number, number, number]> = [];
    for (let a = 0; a < nodes.length; a += 1) {
        for (let b = a + 1; b < nodes.length; b += 1) {
            const dx = (nodes[a].x - nodes[b].x) * ASPECT;
            const dy = nodes[a].y - nodes[b].y;
            pairs.push([a, b, dx * dx + dy * dy]);
        }
    }
    pairs.sort((p, q) => p[2] - q[2]);
    return pairs.map(([a, b]) => [a, b]);
}

function planarEdges(
    nodes: GraphNode[],
    target: number,
    weight: () => number
): GraphEdge[] {
    const pairs = pairsByLength(nodes);
    const edges: GraphEdge[] = [];
    const chosen = new Set<number>();
    const sets = new DisjointSet(nodes.length);
    pairs.forEach(([a, b], k) => {
        if (!sets.union(a, b)) return;
        chosen.add(k);
        edges.push({ a, b, w: weight() });
    });
    for (let k = 0; k < pairs.length && edges.length < target; k += 1) {
        if (chosen.has(k)) continue;
        const [a, b] = pairs[k];
        const blocked = edges.some(
            (e) =>
                e.a !== a &&
                e.a !== b &&
                e.b !== a &&
                e.b !== b &&
                crosses(nodes[a], nodes[b], nodes[e.a], nodes[e.b])
        );
        if (!blocked) edges.push({ a, b, w: weight() });
    }
    return edges;
}

/** Renumber so node 0 is the leftmost (then topmost) one. */
function sortLeftToRight({ nodes, edges }: GraphInput): GraphInput {
    const order = nodes
        .map((p, i) => i)
        .sort((i, j) => nodes[i].x - nodes[j].x || nodes[i].y - nodes[j].y);
    const rank = new Array<number>(nodes.length);
    order.forEach((old, next) => (rank[old] = next));
    return {
        nodes: order.map((i) => nodes[i]),
        edges: edges.map(({ a, b, w }) => {
            const [ra, rb] = [rank[a], rank[b]];
            return ra < rb ? { a: ra, b: rb, w } : { a: rb, b: ra, w };
        }),
    };
}

export function generateGraphInput({
    preset,
    nodes: count,
    seed,
}: GraphConfig): GraphInput {
    const rng = createRng(seed);
    const n = clamp(count, GRAPH_MIN_NODES, GRAPH_MAX_NODES);
    const weight = (): number => 1 + randomInt(rng, MAX_WEIGHT);

    if (preset === "grid") return sortLeftToRight(gridGraph(n, weight));

    const nodes = spreadNodes(rng, n);
    const target = Math.round(n * (preset === "dense" ? 2.2 : 1.35));
    return sortLeftToRight({
        nodes,
        edges: planarEdges(nodes, target, weight),
    });
}
