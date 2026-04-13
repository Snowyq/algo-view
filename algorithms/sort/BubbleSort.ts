import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

export class BubbleSort extends SortAlgorithm {
    sort(arr: number[]): void {
        this.countConditionChecks();
        for (let i = 1; i < arr.length; i++) {
            this.countConditionChecks();
            for (let j = 0; j < arr.length - i; j++) {
                this.countConditionChecks();
                this.select(j, {
                    instructionId: j === 0 ? ["i0", "i1"] : ["i1"],
                });

                this.countArrayAccess(2);
                this.countConditionChecks();
                if (this.check(j, ">", j + 1, arr, { instructionId: ["i2"] })) {
                    this.countArrayAccess(2);
                    this.swap(j, j + 1, arr, { instructionId: ["i3"] });
                }
            }
        }
    }

    static rawSort(arr: number[]): void {
        for (let i = 1; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                }
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        const instructions = {
            i0: {
                line: `for (let i = 1; i < arr.length; i++) {`,
                indent: 0,
            },
            i1: {
                line: `for (let j = 0; j < arr.length - i; j++) {`,
                indent: 1,
            },
            i2: { line: `if (arr[j] > arr[j + 1]) {`, indent: 2 },
            i3: {
                line: `[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];`,
                indent: 3,
            },
            ie2: { line: `}`, indent: 2 },
            ie1: { line: `}`, indent: 1 },
            ie0: { line: `}`, indent: 0 },
        };
        return instructions;
    }
}
