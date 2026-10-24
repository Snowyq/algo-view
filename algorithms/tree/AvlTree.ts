import type { AlgorithmInstructions } from "../types";
import { NIL, type TagKind, TreeAlgorithm } from "./TreeAlgorithm";

/* After each insert, walk back up; where the two subtrees' heights
   differ by more than one, one or two rotations fix it. Height stays
   within 1.44 log n. Tags hold heights; nodes show the balance. */
export class AvlTree extends TreeAlgorithm {
    get tagKind(): TagKind {
        return "height";
    }

    private h(x: number): number {
        return x === NIL ? 0 : this.tag[x];
    }

    private update(x: number): void {
        this.tag[x] = 1 + Math.max(this.h(this.left[x]), this.h(this.right[x]));
    }

    protected afterRotate(x: number, y: number): void {
        this.update(x);
        this.update(y);
    }

    protected insert(key: number): void {
        const id = this.insertLeaf(key, 1, { instructionId: ["i"] });
        for (let x = this.parent[id]; x !== NIL; x = this.parent[x]) {
            this.update(x);
            const balance = this.h(this.left[x]) - this.h(this.right[x]);
            if (balance > 1) {
                if (key > this.key[this.left[x]])
                    this.rotateLeft(this.left[x], { instructionId: ["lr"] });
                this.rotateRight(x, { instructionId: ["r"] });
                x = this.parent[x];
            } else if (balance < -1) {
                if (key < this.key[this.right[x]])
                    this.rotateRight(this.right[x], { instructionId: ["lr"] });
                this.rotateLeft(x, { instructionId: ["r"] });
                x = this.parent[x];
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            c: { line: "descend like a BST;", indent: 0 },
            i: { line: "insert leaf; walk back up:", indent: 0 },
            lr: { line: "zig-zag? rotate the child first;", indent: 1 },
            r: { line: "|balance| > 1 → rotate this node;", indent: 1 },
        };
    }
}
