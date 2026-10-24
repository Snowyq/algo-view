import type { AlgorithmInstructions } from "../types";
import {
    EDGE_IDLE,
    EDGE_SEEN,
    EDGE_TREE,
    GraphAlgorithm,
    NODE_DONE,
    NODE_FRONTIER,
} from "./GraphAlgorithm";

/* Relaxes every edge, round after round, until nothing improves. No
   priority queue and fine with negative weights, but many more checks. */
export class BellmanFord extends GraphAlgorithm {
    protected run(): void {
        const n = this.nodeCount;
        const dist = new Array<number>(n).fill(Infinity);
        const via = new Array<number>(n).fill(-1);
        const state = new Uint8Array(this.edgeList.length);
        const mark = (edge: number, value: number): void => {
            state[edge] = value;
            this.setEdge(edge, value);
        };
        dist[0] = 0;
        this.setLabel(0, 0);
        this.setNode(0, NODE_FRONTIER);
        this.emit("visit", 0, -1, { instructionId: ["f0"] });
        for (let round = 1; round < n; round += 1) {
            let changed = false;
            this.emit("visit", -1, -1, { instructionId: ["f1"] });
            this.edgeList.forEach(({ a, b, w }, edge) => {
                for (const [from, to] of [
                    [a, b],
                    [b, a],
                ]) {
                    if (dist[from] === Infinity) continue;
                    this.count("checks");
                    if (dist[from] + w < dist[to]) {
                        if (via[to] >= 0 && via[to] !== edge) {
                            mark(via[to], EDGE_SEEN);
                        }
                        dist[to] = dist[from] + w;
                        via[to] = edge;
                        changed = true;
                        this.count("updates");
                        mark(edge, EDGE_TREE);
                        this.setLabel(to, dist[to]);
                        this.setNode(to, NODE_FRONTIER);
                        this.emit("relax", to, edge, { instructionId: ["f2"] });
                    } else {
                        if (state[edge] === EDGE_IDLE) mark(edge, EDGE_SEEN);
                        this.emit("check", from, edge, {
                            instructionId: ["f3"],
                        });
                    }
                }
            });
            if (!changed) break;
        }
        for (let u = 0; u < n; u += 1) {
            if (dist[u] < Infinity) this.setNode(u, NODE_DONE);
            if (via[u] >= 0) this.count("weight", this.edgeList[via[u]].w);
        }
        this.emit("take", -1, -1, { instructionId: ["f4"] });
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            f0: { line: "dist[A] = 0;", indent: 0 },
            f1: { line: "repeat n - 1 rounds (or until calm):", indent: 0 },
            f2: {
                line: "if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;",
                indent: 1,
            },
            f3: { line: "else nothing to improve;", indent: 1 },
            f4: { line: "dist holds every shortest distance;", indent: 0 },
        };
    }
}
