import type { AlgorithmInstructions } from "../types";
import { BudgetedSortAlgorithm } from "./BudgetedSortAlgorithm";

/* Swap two random items, check, repeat. Bogo's lazier cousin. */
export class BozoSort extends BudgetedSortAlgorithm {
    run(arr: number[]): void {
        while (!this.isSorted(arr)) {
            this.spend();
            const a = this.random(arr.length);
            const b = this.random(arr.length);
            this.count("gambles", "Gambles");
            if (a !== b) this.swap(a, b, arr, { instructionId: ["z2"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            z0: { line: `while (!isSorted(arr)) {`, indent: 0 },
            z1: { line: `const a = random(n), b = random(n);`, indent: 1 },
            z2: { line: `if (a !== b) swap(arr, a, b);`, indent: 1 },
            ze0: { line: `}`, indent: 0 },
            ...BudgetedSortAlgorithm.isSortedInstructions(),
        };
    }
}
