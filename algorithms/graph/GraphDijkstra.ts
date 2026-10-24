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

/* Settles nodes in order of distance from A; each settled node relaxes
   its edges. Labels are the best known distances. */
export class GraphDijkstra extends GraphAlgorithm {
    protected run(): void {
        const n = this.nodeCount;
        const dist = new Array<number>(n).fill(Infinity);
        const via = new Array<number>(n).fill(-1);
        const done = new Uint8Array(n);
        const heap = new MinHeap();
        dist[0] = 0;
        heap.push(0, 0);
        this.setLabel(0, 0);
        this.setNode(0, NODE_FRONTIER);
        this.emit("visit", 0, -1, { instructionId: ["d0"] });
        while (heap.size > 0) {
            const u = heap.pop()!;
            if (done[u]) continue;
            done[u] = 1;
            this.setNode(u, NODE_DONE);
            if (via[u] >= 0) {
                this.setEdge(via[u], EDGE_TREE);
                this.count("weight", this.edgeList[via[u]].w);
            }
            this.emit("take", u, via[u], { instructionId: ["d1"] });
            for (const { to, edge, w } of this.adjacency[u]) {
                if (done[to]) continue;
                this.count("checks");
                if (dist[u] + w < dist[to]) {
                    if (via[to] >= 0) this.setEdge(via[to], EDGE_REJECT);
                    dist[to] = dist[u] + w;
                    via[to] = edge;
                    heap.push(dist[to], to);
                    this.count("updates");
                    this.setEdge(edge, EDGE_SEEN);
                    this.setLabel(to, dist[to]);
                    this.setNode(to, NODE_FRONTIER);
                    this.emit("relax", to, edge, { instructionId: ["d2"] });
                } else {
                    this.setEdge(edge, EDGE_REJECT);
                    this.emit("reject", to, edge, { instructionId: ["d3"] });
                }
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            d0: { line: "dist[A] = 0; queue = [A];", indent: 0 },
            d1: { line: "u = closest unsettled node;", indent: 0 },
            d2: {
                line: "if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;",
                indent: 1,
            },
            d3: { line: "else the old route stays;", indent: 1 },
        };
    }
}
