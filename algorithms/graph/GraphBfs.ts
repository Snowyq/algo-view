import type { AlgorithmInstructions } from "../types";
import {
    EDGE_IDLE,
    EDGE_REJECT,
    EDGE_TREE,
    GraphAlgorithm,
    NODE_DONE,
    NODE_FRONTIER,
} from "./GraphAlgorithm";

// Visits nodes ring by ring from A, ignoring weights. Labels are hop counts;
// the tree has the fewest edges, not the least weight.
export class GraphBfs extends GraphAlgorithm {
    protected run(): void {
        const seen = new Uint8Array(this.nodeCount);
        const queue = [0];
        const hops = new Array<number>(this.nodeCount).fill(0);
        seen[0] = 1;
        this.setNode(0, NODE_FRONTIER);
        this.setLabel(0, 0);
        this.emit("visit", 0, -1, { instructionId: ["q0"] });
        while (queue.length) {
            const u = queue.shift()!;
            this.setNode(u, NODE_DONE);
            this.emit("visit", u, -1, { instructionId: ["q1"] });
            for (const { to, edge, w } of this.adjacency[u]) {
                if (this.edgeAt(edge) !== EDGE_IDLE) continue;
                this.count("checks");
                if (!seen[to]) {
                    seen[to] = 1;
                    hops[to] = hops[u] + 1;
                    queue.push(to);
                    this.count("updates");
                    this.count("weight", w);
                    this.setEdge(edge, EDGE_TREE);
                    this.setNode(to, NODE_FRONTIER);
                    this.setLabel(to, hops[to]);
                    this.emit("take", to, edge, { instructionId: ["q2"] });
                } else {
                    this.setEdge(edge, EDGE_REJECT);
                    this.emit("reject", to, edge, { instructionId: ["q3"] });
                }
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            q0: { line: "queue = [A];", indent: 0 },
            q1: { line: "u = queue.shift();", indent: 0 },
            q2: { line: "if (!seen[v]) queue.push(v);", indent: 1 },
            q3: { line: "else skip: already queued;", indent: 1 },
        };
    }
}
