import type { AlgorithmInstructions } from "../types";
import { BudgetedSortAlgorithm } from "./BudgetedSortAlgorithm";

/* Shuffle everything, check, repeat. Expected O(n·n!). */
export class BogoSort extends BudgetedSortAlgorithm {
    run(arr: number[]): void {
        while (!this.isSorted(arr)) {
            this.count("shuffles", "Shuffles");
            for (let i = arr.length - 1; i > 0; i--) {
                this.spend();
                const j = this.random(i + 1);
                if (i !== j) this.swap(i, j, arr, { instructionId: ["b3"] });
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            b0: { line: `while (!isSorted(arr)) {`, indent: 0 },
            b1: { line: `// shuffle`, indent: 1 },
            b2: {
                line: `for (let i = arr.length - 1; i > 0; i--) {`,
                indent: 1,
            },
            b3: {
                line: `swap(arr, i, Math.floor(Math.random() * (i + 1)));`,
                indent: 2,
            },
            be2: { line: `}`, indent: 1 },
            be0: { line: `}`, indent: 0 },
            ...BudgetedSortAlgorithm.isSortedInstructions(),
        };
    }
}
