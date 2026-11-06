import type { AlgorithmInstructions } from "../types";
import { FindAlgorithm } from "./FindAlgorithm";

// Probes the middle and drops the half that cannot hold the target.
export class BinarySearch extends FindAlgorithm {
    search(): void {
        let lo = 0;
        let hi = this.values.length - 1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const cmp = this.probe(mid, { instructionId: ["n1", "n2"] });
            if (cmp === 0) {
                this.found(mid, { instructionId: ["n3"] });
                return;
            }
            if (cmp < 0) lo = mid + 1;
            else hi = mid - 1;
            this.narrow(lo, hi, { instructionId: [cmp < 0 ? "n4" : "n5"] });
        }
        this.miss({ instructionId: ["n6"] });
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            n0: { line: "let lo = 0, hi = arr.length - 1;", indent: 0 },
            n1: { line: "while (lo <= hi) {", indent: 0 },
            n2: { line: "const mid = (lo + hi) >> 1;", indent: 1 },
            n3: { line: "if (arr[mid] === target) return mid;", indent: 1 },
            n4: { line: "if (arr[mid] < target) lo = mid + 1;", indent: 1 },
            n5: { line: "else hi = mid - 1;", indent: 1 },
            ne1: { line: "}", indent: 0 },
            n6: { line: "return -1;", indent: 0 },
        };
    }
}
