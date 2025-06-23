import { SortAlgorithm } from "./SortAlgorithm";

export class BubbleSort extends SortAlgorithm {
	name = "BubbleSort";
	complexity = "O(n^2)";

	constructor(array) {
		super(array);
	}

	sort(arr) {
		for (let i = 1; i < arr.length; i++) {
			for (let j = 0; j < arr.length - i; j++) {
				this.select(j, arr);
				if (this.check(j, ">", j + 1, arr)) {
					this.swap(j, j + 1, arr);
				}
			}
		}
	}

	static rawSort(arr) {
		for (let i = 1; i < arr.length; i++) {
			for (let j = 0; j < arr.length - i; j++) {
				if ((arr[j], arr[j + 1])) {
					[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
				}
			}
		}
	}
}
