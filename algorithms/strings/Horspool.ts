import type { AlgorithmInstructions } from "../types";
import { StringAlgorithm } from "./StringAlgorithm";

/* Boyer-Moore-Horspool: compares from the right end of the pattern and,
   on a mismatch, jumps by how far the text's last character sits from
   the pattern's end. Long jumps on prose. */
export class Horspool extends StringAlgorithm {
    tableLabel = "skip";
    tableOn = "pattern" as const;

    search(): void {
        const p = this.pattern;
        const t = this.text;
        const m = p.length;
        const n = t.length;
        const skip = new Map<string, number>();
        for (let k = 0; k < m - 1; k += 1) {
            skip.set(p[k], m - 1 - k);
            this.writeTable(k, m - 1 - k, { instructionId: ["h0"] });
        }
        this.writeTable(m - 1, m, { instructionId: ["h0"] });
        let s = 0;
        while (s <= n - m) {
            this.shiftTo(s, { instructionId: ["h1"] });
            let j = m - 1;
            while (
                j >= 0 &&
                this.compareChars(s + j, j, { instructionId: ["h2"] })
            )
                j -= 1;
            if (j < 0) this.matchAt(s, { instructionId: ["h3"] });
            s += skip.get(t[s + m - 1]) ?? m;
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            h0: {
                line: "skip[c] = distance of c's last spot to the end;",
                indent: 0,
            },
            h1: { line: "while (s <= n - m) {", indent: 0 },
            h2: {
                line: "compare right to left: pat[j] vs text[s+j];",
                indent: 1,
            },
            h3: { line: "if (all matched) found(s);", indent: 1 },
            h4: { line: "s += skip[text[s + m - 1]] ?? m;", indent: 1 },
            he1: { line: "}", indent: 0 },
        };
    }
}
