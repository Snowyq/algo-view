import { SortAlgorithm } from "./SortAlgorithm";

export class ShellSort extends SortAlgorithm {

	sort(arr) {
		let n = arr.length;

		// Start with a big gap, then reduce the gap
		this.countConditionChecks();
		for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
			this.countConditionChecks();

			// Do a gapped insertion sort for this gap size.
			this.countConditionChecks();
			for (let i = gap; i < n; i++) {
				this.countConditionChecks();

				this.countArrayAccess();
				this.select(i, { mode: "perm", id: "i" });
				let temp = arr[i];

				let j = i;
				this.countConditionChecks();

				if (arr[j - gap] > temp) {
					this.select(j - gap, { mode: "perm", id: "j" });
				}

				while (
					j >= gap &&
					this.checkWithValue(j - gap, ">", temp, arr)
				) {
					this.countConditionChecks();
					// arr[j] = arr[j - gap];
					this.copy(j, j - gap, arr);
					j -= gap;

					if (arr[j - gap] > temp) {
						this.select(j - gap, { mode: "perm", id: "j" });
					} else {
						this.unSelect("j");
					}
				}
				// arr[j] = temp;
				this.assign(j, temp, arr);
			}
		}
	}

	rawSort(arr) {
		let n = arr.length;

		// Start with a big gap, then reduce the gap
		for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
			// Do a gapped insertion sort for this gap size.
			for (let i = gap; i < n; i++) {
				let temp = arr[i];
				let j = i;
				while (j >= gap && arr[j - gap] > temp) {
					arr[j] = arr[j - gap];
					j -= gap;
				}
				arr[j] = temp;
			}
		}
	}
}
