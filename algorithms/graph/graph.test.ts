import { describe, expect, it } from "vitest";
import { DisjointSet } from "../../utils/disjointSet";
import {
    GRAPH_PRESETS,
    generateGraphInput,
    type GraphInput,
} from "../../utils/graphInput";
import { BellmanFord } from "./BellmanFord";
import { Boruvka } from "./Boruvka";
import { EDGE_TREE, type GraphAlgorithm, NODE_DONE } from "./GraphAlgorithm";
import { GraphBfs } from "./GraphBfs";
import { GraphDfs } from "./GraphDfs";
import { GraphDijkstra } from "./GraphDijkstra";
import { Kruskal } from "./Kruskal";
import { Prim } from "./Prim";
import { TopologicalSort } from "./TopologicalSort";

type GraphClass = new (input: GraphInput) => GraphAlgorithm;

const finalState = (Class: GraphClass, input: GraphInput) => {
    const algo = new Class(input);
    return {
        ...algo.getStateByStepsIndex(algo.getStepsLength() - 1),
        weight: algo.getMetrics().weight.count,
    };
};

/** Sum of the cheapest spanning tree, by brute force over sorted edges. */
function mstWeight({ nodes, edges }: GraphInput): number {
    const sets = new DisjointSet(nodes.length);
    return edges
        .slice()
        .sort((p, q) => p.w - q.w)
        .reduce((sum, { a, b, w }) => (sets.union(a, b) ? sum + w : sum), 0);
}

/** Floyd–Warshall distances from node 0. */
function distancesFromA({ nodes, edges }: GraphInput): number[] {
    const n = nodes.length;
    const d = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity))
    );
    edges.forEach(({ a, b, w }) => {
        d[a][b] = Math.min(d[a][b], w);
        d[b][a] = Math.min(d[b][a], w);
    });
    for (let k = 0; k < n; k += 1)
        for (let i = 0; i < n; i += 1)
            for (let j = 0; j < n; j += 1)
                d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
    return d[0];
}

function hopsFromA({ nodes, edges }: GraphInput): number[] {
    const hops = new Array<number>(nodes.length).fill(-1);
    hops[0] = 0;
    const queue = [0];
    for (let k = 0; k < queue.length; k += 1) {
        for (const { a, b } of edges) {
            const u = queue[k];
            const v = a === u ? b : b === u ? a : -1;
            if (v === -1 || hops[v] !== -1) continue;
            hops[v] = hops[u] + 1;
            queue.push(v);
        }
    }
    return hops;
}

const graphs = GRAPH_PRESETS.flatMap((preset) =>
    [6, 12, 24].flatMap((nodes) =>
        [1, 2].map((seed) => ({
            name: `${preset}, ${nodes} nodes, seed ${seed}`,
            input: generateGraphInput({ preset, nodes, seed }),
        }))
    )
);

const MST: Array<[string, GraphClass]> = [
    ["Kruskal", Kruskal],
    ["Prim", Prim],
    ["Borůvka", Boruvka],
];

describe("graph algorithms", () => {
    describe.each(MST)("%s", (_, Class) => {
        it.each(graphs)(
            "builds a minimum spanning tree ($name)",
            ({ input }) => {
                const { weight, edges } = finalState(Class, input);
                const treeEdges = Array.from(edges).filter(
                    (e) => e === EDGE_TREE
                );
                expect(weight).toBe(mstWeight(input));
                expect(treeEdges).toHaveLength(input.nodes.length - 1);
            }
        );
    });

    it.each(graphs)("Kruskal, Prim and Borůvka agree ($name)", ({ input }) => {
        const weights = MST.map(([, Class]) => finalState(Class, input).weight);
        expect(new Set(weights).size).toBe(1);
    });

    it.each(graphs)(
        "Dijkstra and Bellman-Ford agree on distances ($name)",
        ({ input }) => {
            const expected = distancesFromA(input);
            const dijkstra = finalState(GraphDijkstra, input);
            const bellman = finalState(BellmanFord, input);
            expect(Array.from(dijkstra.labels)).toEqual(expected);
            expect(Array.from(bellman.labels)).toEqual(expected);
            expect(dijkstra.nodes.every((n) => n === NODE_DONE)).toBe(true);
        }
    );

    it.each(graphs)("BFS labels hop counts ($name)", ({ input }) => {
        expect(Array.from(finalState(GraphBfs, input).labels)).toEqual(
            hopsFromA(input)
        );
    });

    it.each(graphs)("DFS discovers every node once ($name)", ({ input }) => {
        const { labels, weight } = finalState(GraphDfs, input);
        const order = Array.from(labels).sort((a, b) => a - b);
        expect(order).toEqual(input.nodes.map((_, i) => i + 1));
        expect(weight).toBeGreaterThan(0);
    });

    it.each(graphs)(
        "topological order puts every edge's tail first ($name)",
        ({ input }) => {
            const { labels } = finalState(TopologicalSort, input);
            for (const { a, b } of input.edges) {
                expect(labels[a]).toBeLessThan(labels[b]);
            }
            expect(Array.from(labels).sort((x, y) => x - y)).toEqual(
                input.nodes.map((_, i) => i + 1)
            );
        }
    );

    it("Dijkstra handles a hand-made graph", () => {
        const input: GraphInput = {
            nodes: [0, 1, 2, 3].map((x) => ({ x, y: 0 })),
            edges: [
                { a: 0, b: 1, w: 4 },
                { a: 0, b: 2, w: 1 },
                { a: 2, b: 1, w: 2 },
                { a: 1, b: 3, w: 5 },
            ],
        };
        expect(Array.from(finalState(GraphDijkstra, input).labels)).toEqual([
            0, 3, 1, 8,
        ]);
    });
});
