import { MinHeap } from "../../utils/minHeap";
import type { AlgorithmInstructions } from "../types";
import {
    EDGE_REJECT,
    EDGE_SEEN,
    EDGE_TREE,
    GraphAlgorithm,
    NODE_DONE,
    NODE_FRONTIER,
} from "./GraphAlgorithm";

// Grows one tree from A, always adding the cheapest edge to a new node.
// Labels show each waiting node's cheapest known link.
export class Prim extends GraphAlgorithm {
    protected run(): void {
        const n = this.nodeCount;
        const inTree = new Uint8Array(n);
        const key = new Array<number>(n).fill(Infinity);
        const best = new Array<number>(n).fill(-1);
        const heap = new MinHeap();
        const expand = (u: number): void => {
            for (const { to, edge, w } of this.adjacency[u]) {
                if (inTree[to]) continue;
                this.count("checks");
                if (w < key[to]) {
                    if (best[to] >= 0) this.setEdge(best[to], EDGE_REJECT);
                    key[to] = w;
                    best[to] = edge;
                    heap.push(w, to, edge);
                    this.count("updates");
                    this.setEdge(edge, EDGE_SEEN);
                    this.setNode(to, NODE_FRONTIER);
                    this.setLabel(to, w);
                    this.emit("relax", to, edge, { instructionId: ["p2"] });
                } else {
                    this.setEdge(edge, EDGE_REJECT);
                    this.emit("reject", to, edge, { instructionId: ["p3"] });
                }
            }
        };
        inTree[0] = 1;
        this.setNode(0, NODE_DONE);
        this.emit("visit", 0, -1, { instructionId: ["p0"] });
        expand(0);
        while (heap.size > 0) {
            const u = heap.pop()!;
            if (inTree[u]) continue;
            inTree[u] = 1;
            this.count("weight", key[u]);
            this.setEdge(best[u], EDGE_TREE);
            this.setNode(u, NODE_DONE);
            this.emit("take", u, best[u], { instructionId: ["p1"] });
            expand(u);
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            p0: { line: "tree = { A };", indent: 0 },
            p1: { line: "add the cheapest edge leaving the tree;", indent: 0 },
            p2: { line: "if (w < key[v]) key[v] = w;", indent: 1 },
            p3: { line: "else drop the edge;", indent: 1 },
        };
    }
}
