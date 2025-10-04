export function insertSorted(arr, num) {
	let left = 0;
	let right = arr.length;

	while (left < right) {
		const mid = Math.floor((left + right) / 2);
		if (arr[mid] < num) {
			left = mid + 1;
		} else {
			right = mid;
		}
	}
	arr.splice(left, 0, num); // Insert at the correct position
	return arr;
}
export function binarySearch(arr, value) {
	let left = 0;
	let right = arr.length - 1;

	while (left <= right) {
		const mid = Math.floor((left + right) / 2);
		if (arr[mid] === value) return mid;
		if (arr[mid] < value) left = mid + 1;
		else right = mid - 1;
	}

	return -1; // Not found
}

export function removeSorted(arr, value) {
	const index = binarySearch(arr, value);
	if (index !== -1) {
		arr.splice(index, 1);
	}
	return arr;
}

export function findClosest(arr, target) {
	if (arr.length === 0) return null;

	let left = 0;
	let right = arr.length - 1;

	while (left < right) {
		const mid = Math.floor((left + right) / 2);

		if (arr[mid] === target) return arr[mid];
		if (arr[mid] < target) left = mid + 1;
		else right = mid;
	}

	// After loop: `left` is the smallest index such that arr[left] >= target
	const l = left - 1 >= 0 ? arr[left - 1] : Number.NEGATIVE_INFINITY;
	const r = arr[left] ?? Number.POSITIVE_INFINITY;

	return Math.abs(target - l) <= Math.abs(target - r) ? l : r;
}
