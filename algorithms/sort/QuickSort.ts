import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

export class QuickSort extends SortAlgorithm {
    sort(arr: number[]): void {
        const partition = (lo: number, hi: number): number => {
            this.select(hi, {
                mode: "perm",
                id: "pivot",
                instructionId: ["p1"],
            });
            let i = lo;
            this.countConditionChecks();
            for (let j = lo; j < hi; j++) {
                this.countConditionChecks();
                this.countArrayAccess(2);
                if (this.check(j, "<", hi, arr, { instructionId: ["p4"] })) {
                    if (i !== j)
                        this.swap(i, j, arr, { instructionId: ["p5"] });
                    i++;
                }
            }
            this.unSelect("pivot");
            if (i !== hi) this.swap(i, hi, arr, { instructionId: ["p7"] });
            return i;
        };

        const quickSort = (lo: number, hi: number): void => {
            this.countConditionChecks();
            if (lo >= hi) return;
            const p = partition(lo, hi);
            this.countRecursiveCalls(2);
            quickSort(lo, p - 1);
            quickSort(p + 1, hi);
        };

        quickSort(0, arr.length - 1);
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            q0: { line: `function quickSort(arr, lo, hi) {`, indent: 0 },
            q1: { line: `if (lo >= hi) return;`, indent: 1 },
            q2: { line: `const p = partition(arr, lo, hi);`, indent: 1 },
            q3: { line: `quickSort(arr, lo, p - 1);`, indent: 1 },
            q4: { line: `quickSort(arr, p + 1, hi);`, indent: 1 },
            qe0: { line: `}`, indent: 0 },
            b0: { line: ``, indent: 0 },
            p0: { line: `function partition(arr, lo, hi) {`, indent: 0 },
            p1: { line: `const pivot = arr[hi];`, indent: 1 },
            p2: { line: `let i = lo;`, indent: 1 },
            p3: { line: `for (let j = lo; j < hi; j++) {`, indent: 1 },
            p4: { line: `if (arr[j] < pivot) {`, indent: 2 },
            p5: { line: `if (i !== j) swap(arr, i, j);`, indent: 3 },
            p6: { line: `i++;`, indent: 3 },
            pe4: { line: `}`, indent: 2 },
            pe3: { line: `}`, indent: 1 },
            p7: { line: `if (i !== hi) swap(arr, i, hi);`, indent: 1 },
            p8: { line: `return i;`, indent: 1 },
            pe0: { line: `}`, indent: 0 },
        };
    }
}
