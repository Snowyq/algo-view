import type { AlgorithmInstructions } from "../types";
import { FindAlgorithm } from "./FindAlgorithm";

/* Two probes per round, keeping one third. More probes than binary
   search, despite cutting deeper each round. */
export class TernarySearch extends FindAlgorithm {
    search(): void {
        let lo = 0;
        let hi = this.values.length - 1;
        while (lo <= hi) {
            const third = Math.floor((hi - lo) / 3);
            const m1 = lo + third;
            const m2 = hi - third;
            const c1 = this.probe(m1, { instructionId: ["t1"] });
            if (c1 === 0) return this.found(m1, { instructionId: ["t2"] });
            const c2 = this.probe(m2, { instructionId: ["t1"] });
            if (c2 === 0) return this.found(m2, { instructionId: ["t2"] });
            if (c1 > 0) hi = m1 - 1;
            else if (c2 < 0) lo = m2 + 1;
            else {
                lo = m1 + 1;
                hi = m2 - 1;
            }
            this.narrow(lo, hi, { instructionId: ["t3"] });
        }
        this.miss({ instructionId: ["t4"] });
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            t0: { line: "while (lo <= hi) {", indent: 0 },
            t1: { line: "const m1 = lo + third, m2 = hi - third;", indent: 1 },
            t2: {
                line: "if (arr[m1] === target || arr[m2] === target) return;",
                indent: 1,
            },
            t3: { line: "keep the third that can hold target;", indent: 1 },
            te0: { line: "}", indent: 0 },
            t4: { line: "return -1;", indent: 0 },
        };
    }
}
