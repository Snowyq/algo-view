import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

export class GnomeSort extends SortAlgorithm {
    sort(arr: number[]): void {
        let pos = 0;
        this.countConditionChecks();
        while (pos < arr.length) {
            this.countConditionChecks();
            this.select(pos, {
                mode: "perm",
                id: "gnome",
                instructionId: ["g1"],
            });
            if (pos === 0) {
                pos++;
                continue;
            }
            this.countArrayAccess(2);
            if (
                this.check(pos, ">=", pos - 1, arr, { instructionId: ["g2"] })
            ) {
                pos++;
            } else {
                this.swap(pos, pos - 1, arr, { instructionId: ["g5"] });
                pos--;
            }
        }
        this.unSelect("gnome");
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            g0: { line: `let pos = 0;`, indent: 0 },
            g1: { line: `while (pos < arr.length) {`, indent: 0 },
            g2: {
                line: `if (pos === 0 || arr[pos] >= arr[pos - 1]) {`,
                indent: 1,
            },
            g3: { line: `pos++;`, indent: 2 },
            g4: { line: `} else {`, indent: 1 },
            g5: { line: `swap(arr, pos, pos - 1);`, indent: 2 },
            g6: { line: `pos--;`, indent: 2 },
            ge2: { line: `}`, indent: 1 },
            ge1: { line: `}`, indent: 0 },
        };
    }
}
