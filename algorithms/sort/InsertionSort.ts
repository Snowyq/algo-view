import { SortAlgorithm } from "./SortAlgorithm";

export class InsertionSort extends SortAlgorithm {

	sort(arr) {
		for (let i = 1; i < arr.length; i++) {
			this.select(i, { mode: "perm", id: "i" });
			this.countArrayAccess();
			let key = arr[i];
			let j = i - 1;
			this.countArrayAccess();
			while (j >= 0 && this.checkWithValue(j, ">", key, arr)) {
				this.countArrayAccess(2);
				this.assign(j + 1, arr[j], arr);
				j--;
			}
			this.countArrayAccess();
			this.assign(j + 1, key, arr);
		}
		return arr;
	}

	static rawSort(arr) {
		for (let i = 1; i < arr.length; i++) {
			let key = arr[i];
			let j = i - 1;
			while (j >= 0 && arr[j] > key) {
				arr[j + 1] = arr[j];
				j--;
			}
			arr[j + 1] = key;
		}
		return arr;
	}
}
