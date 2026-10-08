import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

/*
 * Base for the joke algorithms. Steps are generated up front and kept in
 * memory, so an unbounded sort (bogo, slow sort) would never finish building.
 * Once the step budget is spent the algorithm gives up and says so in metrics.
 */

export const JOKE_SORT_STEP_BUDGET = 25000;

class BudgetSpent extends Error {}

// Steps are built inside the base constructor, before subclass fields are
// initialised, so the budget is static (set at class definition), not an
// instance field.
export class BudgetedSortAlgorithm extends SortAlgorithm {
    static stepBudget: number = JOKE_SORT_STEP_BUDGET;

    sort(arr: number[]): void {
        try {
            this.run(arr);
        } catch (error) {
            if (!(error instanceof BudgetSpent)) throw error;
            this.count("gaveUp", "Gave up");
        }
    }

    /** Throws once the step budget is used up; call it inside every loop. */
    spend(): void {
        const { stepBudget } = this.constructor as typeof BudgetedSortAlgorithm;
        if (this.steps.length >= stepBudget) throw new BudgetSpent();
    }

    random(max: number): number {
        return Math.floor(Math.random() * max);
    }

    /** Walks the array once; stops at the first pair out of order. */
    isSorted(arr: number[]): boolean {
        for (let i = 0; i < arr.length - 1; i++) {
            this.spend();
            this.countConditionChecks();
            this.countArrayAccess(2);
            if (!this.check(i, "<=", i + 1, arr, { instructionId: ["s2"] }))
                return false;
        }
        return true;
    }

    /** Source of isSorted(), appended to the code of algorithms that use it. */
    static isSortedInstructions(): AlgorithmInstructions {
        return {
            sb: { line: ``, indent: 0 },
            s0: { line: `function isSorted(arr) {`, indent: 0 },
            s1: {
                line: `for (let i = 0; i < arr.length - 1; i++) {`,
                indent: 1,
            },
            s2: { line: `if (arr[i] <= arr[i + 1]) continue;`, indent: 2 },
            s3: { line: `return false;`, indent: 2 },
            se1: { line: `}`, indent: 1 },
            s4: { line: `return true;`, indent: 1 },
            se0: { line: `}`, indent: 0 },
        };
    }

    // To implement in child instance
    run(arr: number[]): void {
        void arr;
    }
}
