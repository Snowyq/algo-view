import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

export class ShellSort extends SortAlgorithm {
    sort(arr: number[]): void {
        const n = arr.length;
        const selectJ = (index: number): void =>
            this.select(index, {
                mode: "perm",
                id: "j",
                instructionId: ["h4"],
            });

        this.countConditionChecks();
        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
            this.countConditionChecks();

            this.countConditionChecks();
            for (let i = gap; i < n; i++) {
                this.countConditionChecks();

                this.countArrayAccess();
                this.select(i, {
                    mode: "perm",
                    id: "i",
                    instructionId: ["h1"],
                });
                const temp = arr[i];

                let j = i;
                this.countConditionChecks();

                if (arr[j - gap] > temp) selectJ(j - gap);

                while (
                    j >= gap &&
                    this.checkWithValue(j - gap, ">", temp, arr, {
                        instructionId: ["h4"],
                    })
                ) {
                    this.countConditionChecks();
                    this.copy(j, j - gap, arr, { instructionId: ["h5"] });
                    j -= gap;

                    if (arr[j - gap] > temp) selectJ(j - gap);
                    else this.unSelect("j");
                }
                this.assign(j, temp, arr, { instructionId: ["h7"] });
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            h0: {
                line: `for (let gap = n >> 1; gap > 0; gap >>= 1) {`,
                indent: 0,
            },
            h1: { line: `for (let i = gap; i < n; i++) {`, indent: 1 },
            h2: { line: `const temp = arr[i];`, indent: 2 },
            h3: { line: `let j = i;`, indent: 2 },
            h4: {
                line: `while (j >= gap && arr[j - gap] > temp) {`,
                indent: 2,
            },
            h5: { line: `arr[j] = arr[j - gap];`, indent: 3 },
            h6: { line: `j -= gap;`, indent: 3 },
            he4: { line: `}`, indent: 2 },
            h7: { line: `arr[j] = temp;`, indent: 2 },
            he1: { line: `}`, indent: 1 },
            he0: { line: `}`, indent: 0 },
        };
    }
}
