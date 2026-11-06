import type { AlgorithmInstructions } from "../types";
import { BudgetedSortAlgorithm } from "./BudgetedSortAlgorithm";

/* Each value sleeps that many ms; whoever wakes first goes next. */
export class SleepSort extends BudgetedSortAlgorithm {
    run(arr: number[]): void {
        const sleepers = arr
            .map((value, index) => ({ value, index }))
            .sort((a, b) => a.value - b.value || a.index - b.index);

        // Everyone falls asleep at once.
        this.selectMany(
            arr.map((_, index) => ({
                index,
                options: { instructionId: ["l1"] },
            }))
        );

        // A wake-up shows only as the write into its slot.
        sleepers.forEach((sleeper, slot) => {
            this.spend();
            this.assign(slot, sleeper.value, arr, { instructionId: ["l2"] });
        });
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            l0: { line: `let k = 0;`, indent: 0 },
            l1: { line: `for (const value of [...arr]) {`, indent: 0 },
            l2: {
                line: `setTimeout(() => (arr[k++] = value), value);`,
                indent: 1,
            },
            le1: { line: `}`, indent: 0 },
        };
    }
}
