import type { AlgorithmInstructions } from "../types";
import {
    EDGE_TREE,
    GraphAlgorithm,
    NODE_DONE,
    NODE_FRONTIER,
} from "./GraphAlgorithm";

/* Kahn's algorithm on the graph with every edge pointing right: output
   a node once nothing points into it, then remove its outgoing edges.
   Labels count incoming edges left; done nodes show their position. */
export class TopologicalSort extends GraphAlgorithm {
    get directed(): boolean {
        return true;
    }

    protected run(): void {
        const n = this.nodeCount;
        const indegree = new Array<number>(n).fill(0);
        this.edgeList.forEach(({ b }) => (indegree[b] += 1));
        const queue: number[] = [];
        for (let u = 0; u < n; u += 1) {
            this.setLabel(u, indegree[u]);
            if (indegree[u] === 0) {
                queue.push(u);
                this.setNode(u, NODE_FRONTIER);
            }
        }
        this.emit("visit", -1, -1, { instructionId: ["t0"] });
        let position = 0;
        while (queue.length) {
            const u = queue.shift()!;
            position += 1;
            this.count("updates");
            this.setNode(u, NODE_DONE);
            this.setLabel(u, position);
            this.emit("visit", u, -1, { instructionId: ["t1"] });
            for (const { to, edge } of this.adjacency[u]) {
                indegree[to] -= 1;
                this.count("checks");
                this.setEdge(edge, EDGE_TREE);
                this.setLabel(to, indegree[to]);
                if (indegree[to] === 0) {
                    queue.push(to);
                    this.setNode(to, NODE_FRONTIER);
                }
                this.emit(indegree[to] === 0 ? "take" : "check", to, edge, {
                    instructionId: [indegree[to] === 0 ? "t3" : "t2"],
                });
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            t0: { line: "ready = nodes with no incoming edge;", indent: 0 },
            t1: { line: "output(u = ready.shift());", indent: 0 },
            t2: { line: "remove u → v; indegree[v]--;", indent: 1 },
            t3: { line: "if (indegree[v] === 0) ready.push(v);", indent: 1 },
        };
    }
}
