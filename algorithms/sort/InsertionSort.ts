import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

export class InsertionSort extends SortAlgorithm {
    sort(arr: number[]): number[] {
        for (let i = 1; i < arr.length; i++) {
            this.select(i, { mode: "perm", id: "i", instructionId: ["i0"] });
            this.countArrayAccess();
            const key = arr[i];
            let j = i - 1;
            this.countArrayAccess();
            while (
                j >= 0 &&
                this.checkWithValue(j, ">", key, arr, { instructionId: ["i3"] })
            ) {
                this.countArrayAccess(2);
                this.assign(j + 1, arr[j], arr, { instructionId: ["i4"] });
                j--;
            }
            this.countArrayAccess();
            this.assign(j + 1, key, arr, { instructionId: ["i6"] });
        }
        return arr;
    }

    static rawSort(arr: number[]): number[] {
        for (let i = 1; i < arr.length; i++) {
            const key = arr[i];
            let j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
        return arr;
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            i0: { line: `for (let i = 1; i < arr.length; i++) {`, indent: 0 },
            i1: { line: `const key = arr[i];`, indent: 1 },
            i2: { line: `let j = i - 1;`, indent: 1 },
            i3: { line: `while (j >= 0 && arr[j] > key) {`, indent: 1 },
            i4: { line: `arr[j + 1] = arr[j];`, indent: 2 },
            i5: { line: `j--;`, indent: 2 },
            ie3: { line: `}`, indent: 1 },
            i6: { line: `arr[j + 1] = key;`, indent: 1 },
            ie0: { line: `}`, indent: 0 },
        };
    }
}
