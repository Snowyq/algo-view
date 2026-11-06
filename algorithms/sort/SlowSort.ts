import type { AlgorithmInstructions } from "../types";
import { BudgetedSortAlgorithm } from "./BudgetedSortAlgorithm";

/* "Multiply and surrender": the deliberately pessimal recursive sort. */
export class SlowSort extends BudgetedSortAlgorithm {
    run(arr: number[]): void {
        const slow = (lo: number, hi: number): void => {
            this.spend();
            if (lo >= hi) return;

            const mid = Math.floor((lo + hi) / 2);
            this.countRecursiveCalls(3);
            slow(lo, mid);
            slow(mid + 1, hi);

            this.countConditionChecks();
            if (this.check(mid, ">", hi, arr, { instructionId: ["w5"] }))
                this.swap(mid, hi, arr, { instructionId: ["w5"] });
            slow(lo, hi - 1);
        };

        slow(0, arr.length - 1);
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            w0: { line: `function slowSort(arr, lo, hi) {`, indent: 0 },
            w1: { line: `if (lo >= hi) return;`, indent: 1 },
            w2: { line: `const mid = (lo + hi) >> 1;`, indent: 1 },
            w3: { line: `slowSort(arr, lo, mid);`, indent: 1 },
            w4: { line: `slowSort(arr, mid + 1, hi);`, indent: 1 },
            w5: {
                line: `if (arr[mid] > arr[hi]) swap(arr, mid, hi);`,
                indent: 1,
            },
            w6: { line: `slowSort(arr, lo, hi - 1);`, indent: 1 },
            we0: { line: `}`, indent: 0 },
        };
    }
}
