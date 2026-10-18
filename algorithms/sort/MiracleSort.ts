import type { AlgorithmInstructions } from "../types";
import { BudgetedSortAlgorithm } from "./BudgetedSortAlgorithm";

const PRAYERS = 5;

/* Checks whether the array is sorted, then waits for cosmic rays. */
export class MiracleSort extends BudgetedSortAlgorithm {
    run(arr: number[]): void {
        for (let i = 0; i < PRAYERS; i++) {
            this.count("prayers", "Prayers");
            if (this.isSorted(arr)) return;
        }
        this.count("gaveUp", "Gave up");
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            m0: {
                line: `for (let prayer = 0; prayer < 5; prayer++) {`,
                indent: 0,
            },
            m1: { line: `if (isSorted(arr)) return;`, indent: 1 },
            m2: {
                line: `// wait for a cosmic ray to flip the right bits`,
                indent: 1,
            },
            me0: { line: `}`, indent: 0 },
            ...BudgetedSortAlgorithm.isSortedInstructions(),
        };
    }
}
