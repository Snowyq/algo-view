import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

/* LSD radix sort, base 10. Inputs are non-negative integers. */
export class RadixSort extends SortAlgorithm {
    sort(arr: number[]): void {
        const max = Math.max(...arr);
        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            this.countConditionChecks();
            const buckets: number[][] = Array.from({ length: 10 }, () => []);

            for (let i = 0; i < arr.length; i++) {
                this.countArrayAccess();
                this.select(i, { instructionId: ["r3"] });
                buckets[Math.floor(arr[i] / exp) % 10].push(arr[i]);
            }

            let k = 0;
            for (const bucket of buckets) {
                for (const value of bucket) {
                    this.assign(k, value, arr, { instructionId: ["r6"] });
                    k++;
                }
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            r0: { line: `const max = Math.max(...arr);`, indent: 0 },
            r1: {
                line: `for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {`,
                indent: 0,
            },
            r2: {
                line: `const buckets = Array.from({ length: 10 }, () => []);`,
                indent: 1,
            },
            r3: {
                line: `for (const v of arr) buckets[Math.floor(v / exp) % 10].push(v);`,
                indent: 1,
            },
            r4: { line: `let k = 0;`, indent: 1 },
            r5: { line: `for (const bucket of buckets)`, indent: 1 },
            r6: { line: `for (const v of bucket) arr[k++] = v;`, indent: 2 },
            re1: { line: `}`, indent: 0 },
        };
    }
}
