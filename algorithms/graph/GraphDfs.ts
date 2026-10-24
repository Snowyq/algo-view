import type { AlgorithmInstructions } from "../types";
import {
    EDGE_IDLE,
    EDGE_REJECT,
    EDGE_TREE,
    GraphAlgorithm,
    NODE_DONE,
    NODE_FRONTIER,
} from "./GraphAlgorithm";

/* Goes as deep as it can, then backs up. Labels are discovery order;
   nodes on the current path stay highlighted until it returns. */
export class GraphDfs extends GraphAlgorithm {
    protected run(): void {
        const seen = new Uint8Array(this.nodeCount);
        const state = new Uint8Array(this.edgeList.length);
        let order = 0;
        const visit = (u: number, via: number): void => {
            seen[u] = 1;
            order += 1;
            this.setNode(u, NODE_FRONTIER);
            this.setLabel(u, order);
            if (via >= 0) {
                state[via] = EDGE_TREE;
                this.setEdge(via, EDGE_TREE);
                this.count("weight", this.edgeList[via].w);
                this.count("updates");
            }
            this.emit(via >= 0 ? "take" : "visit", u, via, {
                instructionId: ["g0"],
            });
            for (const { to, edge } of this.adjacency[u]) {
                if (state[edge] !== EDGE_IDLE) continue;
                this.count("checks");
                if (!seen[to]) {
                    visit(to, edge);
                    this.emit("visit", u, -1, { instructionId: ["g1"] });
                } else {
                    state[edge] = EDGE_REJECT;
                    this.setEdge(edge, EDGE_REJECT);
                    this.emit("reject", to, edge, { instructionId: ["g2"] });
                }
            }
            this.setNode(u, NODE_DONE);
            this.emit("visit", u, -1, { instructionId: ["g3"] });
        };
        visit(0, -1);
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            g0: { line: "function visit(u) { seen[u] = true;", indent: 0 },
            g1: {
                line: "for (v of next(u)) if (!seen[v]) visit(v);",
                indent: 1,
            },
            g2: { line: "else skip: a cycle back;", indent: 1 },
            g3: { line: "} // back up", indent: 0 },
        };
    }
}
