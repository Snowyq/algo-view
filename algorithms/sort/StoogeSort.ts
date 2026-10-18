import type { AlgorithmInstructions } from "../types";
import { BudgetedSortAlgorithm } from "./BudgetedSortAlgorithm";

/* Sort first 2/3, last 2/3, first 2/3 again. O(n^2.71). */
export class StoogeSort extends BudgetedSortAlgorithm {
    // Slow but finite: enough room to finish the default 50 items.
    static stepBudget = 160000;

    run(arr: number[]): void {
        const stooge = (lo: number, hi: number): void => {
            this.spend();
            this.countConditionChecks();
            this.countArrayAccess(2);
            if (this.check(lo, ">", hi, arr, { instructionId: ["t1"] }))
                this.swap(lo, hi, arr, { instructionId: ["t1"] });
            if (hi - lo + 1 <= 2) return;

            const third = Math.floor((hi - lo + 1) / 3);
            this.countRecursiveCalls(3);
            stooge(lo, hi - third);
            stooge(lo + third, hi);
            stooge(lo, hi - third);
        };

        if (arr.length > 1) stooge(0, arr.length - 1);
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            t0: { line: `function stoogeSort(arr, lo, hi) {`, indent: 0 },
            t1: {
                line: `if (arr[lo] > arr[hi]) swap(arr, lo, hi);`,
                indent: 1,
            },
            t2: { line: `if (hi - lo + 1 <= 2) return;`, indent: 1 },
            t3: { line: `const t = Math.floor((hi - lo + 1) / 3);`, indent: 1 },
            t4: { line: `stoogeSort(arr, lo, hi - t);`, indent: 1 },
            t5: { line: `stoogeSort(arr, lo + t, hi);`, indent: 1 },
            t6: { line: `stoogeSort(arr, lo, hi - t);`, indent: 1 },
            te0: { line: `}`, indent: 0 },
        };
    }
}
