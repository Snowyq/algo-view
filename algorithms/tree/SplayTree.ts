import type { AlgorithmInstructions } from "../types";
import { NIL, TreeAlgorithm } from "./TreeAlgorithm";

// Rotates every inserted key up to the root (zig, zig-zig, zig-zag).
// O(log n) amortised; recent keys stay near the top.
export class SplayTree extends TreeAlgorithm {
    protected insert(key: number): void {
        const x = this.insertLeaf(key, 0, { instructionId: ["i"] });
        while (this.parent[x] !== NIL) {
            const p = this.parent[x];
            const g = this.parent[p];
            if (g === NIL) {
                this.rotateUp(x, { instructionId: ["zig"] });
            } else if ((this.left[p] === x) === (this.left[g] === p)) {
                this.rotateUp(p, { instructionId: ["zz"] });
                this.rotateUp(x, { instructionId: ["zz"] });
            } else {
                this.rotateUp(x, { instructionId: ["zg"] });
                this.rotateUp(x, { instructionId: ["zg"] });
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            c: { line: "descend like a BST;", indent: 0 },
            i: { line: "insert leaf, then splay it:", indent: 0 },
            zig: { line: "parent is root → one rotation;", indent: 1 },
            zz: { line: "same side → rotate parent, then x;", indent: 1 },
            zg: { line: "zig-zag → rotate x twice;", indent: 1 },
        };
    }
}
