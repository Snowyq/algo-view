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
				{
					index: i,

					options: { mode: "perm", id: "i", instructionId: ["i1"] },
				},
				{
					index: i,

					options: {
						mode: "perm",
						id: "minIdx",
						instructionId: ["i1"],
					},
				},
			]);
			for (let j = i + 1; j < n; j++) {
				if (
					this.check(j, "<", minIdx, arr, { instructionId: ["i3"] })
				) {
					minIdx = j;
					this.select(minIdx, {
						mode: "perm",
						id: "minIdx",
						instructionId: ["i4"],
					});
				}
			}
			if (minIdx !== arr.length - 1)
				this.select(minIdx, {
					mode: "perm",
					id: "minIdx",
					instructionId: ["i4"],
				});
			if (i !== minIdx)
				this.swap(i, minIdx, arr, { instructionId: ["i5"] });
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
