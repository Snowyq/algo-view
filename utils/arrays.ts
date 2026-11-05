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

/** Largest value in a sorted array that is <= target, or null. */
export function findFloor(arr: number[], target: number): number | null {
    let left = 0;
    let right = arr.length - 1;
    let floor: number | null = null;
    while (left <= right) {
        const mid = (left + right) >> 1;
        if (arr[mid] <= target) {
            floor = arr[mid];
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return floor;
}
