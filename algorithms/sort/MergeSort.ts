import { SortAlgorithm } from "./SortAlgorithm";

export class MergeSort extends SortAlgorithm {
    name = "MergeSort";
    complexity = "O(n^2)";

    sort(array) {
        const merge = (arr, left, middle, right) => {
            // Length of both sorted aub arrays
            const l1 = middle - left + 1;
            const l2 = right - middle;

            // Create new subarrays
            const arr1 = new Array(l1);
            const arr2 = new Array(l2);

            // this.countSubArrays(2);

            // Assign values in subarrays
            this.countConditionChecks();
            for (let i = 0; i < l1; ++i) {
                this.countConditionChecks();
                this.countArrayAccess();
                arr1[i] = arr[left + i];
                this.select(left + i);
            }
            this.countConditionChecks();
            for (let i = 0; i < l2; ++i) {
                this.countConditionChecks();
                this.countArrayAccess();
                arr2[i] = arr[middle + 1 + i];
                this.select(middle + 1 + i);
            }

            // To traverse and modify main array
            let i = 0,
                j = 0,
                k = left;

            // Assign the smaller value for sorted output
            this.countConditionChecks();
            while (i < l1 && j < l2) {
                this.countConditionChecks(2);
                if (arr1[i] < arr2[j]) {
                    // arr[k] = arr1[i];
                    this.assign(k, arr1[i], arr);
                    ++i;
                } else {
                    // arr[k] = arr2[j];
                    this.assign(k, arr2[j], arr);
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
                this.assign(k, arr1[i], arr);
                i++;
                k++;
            }

            this.countConditionChecks();
            while (j < l2) {
                this.countConditionChecks();
                // arr[k] = arr2[j];
                this.countArrayAccess();
                this.assign(k, arr2[j], arr);
                j++;
                k++;
            }
        };

        // Function to implement merger sort in javaScript
        const mergeSort = (arr, left, right) => {
            if (left >= right) {
                return;
            }

            // Middle index to create subarray halves
            const middle = left + Math.floor((right - left) / 2);
            const all = Array.from(Array(right - left), (_, index) => {
                return { index: left + index };
            });

            this.selectMany(all);
            this.select(middle);
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

    static rawSort(array) {
        function merge(arr, left, middle, right) {
            // Length of both sorted aub arrays
            const l1 = middle - left + 1;
            const l2 = right - middle;

            // Create new subarrays
            const arr1 = new Array(l1);
            const arr2 = new Array(l2);

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
        function mergeSort(arr, left, right) {
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
