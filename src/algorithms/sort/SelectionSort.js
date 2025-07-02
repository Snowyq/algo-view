import { SortAlgorithm } from "./SortAlgorithm";

export class SelectionSort extends SortAlgorithm {
	constructor(array) {
		super(array);
	}

	sort(arr) {
		let n = arr.length;
		for (let i = 0; i < n; i++) {
			let minIdx = i;
			this.selectMany([
				{ index: i, mode: "perm", id: "i" },
				{ index: i, mode: "perm", id: "minIdx" },
			]);
			for (let j = i + 1; j < n; j++) {
				if (this.check(j, "<", minIdx, arr)) {
					minIdx = j;
					this.select(minIdx, "perm", "minIdx");
				}
			}
			if (minIdx !== arr.length - 1)
				this.select(minIdx, "perm", "minIdx");
			if (i !== minIdx) this.swap(i, minIdx, arr);
		}
	}

	sortRaw(arr) {
		let n = arr.length;
		for (let i = 0; i < n; i++) {
			let minIdx = i;
			for (let j = i + 1; j < n; j++) {
				if (arr[j] < arr[minIdx]) {
					minIdx = j;
				}
			}
			[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
		}
		return arr;
	}
}
