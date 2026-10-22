import type { DpInput } from "../../utils/dpInput";
import type { AlgorithmInstructions } from "../types";
import { DpAlgorithm, type DpTable } from "./DpAlgorithm";

/* Longest run of letters both words share in order (gaps allowed).
   Matching letters extend the diagonal; otherwise keep the best so far. */
export class LongestCommonSubsequence extends DpAlgorithm {
    protected setup({ a, b }: DpInput): DpTable {
        return {
            rows: a.length + 1,
            cols: b.length + 1,
            rowLabels: ["·", ...a],
            colLabels: ["·", ...b],
            corner: "a∩b",
        };
    }

    protected solve({ a, b }: DpInput): void {
        const m = a.length;
        const n = b.length;
        for (let i = 0; i <= m; i += 1)
            this.fill(i, 0, 0, [], { instructionId: ["c0"] });
        for (let j = 1; j <= n; j += 1)
            this.fill(0, j, 0, [], { instructionId: ["c0"] });
        for (let i = 1; i <= m; i += 1) {
            for (let j = 1; j <= n; j += 1) {
                if (a[i - 1] === b[j - 1]) {
                    this.fill(
                        i,
                        j,
                        this.get(i - 1, j - 1) + 1,
                        [[i - 1, j - 1]],
                        {
                            instructionId: ["c2"],
                        }
                    );
                } else {
                    this.fill(
                        i,
                        j,
                        Math.max(this.get(i - 1, j), this.get(i, j - 1)),
                        [
                            [i - 1, j],
                            [i, j - 1],
                        ],
                        { instructionId: ["c3"] }
                    );
                }
            }
        }
        this.answer(this.get(m, n));
        let i = m;
        let j = n;
        while (i > 0 && j > 0) {
            if (a[i - 1] === b[j - 1]) {
                this.trace(i, j, { instructionId: ["c4"] });
                i -= 1;
                j -= 1;
            } else if (this.get(i - 1, j) >= this.get(i, j - 1)) {
                i -= 1;
            } else {
                j -= 1;
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            c0: { line: "L[i][0] = L[0][j] = 0;", indent: 0 },
            c1: { line: "for (i…) for (j…) {", indent: 0 },
            c2: {
                line: "if (a[i-1] === b[j-1]) L[i][j] = L[i-1][j-1] + 1;",
                indent: 1,
            },
            c3: {
                line: "else L[i][j] = max(L[i-1][j], L[i][j-1]);",
                indent: 1,
            },
            ce1: { line: "}", indent: 0 },
            c4: {
                line: "trace matching letters back from L[m][n];",
                indent: 0,
            },
        };
    }
}
