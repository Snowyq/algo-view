import type { AlgorithmInstructions } from "../types";
import { NIL, type TagKind, TreeAlgorithm } from "./TreeAlgorithm";

// BST on keys, heap on fixed pseudo-random priorities: the new leaf rotates
// up while its priority beats its parent's.
export class Treap extends TreeAlgorithm {
    get tagKind(): TagKind {
        return "priority";
    }

    /** Fixed pseudo-random priority per key (smaller = higher). */
    private priority(key: number): number {
        return ((Math.imul(key, 2654435761) >>> 0) % 997) + 1;
    }

    protected insert(key: number): void {
        const x = this.insertLeaf(key, this.priority(key), {
            instructionId: ["i"],
        });
        while (this.parent[x] !== NIL) {
            const p = this.parent[x];
            this.metrics.compares.count += 1;
            if (this.tag[x] >= this.tag[p]) {
                this.emit("compare", p, x, { instructionId: ["h"] });
                break;
            }
            this.rotateUp(x, { instructionId: ["r"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            c: { line: "descend like a BST;", indent: 0 },
            i: { line: "insert leaf with a random priority;", indent: 0 },
            r: { line: "while (prio < parent.prio) rotate up;", indent: 1 },
            h: { line: "heap order holds → done;", indent: 1 },
        };
    }
}
