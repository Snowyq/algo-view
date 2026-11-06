import { DisjointSet } from "../../utils/disjointSet";
import type { AlgorithmInstructions } from "../types";
import {
    EDGE_REJECT,
    EDGE_SEEN,
    EDGE_TREE,
    GraphAlgorithm,
    NODE_DONE,
} from "./GraphAlgorithm";

// Takes edges from the lightest up, keeping each one that joins two pieces.
// Union-find answers "same piece?" in near O(1).
export class Kruskal extends GraphAlgorithm {
    protected run(): void {
        const n = this.nodeCount;
        const order = this.edgeList
            .map((_, i) => i)
            .sort((p, q) => this.edgeList[p].w - this.edgeList[q].w || p - q);
        const sets = new DisjointSet(n);
        let taken = 0;
        for (const edge of order) {
            if (taken === n - 1) break;
            const { a, b, w } = this.edgeList[edge];
            this.count("checks");
            this.setEdge(edge, EDGE_SEEN);
            this.emit("check", -1, edge, { instructionId: ["k1"] });
            if (sets.union(a, b)) {
                taken += 1;
                this.count("updates");
                this.count("weight", w);
                this.setEdge(edge, EDGE_TREE);
                this.setNode(a, NODE_DONE);
                this.setNode(b, NODE_DONE);
                this.emit("take", b, edge, { instructionId: ["k2"] });
            } else {
                this.setEdge(edge, EDGE_REJECT);
                this.emit("reject", -1, edge, { instructionId: ["k3"] });
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            k0: { line: "sort edges by weight;", indent: 0 },
            k1: { line: "for (const [a, b] of edges) {", indent: 0 },
            k2: { line: "if (find(a) !== find(b)) union(a, b);", indent: 1 },
            k3: { line: "else skip: it would close a cycle;", indent: 1 },
            ke: { line: "}", indent: 0 },
        };
    }
}
