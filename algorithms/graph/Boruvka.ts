import { DisjointSet } from "../../utils/disjointSet";
import type { AlgorithmInstructions } from "../types";
import {
    EDGE_IDLE,
    EDGE_REJECT,
    EDGE_SEEN,
    EDGE_TREE,
    GraphAlgorithm,
    NODE_DONE,
} from "./GraphAlgorithm";

// Every piece picks its cheapest outgoing edge at once, then pieces merge.
// At most log n rounds, and easy to parallelise.
export class Boruvka extends GraphAlgorithm {
    protected run(): void {
        const n = this.nodeCount;
        const sets = new DisjointSet(n);
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
                const state = this.edgeAt(edge);
                if (state === EDGE_TREE || state === EDGE_REJECT) return;
                const [ra, rb] = [sets.find(a), sets.find(b)];
                if (ra === rb) {
                    this.setEdge(edge, EDGE_REJECT);
                    this.emit("reject", -1, edge, { instructionId: ["b3"] });
                    return;
                }
                this.count("checks");
                if (state === EDGE_IDLE) this.setEdge(edge, EDGE_SEEN);
                if (better(edge, cheapest[ra])) cheapest[ra] = edge;
                if (better(edge, cheapest[rb])) cheapest[rb] = edge;
                this.emit("check", -1, edge, { instructionId: ["b1"] });
            });
            let merged = 0;
            cheapest.forEach((edge) => {
                if (edge < 0) return;
                const { a, b, w } = this.edgeList[edge];
                if (!sets.union(a, b)) return;
                pieces -= 1;
                merged += 1;
                this.count("updates");
                this.count("weight", w);
                this.setEdge(edge, EDGE_TREE);
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
