import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

export class CocktailShakerSort extends SortAlgorithm {
    sort(arr: number[]): void {
        let start = 0;
        let end = arr.length - 1;
        let swapped = true;

        this.countConditionChecks();
        while (swapped) {
            swapped = false;

            for (let i = start; i < end; i++) {
                this.countConditionChecks();
                this.countArrayAccess(2);
                if (this.check(i, ">", i + 1, arr, { instructionId: ["c4"] })) {
                    this.swap(i, i + 1, arr, { instructionId: ["c5"] });
                    swapped = true;
                }
            }
            this.countConditionChecks();
            if (!swapped) break;

            swapped = false;
            end--;

            for (let i = end - 1; i >= start; i--) {
                this.countConditionChecks();
                this.countArrayAccess(2);
                if (
                    this.check(i, ">", i + 1, arr, { instructionId: ["c11"] })
                ) {
                    this.swap(i, i + 1, arr, { instructionId: ["c12"] });
                    swapped = true;
                }
            }
            start++;
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            c0: {
                line: `let start = 0, end = arr.length - 1, swapped = true;`,
                indent: 0,
            },
            c1: { line: `while (swapped) {`, indent: 0 },
            c2: { line: `swapped = false;`, indent: 1 },
            c3: { line: `for (let i = start; i < end; i++) {`, indent: 1 },
            c4: { line: `if (arr[i] > arr[i + 1]) {`, indent: 2 },
            c5: { line: `swap(arr, i, i + 1);`, indent: 3 },
            c6: { line: `swapped = true;`, indent: 3 },
            ce4: { line: `}`, indent: 2 },
            ce3: { line: `}`, indent: 1 },
            c7: { line: `if (!swapped) break;`, indent: 1 },
            c8: { line: `swapped = false;`, indent: 1 },
            c9: { line: `end--;`, indent: 1 },
            c10: {
                line: `for (let i = end - 1; i >= start; i--) {`,
                indent: 1,
            },
            c11: { line: `if (arr[i] > arr[i + 1]) {`, indent: 2 },
            c12: { line: `swap(arr, i, i + 1);`, indent: 3 },
            c13: { line: `swapped = true;`, indent: 3 },
            ce11: { line: `}`, indent: 2 },
            ce10: { line: `}`, indent: 1 },
            c14: { line: `start++;`, indent: 1 },
            ce1: { line: `}`, indent: 0 },
        };
    }
}
