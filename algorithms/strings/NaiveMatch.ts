import type { AlgorithmInstructions } from "../types";
import { StringAlgorithm } from "./StringAlgorithm";

// Tries every alignment, comparing left to right. Quadratic on aaaa...ab.
export class NaiveMatch extends StringAlgorithm {
    search(): void {
        const n = this.text.length;
        const m = this.pattern.length;
        for (let s = 0; s <= n - m; s += 1) {
            this.shiftTo(s, { instructionId: ["v0"] });
            let j = 0;
            while (
                j < m &&
                this.compareChars(s + j, j, { instructionId: ["v1"] })
            )
                j += 1;
            if (j === m) this.matchAt(s, { instructionId: ["v2"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            v0: { line: "for (let s = 0; s <= n - m; s++) {", indent: 0 },
            v1: {
                line: "let j = 0; while (j < m && text[s+j] === pat[j]) j++;",
                indent: 1,
            },
            v2: { line: "if (j === m) found(s);", indent: 1 },
            ve0: { line: "}", indent: 0 },
        };
    }
}
