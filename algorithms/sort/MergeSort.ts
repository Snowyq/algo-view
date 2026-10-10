import type { AlgorithmInstructions } from "../types";
import { SortAlgorithm } from "./SortAlgorithm";

export class MergeSort extends SortAlgorithm {
    name: string = "MergeSort";

    sort(array: number[]): void {
        const merge = (
            arr: number[],
            left: number,
            middle: number,
            right: number
        ): void => {
            // Length of both sorted aub arrays
            const l1 = middle - left + 1;
            const l2 = right - middle;

            // Create new subarrays
            const arr1: number[] = new Array(l1);
            const arr2: number[] = new Array(l2);

            // this.countSubArrays(2);

            // Assign values in subarrays
            this.countConditionChecks();
            for (let i = 0; i < l1; ++i) {
                this.countConditionChecks();
                this.countArrayAccess();
                arr1[i] = arr[left + i];
                this.select(left + i, { instructionId: ["g1"] });
            }
            this.countConditionChecks();
            for (let i = 0; i < l2; ++i) {
                this.countConditionChecks();
                this.countArrayAccess();
                arr2[i] = arr[middle + 1 + i];
                this.select(middle + 1 + i, { instructionId: ["g2"] });
            }

            // To traverse and modify main array
            let i = 0,
                j = 0,
                k = left;

            // Assign the smaller value for sorted output
            this.countConditionChecks(); //! off by one?
            while (i < l1 && j < l2) {
                this.countConditionChecks(3);
                if (arr1[i] < arr2[j]) {
                    // arr[k] = arr1[i];
                    this.assign(k, arr1[i], arr, { instructionId: ["g5"] });
                    ++i;
                } else {
                    // arr[k] = arr2[j];
                    this.assign(k, arr2[j], arr, { instructionId: ["g5"] });
                    j++;
                }
                k++;
            }
            // Update the remaining elements

            this.countConditionChecks();
            while (i < l1) {
                this.countConditionChecks();
                // arr[k] = arr1[i];
                this.countArrayAccess();
                this.assign(k, arr1[i], arr, { instructionId: ["g6"] });
                i++;
                k++;
            }

            this.countConditionChecks();
            while (j < l2) {
                this.countConditionChecks();
                // arr[k] = arr2[j];
                this.countArrayAccess();
                this.assign(k, arr2[j], arr, { instructionId: ["g7"] });
                j++;
                k++;
            }
        };

        // Function to implement merger sort in javaScript
        const mergeSort = (
            arr: number[],
            left: number,
            right: number
        ): void => {
            if (left >= right) {
                return;
            }

            // Middle index to create subarray halves
            const middle = left + Math.floor((right - left) / 2);
            const all: Array<{ index: number }> = Array.from(
                Array(right - left + 1),
                (_, index) => {
                    return { index: left + index };
                }
            );

            this.selectMany(
                all.map(({ index }) => ({
                    index,
                    options: { instructionId: ["m2"] },
                }))
            );
            this.select(middle, { instructionId: ["m2"] });
            // Apply mergeSort to both the halves
            this.countRecursiveCalls(2);
            mergeSort(arr, left, middle);
            mergeSort(arr, middle + 1, right);

            // Merge both sorted parts
            merge(arr, left, middle, right);
        };

        // Apply merge sort function
        mergeSort(array, 0, array.length - 1);
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            m0: { line: `function mergeSort(arr, left, right) {`, indent: 0 },
            m1: { line: `if (left >= right) return;`, indent: 1 },
            m2: {
                line: `const mid = left + ((right - left) >> 1);`,
                indent: 1,
            },
            m3: { line: `mergeSort(arr, left, mid);`, indent: 1 },
            m4: { line: `mergeSort(arr, mid + 1, right);`, indent: 1 },
            m5: { line: `merge(arr, left, mid, right);`, indent: 1 },
            me0: { line: `}`, indent: 0 },
            b0: { line: ``, indent: 0 },
            g0: { line: `function merge(arr, left, mid, right) {`, indent: 0 },
            g1: { line: `const a = arr.slice(left, mid + 1);`, indent: 1 },
            g2: { line: `const b = arr.slice(mid + 1, right + 1);`, indent: 1 },
            g3: { line: `let i = 0, j = 0, k = left;`, indent: 1 },
            g4: { line: `while (i < a.length && j < b.length) {`, indent: 1 },
            g5: {
                line: `arr[k++] = a[i] < b[j] ? a[i++] : b[j++];`,
                indent: 2,
            },
            ge4: { line: `}`, indent: 1 },
            g6: { line: `while (i < a.length) arr[k++] = a[i++];`, indent: 1 },
            g7: { line: `while (j < b.length) arr[k++] = b[j++];`, indent: 1 },
            ge0: { line: `}`, indent: 0 },
        };
    }

    static rawSort(array: number[]): void {
        function merge(
            arr: number[],
            left: number,
            middle: number,
            right: number
        ): void {
            // Length of both sorted aub arrays
            const l1 = middle - left + 1;
            const l2 = right - middle;

            // Create new subarrays
            const arr1: number[] = new Array(l1);
            const arr2: number[] = new Array(l2);

            // Assign values in subarrays
            for (let i = 0; i < l1; ++i) {
                arr1[i] = arr[left + i];
            }
            for (let i = 0; i < l2; ++i) {
                arr2[i] = arr[middle + 1 + i];
            }

            // To traverse and modify main array
            let i = 0,
                j = 0,
                k = left;

            // Assign the smaller value for sorted output
            while (i < l1 && j < l2) {
                if (arr1[i] < arr2[j]) {
                    arr[k] = arr1[i];
                    ++i;
                } else {
                    arr[k] = arr2[j];
                    j++;
                }
                k++;
            }
            // Update the remaining elements
            while (i < l1) {
                arr[k] = arr1[i];
                i++;
                k++;
            }
            while (j < l2) {
                arr[k] = arr2[j];
                j++;
                k++;
            }
        }

        // Function to implement merger sort in javaScript
        function mergeSort(arr: number[], left: number, right: number): void {
            if (left >= right) {
                return;
            }

            // Middle index to create subarray halves
            const middle = left + Math.floor((right - left) / 2);

            // Apply mergeSort to both the halves

            mergeSort(arr, left, middle);
            mergeSort(arr, middle + 1, right);

            // Merge both sorted parts
            merge(arr, left, middle, right);
        }

        // Apply merge sort function
        mergeSort(array, 0, array.length - 1);
    }
}

// let loopLength = l1 > l2 ? l1 : l2;
// for (let i = 0; i < loopLength; ++i) {
// 	let selections = [];
// 	if (l1 >= i) {
// 		arr1[i] = arr[left + i];
// 		selections.push({ index: left + i });
// 	}
// 	if (l2 >= i) {
// 		arr2[i] = arr[middle + 1 + i];
// 		selections.push({ index: middle + i + 1 });
// 	}

// 	this.selectMany(selections);
// }
