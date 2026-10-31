export function insertSorted(arr: number[], num: number): number[] {
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
    arr.splice(left, 0, num);
    return arr;
}

export function findClosest(arr: number[], target: number): number | null {
    if (arr.length === 0) return null;

    let left = 0;
    let right = arr.length - 1;

    while (left < right) {
        const mid = Math.floor((left + right) / 2);

        if (arr[mid] === target) return arr[mid];
        if (arr[mid] < target) left = mid + 1;
        else right = mid;
    }

    // left is now the first index with arr[left] >= target.
    const l = left - 1 >= 0 ? arr[left - 1] : Number.NEGATIVE_INFINITY;
    const r = arr[left] ?? Number.POSITIVE_INFINITY;

    return Math.abs(target - l) <= Math.abs(target - r) ? l : r;
}
