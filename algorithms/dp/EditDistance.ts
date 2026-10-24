import type { DpInput } from "../../utils/dpInput";
import type { AlgorithmInstructions } from "../types";
import { DpAlgorithm, type DpTable } from "./DpAlgorithm";

/* Levenshtein: fewest single-letter inserts, deletes and swaps to turn
   one word into the other. Each cell = best edit of two prefixes. */
export class EditDistance extends DpAlgorithm {
    protected setup({ a, b }: DpInput): DpTable {
        return {
            rows: a.length + 1,
            cols: b.length + 1,
            rowLabels: ["·", ...a],
            colLabels: ["·", ...b],
            corner: "a→b",
        };
    }

    protected solve({ a, b }: DpInput): void {
        const m = a.length;
        const n = b.length;
        for (let i = 0; i <= m; i += 1) {
            this.fill(i, 0, i, i > 0 ? [[i - 1, 0]] : [], {
                instructionId: ["e0"],
            });
        }
        for (let j = 1; j <= n; j += 1) {
            this.fill(0, j, j, [[0, j - 1]], { instructionId: ["e0"] });
        }
        for (let i = 1; i <= m; i += 1) {
            for (let j = 1; j <= n; j += 1) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                const value = Math.min(
                    this.get(i - 1, j) + 1,
                    this.get(i, j - 1) + 1,
                    this.get(i - 1, j - 1) + cost
                );
                this.fill(
                    i,
                    j,
                    value,
                    [
                        [i - 1, j],
                        [i, j - 1],
                        [i - 1, j - 1],
                    ],
                    { instructionId: cost ? ["e2", "e3"] : ["e2", "e4"] }
                );
            }
        }
        this.answer(this.get(m, n));
        // Walk back along the choices that produced the answer.
        let i = m;
        let j = n;
        this.trace(i, j, { instructionId: ["e5"] });
        while (i > 0 || j > 0) {
            const here = this.get(i, j);
            const cost = i > 0 && j > 0 && a[i - 1] === b[j - 1] ? 0 : 1;
            if (i > 0 && j > 0 && this.get(i - 1, j - 1) + cost === here) {
                i -= 1;
                j -= 1;
            } else if (i > 0 && this.get(i - 1, j) + 1 === here) {
                i -= 1;
            } else {
                j -= 1;
            }
            this.trace(i, j, { instructionId: ["e5"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            e0: { line: "d[i][0] = i; d[0][j] = j;", indent: 0 },
            e1: { line: "for (i…) for (j…) {", indent: 0 },
            e2: {
                line: "const cost = a[i - 1] === b[j - 1] ? 0 : 1;",
                indent: 1,
            },
            e3: {
                line: "d[i][j] = min(d[i-1][j] + 1, d[i][j-1] + 1,",
                indent: 1,
            },
            e4: { line: "              d[i-1][j-1] + cost);", indent: 1 },
            ee1: { line: "}", indent: 0 },
            e5: { line: "trace back from d[m][n];", indent: 0 },
        };
    }
}
