import type { DpInput } from "../../utils/dpInput";
import type { AlgorithmInstructions } from "../types";
import { DpAlgorithm, type DpTable } from "./DpAlgorithm";

/* Longest strictly rising run you can pick from the sequence, in order.
   lis[i] = 1 + the best lis[j] before it with a smaller value. */
export class LongestIncreasingSubsequence extends DpAlgorithm {
    protected setup({ sequence }: DpInput): DpTable {
        return {
            rows: 1,
            cols: sequence.length,
            rowLabels: ["lis"],
            colLabels: sequence.map(String),
            corner: "",
        };
    }

    protected solve({ sequence }: DpInput): void {
        const n = sequence.length;
        const prev = new Int32Array(n).fill(-1);
        for (let i = 0; i < n; i += 1) {
            let best = 1;
            const deps: Array<[number, number]> = [];
            for (let j = 0; j < i; j += 1) {
                if (sequence[j] >= sequence[i]) continue;
                deps.push([0, j]);
                if (this.get(0, j) + 1 > best) {
                    best = this.get(0, j) + 1;
                    prev[i] = j;
                }
            }
            this.fill(0, i, best, deps, { instructionId: ["l2", "l3"] });
        }
        let end = 0;
        for (let i = 1; i < n; i += 1) {
            if (this.get(0, i) > this.get(0, end)) end = i;
        }
        this.answer(this.get(0, end));
        for (let i = end; i !== -1; i = prev[i]) {
            this.trace(0, i, { instructionId: ["l4"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            l0: { line: "for (let i = 0; i < n; i++) {", indent: 0 },
            l1: { line: "lis[i] = 1;", indent: 1 },
            l2: { line: "for (j < i) if (seq[j] < seq[i])", indent: 1 },
            l3: { line: "lis[i] = max(lis[i], lis[j] + 1);", indent: 2 },
            le0: { line: "}", indent: 0 },
            l4: { line: "follow the best chain back;", indent: 0 },
        };
    }
}
