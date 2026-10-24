import type { AlgorithmInstructions } from "../types";
import { TreeAlgorithm } from "./TreeAlgorithm";

/* Smaller keys go left, larger go right, new keys hang as leaves. Fast
   on random input; sorted input makes it a linked list. */
export class BinarySearchTree extends TreeAlgorithm {
    protected insert(key: number): void {
        this.insertLeaf(key, 0, { instructionId: ["i"] });
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            w: { line: "x = root;", indent: 0 },
            c: { line: "x = key < x.key ? x.left : x.right;", indent: 0 },
            i: { line: "hang the new node where x was null;", indent: 0 },
        };
    }
}
