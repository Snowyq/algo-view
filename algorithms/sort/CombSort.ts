import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

export class CombSort extends SortAlgorithm {
    sort(arr: number[]): void {
        const shrink = 1.3;
        let gap = arr.length;
        let sorted = false;

        this.countConditionChecks();
        while (!sorted) {
            gap = Math.floor(gap / shrink);
            if (gap <= 1) {
                gap = 1;
                sorted = true;
            }

            for (let i = 0; i + gap < arr.length; i++) {
                this.countConditionChecks();
                if (
                    this.check(i, ">", i + gap, arr, { instructionId: ["k5"] })
                ) {
                    this.swap(i, i + gap, arr, { instructionId: ["k6"] });
                    sorted = false;
                }
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            k0: { line: `let gap = arr.length, sorted = false;`, indent: 0 },
            k1: { line: `while (!sorted) {`, indent: 0 },
            k2: { line: `gap = Math.floor(gap / 1.3);`, indent: 1 },
            k3: {
                line: `if (gap <= 1) { gap = 1; sorted = true; }`,
                indent: 1,
            },
            k4: {
                line: `for (let i = 0; i + gap < arr.length; i++) {`,
                indent: 1,
            },
            k5: { line: `if (arr[i] > arr[i + gap]) {`, indent: 2 },
            k6: { line: `swap(arr, i, i + gap);`, indent: 3 },
            k7: { line: `sorted = false;`, indent: 3 },
            ke5: { line: `}`, indent: 2 },
            ke4: { line: `}`, indent: 1 },
            ke1: { line: `}`, indent: 0 },
        };
    }
}
