import type { AlgorithmInstructions } from "../types";
import { FindAlgorithm } from "./FindAlgorithm";

// Doubles the reach until it passes the target, then binary searches
// the last stretch. Good when the target is near the front.
export class ExponentialSearch extends FindAlgorithm {
    search(): void {
        const n = this.values.length;
        if (this.probe(0, { instructionId: ["e0"] }) === 0) {
            return this.found(0, { instructionId: ["e0"] });
        }
        let bound = 1;
        while (bound < n && this.probe(bound, { instructionId: ["e1"] }) < 0) {
            bound *= 2;
            this.narrow(Math.min(bound / 2, n - 1), n - 1, {
                instructionId: ["e2"],
            });
        }
        let lo = Math.floor(bound / 2);
        let hi = Math.min(bound, n - 1);
        this.narrow(lo, hi, { instructionId: ["e3"] });
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const cmp = this.probe(mid, { instructionId: ["e3"] });
            if (cmp === 0) return this.found(mid, { instructionId: ["e3"] });
            if (cmp < 0) lo = mid + 1;
            else hi = mid - 1;
            this.narrow(lo, hi, { instructionId: ["e3"] });
        }
        this.miss({ instructionId: ["e4"] });
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            e0: { line: "if (arr[0] === target) return 0;", indent: 0 },
            e1: { line: "while (bound < n && arr[bound] < target)", indent: 0 },
            e2: { line: "bound *= 2;", indent: 1 },
            e3: {
                line: "binarySearch(bound / 2, min(bound, n - 1));",
                indent: 0,
            },
            e4: { line: "return -1;", indent: 0 },
        };
    }
}
