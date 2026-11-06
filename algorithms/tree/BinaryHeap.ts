import type { AlgorithmInstructions } from "../types";
import { TreeAlgorithm } from "./TreeAlgorithm";

// Min-heap in an array, drawn as the tree it encodes. New keys swap up
// while smaller than their parent.
export class BinaryHeap extends TreeAlgorithm {
    get movesName(): string {
        return "Swaps";
    }

    protected insert(key: number): void {
        let i = this.newNode(key);
        if (i === 0) {
            this.root = 0;
        } else {
            const p = (i - 1) >> 1;
            this.parent[i] = p;
            if (i % 2 === 1) this.left[p] = i;
            else this.right[p] = i;
        }
        this.emit("insert", i, this.parent[i], { instructionId: ["i"] });
        while (i > 0) {
            const p = this.parent[i];
            this.metrics.compares.count += 1;
            this.emit("compare", p, i, { instructionId: ["c"] });
            if (this.key[i] >= this.key[p]) break;
            [this.key[i], this.key[p]] = [this.key[p], this.key[i]];
            this.metrics.moves.count += 1;
            this.emit("swap", p, i, { instructionId: ["s"] });
            i = p;
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            i: { line: "heap[n] = key;", indent: 0 },
            c: { line: "while (heap[i] < heap[parent(i)])", indent: 0 },
            s: { line: "swap with parent; i = parent(i);", indent: 1 },
        };
    }
}
