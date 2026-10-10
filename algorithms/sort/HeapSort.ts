import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

export class HeapSort extends SortAlgorithm {
    sort(arr: number[]): void {
        const siftDown = (start: number, end: number): void => {
            let root = start;
            this.countConditionChecks();
            while (2 * root + 1 <= end) {
                this.countConditionChecks();
                const child = 2 * root + 1;
                let largest = root;

                this.countArrayAccess(2);
                if (
                    this.check(largest, "<", child, arr, {
                        instructionId: ["s4"],
                    })
                )
                    largest = child;
                this.countConditionChecks();
                if (child + 1 <= end) {
                    this.countArrayAccess(2);
                    if (
                        this.check(largest, "<", child + 1, arr, {
                            instructionId: ["s5"],
                        })
                    )
                        largest = child + 1;
                }

                this.countConditionChecks();
                if (largest === root) return;
                this.swap(root, largest, arr, { instructionId: ["s7"] });
                root = largest;
            }
        };

        const n = arr.length;
        for (let start = Math.floor(n / 2) - 1; start >= 0; start--) {
            this.countConditionChecks();
            siftDown(start, n - 1);
        }

        for (let end = n - 1; end > 0; end--) {
            this.countConditionChecks();
            this.select(end, {
                mode: "perm",
                id: "end",
                instructionId: ["h3"],
            });
            this.swap(0, end, arr, { instructionId: ["h4"] });
            siftDown(0, end - 1);
        }
        this.unSelect("end");
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            h0: { line: `function heapSort(arr) {`, indent: 0 },
            h1: { line: `const n = arr.length;`, indent: 1 },
            h2: {
                line: `for (let s = (n >> 1) - 1; s >= 0; s--) siftDown(arr, s, n - 1);`,
                indent: 1,
            },
            h3: { line: `for (let end = n - 1; end > 0; end--) {`, indent: 1 },
            h4: { line: `swap(arr, 0, end);`, indent: 2 },
            h5: { line: `siftDown(arr, 0, end - 1);`, indent: 2 },
            he3: { line: `}`, indent: 1 },
            he0: { line: `}`, indent: 0 },
            b0: { line: ``, indent: 0 },
            s0: { line: `function siftDown(arr, root, end) {`, indent: 0 },
            s1: { line: `while (2 * root + 1 <= end) {`, indent: 1 },
            s2: { line: `const child = 2 * root + 1;`, indent: 2 },
            s3: { line: `let largest = root;`, indent: 2 },
            s4: {
                line: `if (arr[largest] < arr[child]) largest = child;`,
                indent: 2,
            },
            s5: {
                line: `if (child + 1 <= end && arr[largest] < arr[child + 1]) largest = child + 1;`,
                indent: 2,
            },
            s6: { line: `if (largest === root) return;`, indent: 2 },
            s7: { line: `swap(arr, root, largest);`, indent: 2 },
            s8: { line: `root = largest;`, indent: 2 },
            se1: { line: `}`, indent: 1 },
            se0: { line: `}`, indent: 0 },
        };
    }
}
