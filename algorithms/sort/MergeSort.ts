import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

export class MergeSort extends SortAlgorithm {
    sort(arr: number[]): void {
        const merge = (left: number, middle: number, right: number): void => {
            const l1 = middle - left + 1;
            const l2 = right - middle;
            const arr1: number[] = new Array(l1);
            const arr2: number[] = new Array(l2);

            this.countConditionChecks();
            for (let i = 0; i < l1; ++i) {
                this.countConditionChecks();
                this.countArrayAccess();
                arr1[i] = arr[left + i];
                this.select(left + i, { instructionId: ["g1"] });
            }
            this.countConditionChecks();
            for (let i = 0; i < l2; ++i) {
                this.countConditionChecks();
                this.countArrayAccess();
                arr2[i] = arr[middle + 1 + i];
                this.select(middle + 1 + i, { instructionId: ["g2"] });
            }

            let i = 0;
            let j = 0;
            let k = left;
            this.countConditionChecks();
            while (i < l1 && j < l2) {
                this.countConditionChecks(3);
                // Strict <, so ties take the right-hand value.
                const value = arr1[i] < arr2[j] ? arr1[i++] : arr2[j++];
                this.assign(k++, value, arr, { instructionId: ["g5"] });
            }

            this.countConditionChecks();
            while (i < l1) {
                this.countConditionChecks();
                this.countArrayAccess();
                this.assign(k++, arr1[i++], arr, { instructionId: ["g6"] });
            }
            this.countConditionChecks();
            while (j < l2) {
                this.countConditionChecks();
                this.countArrayAccess();
                this.assign(k++, arr2[j++], arr, { instructionId: ["g7"] });
            }
        };

        const mergeSort = (left: number, right: number): void => {
            if (left >= right) return;
            const middle = left + Math.floor((right - left) / 2);
            const range = Array.from(
                { length: right - left + 1 },
                (_, i) => left + i
            );
            this.selectMany(
                range.map((index) => ({
                    index,
                    options: { instructionId: ["m2"] },
                }))
            );
            this.select(middle, { instructionId: ["m2"] });
            this.countRecursiveCalls(2);
            mergeSort(left, middle);
            mergeSort(middle + 1, right);
            merge(left, middle, right);
        };

        mergeSort(0, arr.length - 1);
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            m0: { line: `function mergeSort(arr, left, right) {`, indent: 0 },
            m1: { line: `if (left >= right) return;`, indent: 1 },
            m2: {
                line: `const mid = left + ((right - left) >> 1);`,
                indent: 1,
            },
            m3: { line: `mergeSort(arr, left, mid);`, indent: 1 },
            m4: { line: `mergeSort(arr, mid + 1, right);`, indent: 1 },
            m5: { line: `merge(arr, left, mid, right);`, indent: 1 },
            me0: { line: `}`, indent: 0 },
            b0: { line: ``, indent: 0 },
            g0: { line: `function merge(arr, left, mid, right) {`, indent: 0 },
            g1: { line: `const a = arr.slice(left, mid + 1);`, indent: 1 },
            g2: { line: `const b = arr.slice(mid + 1, right + 1);`, indent: 1 },
            g3: { line: `let i = 0, j = 0, k = left;`, indent: 1 },
            g4: { line: `while (i < a.length && j < b.length) {`, indent: 1 },
            g5: {
                line: `arr[k++] = a[i] < b[j] ? a[i++] : b[j++];`,
                indent: 2,
            },
            ge4: { line: `}`, indent: 1 },
            g6: { line: `while (i < a.length) arr[k++] = a[i++];`, indent: 1 },
            g7: { line: `while (j < b.length) arr[k++] = b[j++];`, indent: 1 },
            ge0: { line: `}`, indent: 0 },
        };
    }
}
