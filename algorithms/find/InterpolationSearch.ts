import type { AlgorithmInstructions } from "../types";
import { FindAlgorithm } from "./FindAlgorithm";

/* Guesses the position from the value, like opening a dictionary near
   "S". Brilliant on evenly spread data, poor on skewed data. */
export class InterpolationSearch extends FindAlgorithm {
    search(): void {
        const a = this.values;
        const t = this.target;
        let lo = 0;
        let hi = a.length - 1;
        while (lo <= hi && t >= a[lo] && t <= a[hi]) {
            const span = a[hi] - a[lo];
            const pos =
                span === 0
                    ? lo
                    : lo + Math.floor(((t - a[lo]) * (hi - lo)) / span);
            const cmp = this.probe(pos, { instructionId: ["p1", "p2"] });
            if (cmp === 0) return this.found(pos, { instructionId: ["p3"] });
            if (cmp < 0) lo = pos + 1;
            else hi = pos - 1;
            this.narrow(lo, hi, { instructionId: [cmp < 0 ? "p4" : "p5"] });
        }
        this.miss({ instructionId: ["p6"] });
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            p1: { line: "while (lo <= hi && inRange(target)) {", indent: 0 },
            p2: {
                line: "const pos = lo + (t - a[lo]) * (hi - lo) / (a[hi] - a[lo]);",
                indent: 1,
            },
            p3: { line: "if (a[pos] === t) return pos;", indent: 1 },
            p4: { line: "if (a[pos] < t) lo = pos + 1;", indent: 1 },
            p5: { line: "else hi = pos - 1;", indent: 1 },
            pe1: { line: "}", indent: 0 },
            p6: { line: "return -1;", indent: 0 },
        };
    }
}
