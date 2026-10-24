import type { AlgorithmInstructions } from "../types";
import {
    EDGE_IDLE,
    EDGE_REJECT,
    EDGE_SEEN,
    EDGE_TREE,
    GraphAlgorithm,
    NODE_DONE,
} from "./GraphAlgorithm";

/* Every piece picks its cheapest outgoing edge, all at once; pieces
   merge and the round repeats. At most log n rounds, easy to parallelise. */
export class Boruvka extends GraphAlgorithm {
    protected run(): void {
        const n = this.nodeCount;
        const parent = Array.from({ length: n }, (_, i) => i);
        const find = (i: number): number =>
            parent[i] === i ? i : (parent[i] = find(parent[i]));
        const state = new Uint8Array(this.edgeList.length);
        const mark = (edge: number, value: number): void => {
            state[edge] = value;
            this.setEdge(edge, value);
        };
        let pieces = n;
        while (pieces > 1) {
            this.emit("visit", -1, -1, { instructionId: ["b0"] });
            const cheapest = new Array<number>(n).fill(-1);
            const better = (edge: number, than: number): boolean =>
                than < 0 ||
                this.edgeList[edge].w < this.edgeList[than].w ||
                (this.edgeList[edge].w === this.edgeList[than].w &&
                    edge < than);
            this.edgeList.forEach(({ a, b }, edge) => {
                if (state[edge] === EDGE_TREE || state[edge] === EDGE_REJECT)
                    return;
                const [ra, rb] = [find(a), find(b)];
                if (ra === rb) {
                    mark(edge, EDGE_REJECT);
                    this.emit("reject", -1, edge, { instructionId: ["b3"] });
                    return;
                }
                this.count("checks");
                if (state[edge] === EDGE_IDLE) mark(edge, EDGE_SEEN);
                if (better(edge, cheapest[ra])) cheapest[ra] = edge;
                if (better(edge, cheapest[rb])) cheapest[rb] = edge;
                this.emit("check", -1, edge, { instructionId: ["b1"] });
            });
            let merged = 0;
            cheapest.forEach((edge) => {
                if (edge < 0) return;
                const { a, b, w } = this.edgeList[edge];
                const [ra, rb] = [find(a), find(b)];
                if (ra === rb) return;
                parent[ra] = rb;
                pieces -= 1;
                merged += 1;
                this.count("updates");
                this.count("weight", w);
                mark(edge, EDGE_TREE);
                this.setNode(a, NODE_DONE);
                this.setNode(b, NODE_DONE);
                this.emit("take", b, edge, { instructionId: ["b2"] });
            });
            if (merged === 0) break;
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            b0: { line: "while (pieces > 1) {", indent: 0 },
            b1: { line: "each piece: remember its cheapest exit;", indent: 1 },
            b2: { line: "add all those edges, merge pieces;", indent: 1 },
            b3: { line: "drop edges inside a piece;", indent: 1 },
            be: { line: "}", indent: 0 },
        };
    }
}
