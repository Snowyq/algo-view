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
				this.select(j, {
					instructionId: j === 0 ? ["i0", "i1"] : ["i1"],
				});
				if (this.check(j, ">", j + 1, arr, { instructionId: ["i2"] })) {
					this.swap(j, j + 1, arr, { instructionId: ["i3"] });
				}
			}
		}
	}

	static rawSort(arr) {
		for (let i = 1; i < arr.length; i++) {
			for (let j = 0; j < arr.length - i; j++) {
				if (arr[j] > arr[j + 1]) {
					[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
				}
			}
		}
	}

	instructions() {
		const code = {
			i0: `for (let i = 1; i < arr.length; i++) {`,
			i1: `  for (let j = 0; j < arr.length - i; j++) {`,
			i2: `    if (arr[j] > arr[j + 1]) {`,
			i3: `      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];`,
			ie2: `    }`,
			ie1: `  }`,
			ie0: `}`,
		};
	}
}
