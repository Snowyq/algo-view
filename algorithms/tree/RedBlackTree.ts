import type { AlgorithmInstructions } from "../types";
import { BLACK, NIL, RED, type TagKind, TreeAlgorithm } from "./TreeAlgorithm";

// New nodes are red. A red uncle means recolour and move up; a black
// one means at most two rotations.
export class RedBlackTree extends TreeAlgorithm {
    get tagKind(): TagKind {
        return "color";
    }

    private red(x: number): boolean {
        return x !== NIL && this.tag[x] === RED;
    }

    protected insert(key: number): void {
        let z = this.insertLeaf(key, RED, { instructionId: ["i"] });
        while (z !== this.root && this.red(this.parent[z])) {
            let p = this.parent[z];
            const g = this.parent[p];
            const pIsLeft = this.left[g] === p;
            const uncle = pIsLeft ? this.right[g] : this.left[g];
            if (this.red(uncle)) {
                this.tag[p] = BLACK;
                this.tag[uncle] = BLACK;
                this.tag[g] = RED;
                this.emit("recolor", g, uncle, { instructionId: ["u"] });
                z = g;
                continue;
            }
            if (pIsLeft && z === this.right[p]) {
                this.rotateLeft(p, { instructionId: ["z"] });
                z = p;
                p = this.parent[z];
            } else if (!pIsLeft && z === this.left[p]) {
                this.rotateRight(p, { instructionId: ["z"] });
                z = p;
                p = this.parent[z];
            }
            this.tag[p] = BLACK;
            this.tag[g] = RED;
            this.emit("recolor", p, g, { instructionId: ["g"] });
            if (pIsLeft) this.rotateRight(g, { instructionId: ["g"] });
            else this.rotateLeft(g, { instructionId: ["g"] });
        }
        if (this.tag[this.root] !== BLACK) {
            this.tag[this.root] = BLACK;
            this.emit("recolor", this.root, NIL, { instructionId: ["b"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            c: { line: "descend like a BST;", indent: 0 },
            i: { line: "insert a red leaf;", indent: 0 },
            u: { line: "uncle red → recolour, move up;", indent: 1 },
            z: { line: "zig-zag → rotate the parent;", indent: 1 },
            g: { line: "recolour, rotate the grandparent;", indent: 1 },
            b: { line: "root = black;", indent: 0 },
        };
    }
}
