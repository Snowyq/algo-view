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

	static getInstructions() {
		const instructions = {
			i0: {
				line: `for (let i = 1; i < arr.length; i++) {`,
				indent: 0,
			},
			i1: {
				line: `for (let j = 0; j < arr.length - i; j++) {`,
				indent: 1,
			},
			i2: { line: `if (arr[j] > arr[j + 1]) {`, indent: 2 },
			i3: {
				line: `[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];`,
				indent: 3,
			},
			ie2: { line: `}`, indent: 2 },
			ie1: { line: `}`, indent: 1 },
			ie0: { line: `}`, indent: 0 },
		};
		return instructions;
	}
}
