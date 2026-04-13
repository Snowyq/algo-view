import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

export class SelectionSort extends SortAlgorithm {
    sort(arr: number[]): void {
        const n = arr.length;

        this.countConditionChecks();
        for (let i = 0; i < n; i++) {
            this.countConditionChecks();

            let minIdx = i;

            this.selectMany([
                {
                    index: i,
                    options: { mode: "perm", id: "i", instructionId: ["i1"] },
                },
                {
                    index: i,
                    options: {
                        mode: "perm",
                        id: "minIdx",
                        instructionId: ["i1"],
                    },
                },
            ]);

            this.countConditionChecks();
            for (let j = i + 1; j < n; j++) {
                this.countConditionChecks();

                this.countArrayAccess(2);
                this.countConditionChecks();
                if (
                    this.check(j, "<", minIdx, arr, { instructionId: ["i3"] })
                ) {
                    minIdx = j;
                    this.select(minIdx, {
                        mode: "perm",
                        id: "minIdx",
                        instructionId: ["i4"],
                    });
                }
            }

            if (minIdx !== arr.length - 1) {
                this.select(minIdx, {
                    mode: "perm",
                    id: "minIdx",
                    instructionId: ["i4"],
                });
            }

            this.countConditionChecks();
            if (i !== minIdx) {
                this.countArrayAccess(2);
                this.swap(i, minIdx, arr, { instructionId: ["i5"] });
            }
        }
    }

    sortRaw(arr: number[]): number[] {
        const n = arr.length;
        for (let i = 0; i < n; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
        return arr;
    }

    static getInstructions(): AlgorithmInstructions {
        const instructions = {
            i0: { line: `for (let i = 0; i < n; i++) {`, indent: 0 },
            i1: { line: `let minIdx = i;`, indent: 1 },
            i2: { line: `for (let j = i + 1; j < n; j++) {`, indent: 1 },
            i3: { line: `if (arr[j] < arr[minIdx]) {`, indent: 2 },
            i4: { line: `minIdx = j;`, indent: 3 },
            ie3: { line: `}`, indent: 2 },
            ie2: { line: `}`, indent: 1 },
            i5: {
                line: `[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];`,
                indent: 1,
            },
            ie0: { line: `}`, indent: 0 },
        };
        return instructions;
    }
}
