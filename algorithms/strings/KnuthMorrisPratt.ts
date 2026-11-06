import type { AlgorithmInstructions } from "../types";
import { StringAlgorithm } from "./StringAlgorithm";

// The prefix table says how much of the pattern already matches after a
// mismatch, so the text index never moves back.
export class KnuthMorrisPratt extends StringAlgorithm {
    tableLabel = "prefix";
    tableOn = "pattern" as const;

    search(): void {
        const p = this.pattern;
        const m = p.length;
        const n = this.text.length;
        // Longest proper prefix that is also a suffix, for every prefix.
        const lps = new Array<number>(m).fill(0);
        this.writeTable(0, 0, { instructionId: ["k0"] });
        for (let i = 1, len = 0; i < m; ) {
            if (p[i] === p[len]) {
                lps[i++] = ++len;
                this.writeTable(i - 1, len, { instructionId: ["k1"] });
            } else if (len > 0) {
                len = lps[len - 1];
            } else {
                lps[i++] = 0;
                this.writeTable(i - 1, 0, { instructionId: ["k1"] });
            }
        }
        let i = 0;
        let j = 0;
        this.shiftTo(0, { instructionId: ["k2"] });
        while (i < n) {
            if (this.compareChars(i, j, { instructionId: ["k3"] })) {
                i += 1;
                j += 1;
                if (j === m) {
                    this.matchAt(i - m, { instructionId: ["k4"] });
                    j = lps[j - 1];
                    if (i - j <= n - m)
                        this.shiftTo(i - j, { instructionId: ["k5"] });
                }
            } else if (j > 0) {
                j = lps[j - 1];
                this.shiftTo(i - j, { instructionId: ["k5"] });
            } else {
                i += 1;
                if (i <= n - m) this.shiftTo(i, { instructionId: ["k6"] });
                else break;
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            k0: { line: "const lps = prefixTable(pat);", indent: 0 },
            k1: {
                line: "lps[i] = longest prefix that is also a suffix;",
                indent: 1,
            },
            k2: { line: "let i = 0, j = 0;", indent: 0 },
            k3: { line: "if (text[i] === pat[j]) { i++; j++; }", indent: 1 },
            k4: { line: "if (j === m) found(i - m);", indent: 1 },
            k5: {
                line: "else if (j > 0) j = lps[j - 1]; // text stays",
                indent: 1,
            },
            k6: { line: "else i++;", indent: 1 },
        };
    }
}
