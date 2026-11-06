import type { AlgorithmInstructions } from "../types";
import { FindAlgorithm } from "./FindAlgorithm";

// Hops ahead sqrt(n) at a time until it overshoots, then scans that block.
export class JumpSearch extends FindAlgorithm {
    search(): void {
        const n = this.values.length;
        const size = Math.max(1, Math.floor(Math.sqrt(n)));
        let prev = 0;
        let next = Math.min(size, n) - 1;
        while (this.probe(next, { instructionId: ["j1"] }) < 0) {
            prev = next + 1;
            if (prev >= n) return this.miss({ instructionId: ["j4"] });
            next = Math.min(next + size, n - 1);
            this.narrow(prev, n - 1, { instructionId: ["j2"] });
        }
        this.narrow(prev, next, { instructionId: ["j3"] });
        for (let i = prev; i <= next; i += 1) {
            const cmp = this.probe(i, { instructionId: ["j3"] });
            if (cmp === 0) return this.found(i, { instructionId: ["j3"] });
            if (cmp > 0) break;
            this.narrow(i + 1, next, { instructionId: ["j3"] });
        }
        this.miss({ instructionId: ["j4"] });
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            j0: { line: "const step = Math.floor(Math.sqrt(n));", indent: 0 },
            j1: { line: "while (arr[blockEnd] < target) {", indent: 0 },
            j2: { line: "blockEnd += step;", indent: 1 },
            je1: { line: "}", indent: 0 },
            j3: { line: "linear search inside the block;", indent: 0 },
            j4: { line: "return -1;", indent: 0 },
        };
    }
}
