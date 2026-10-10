import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

export class PancakeSort extends SortAlgorithm {
    sort(arr: number[]): void {
        // Reverse the stack arr[0..k] with a spatula.
        const flip = (k: number, line: string): void => {
            this.count("flips", "Flips");
            let i = 0;
            while (i < k) {
                this.countConditionChecks();
                this.swap(i, k, arr, { instructionId: [line] });
                i++;
                k--;
            }
        };

        for (let size = arr.length; size > 1; size--) {
            this.countConditionChecks();
            let maxIdx = 0;
            this.select(maxIdx, {
                mode: "perm",
                id: "max",
                instructionId: ["p1"],
            });
            for (let i = 1; i < size; i++) {
                this.countConditionChecks();
                this.countArrayAccess(2);
                if (
                    this.check(i, ">", maxIdx, arr, { instructionId: ["p3"] })
                ) {
                    maxIdx = i;
                    this.select(maxIdx, {
                        mode: "perm",
                        id: "max",
                        instructionId: ["p3"],
                    });
                }
            }
            this.unSelect("max");

            if (maxIdx === size - 1) continue;
            if (maxIdx > 0) flip(maxIdx, "p5");
            flip(size - 1, "p6");
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            p0: {
                line: `for (let size = arr.length; size > 1; size--) {`,
                indent: 0,
            },
            p1: { line: `let max = 0;`, indent: 1 },
            p2: { line: `for (let i = 1; i < size; i++) {`, indent: 1 },
            p3: { line: `if (arr[i] > arr[max]) max = i;`, indent: 2 },
            pe2: { line: `}`, indent: 1 },
            p4: { line: `if (max === size - 1) continue;`, indent: 1 },
            p5: { line: `if (max > 0) flip(arr, max);`, indent: 1 },
            p6: { line: `flip(arr, size - 1);`, indent: 1 },
            pe0: { line: `}`, indent: 0 },
        };
    }
}
