import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

export class OddEvenSort extends SortAlgorithm {
    sort(arr: number[]): void {
        let sorted = false;
        this.countConditionChecks();
        while (!sorted) {
            sorted = true;
            for (const offset of [1, 0]) {
                for (let i = offset; i < arr.length - 1; i += 2) {
                    this.countConditionChecks();
                    this.countArrayAccess(2);
                    if (
                        this.check(i, ">", i + 1, arr, {
                            instructionId: ["o5"],
                        })
                    ) {
                        this.swap(i, i + 1, arr, { instructionId: ["o6"] });
                        sorted = false;
                    }
                }
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            o0: { line: `let sorted = false;`, indent: 0 },
            o1: { line: `while (!sorted) {`, indent: 0 },
            o2: { line: `sorted = true;`, indent: 1 },
            o3: { line: `for (const start of [1, 0]) {`, indent: 1 },
            o4: {
                line: `for (let i = start; i < arr.length - 1; i += 2) {`,
                indent: 2,
            },
            o5: { line: `if (arr[i] > arr[i + 1]) {`, indent: 3 },
            o6: { line: `swap(arr, i, i + 1);`, indent: 4 },
            o7: { line: `sorted = false;`, indent: 4 },
            oe5: { line: `}`, indent: 3 },
            oe4: { line: `}`, indent: 2 },
            oe3: { line: `}`, indent: 1 },
            oe1: { line: `}`, indent: 0 },
        };
    }
}
