import type { AlgorithmInstructions } from "../types";
import { StringAlgorithm } from "./StringAlgorithm";

// Z value = how many letters at a text position match the pattern start;
// a match is a Z value of m. The [l, r) box lets most positions skip ahead.
export class ZAlgorithm extends StringAlgorithm {
    tableLabel = "z";
    tableOn = "text" as const;

    search(): void {
        const p = this.pattern;
        const m = p.length;
        const n = this.text.length;
        const s = `${p}\u0000${this.text}`;
        const z = new Array<number>(s.length).fill(0);
        let l = 0;
        let r = 0;
        for (let k = 1; k < s.length; k += 1) {
            const inText = k > m;
            const ti = k - m - 1;
            if (inText && ti <= n - m)
                this.shiftTo(ti, { instructionId: ["z1"] });
            if (k < r) z[k] = Math.min(r - k, z[k - l]);
            while (k + z[k] < s.length && s[z[k]] === s[k + z[k]]) {
                if (inText)
                    this.compareChars(ti + z[k], z[k], {
                        instructionId: ["z2"],
                    });
                z[k] += 1;
            }
            // The failing compare (unless the pattern ran out) is shown too.
            if (inText && z[k] < m && ti + z[k] < n) {
                this.compareChars(ti + z[k], z[k], { instructionId: ["z2"] });
            }
            if (k + z[k] > r) {
                l = k;
                r = k + z[k];
            }
            if (inText) {
                this.writeTable(ti, z[k], { instructionId: ["z3"] });
                if (z[k] >= m) this.matchAt(ti, { instructionId: ["z4"] });
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            z0: { line: "const s = pat + '$' + text;", indent: 0 },
            z1: { line: "z[k] = k < r ? min(r - k, z[k - l]) : 0;", indent: 0 },
            z2: { line: "while (s[z[k]] === s[k + z[k]]) z[k]++;", indent: 0 },
            z3: {
                line: "if (k + z[k] > r) { l = k; r = k + z[k]; }",
                indent: 0,
            },
            z4: { line: "if (z[k] === m) found(k - m - 1);", indent: 0 },
        };
    }
}
