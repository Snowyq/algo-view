import { describe, expect, it } from "vitest";
import { findClosest, insertSorted } from "./arrays";

describe("insertSorted", () => {
    it("keeps the array sorted", () => {
        const arr: number[] = [];
        [5, 1, 4, 1, 9, 0].forEach((n) => insertSorted(arr, n));
        expect(arr).toEqual([0, 1, 1, 4, 5, 9]);
    });
});

describe("findClosest", () => {
    const arr = [0, 10, 20, 30];

    it("returns null for an empty array", () => {
        expect(findClosest([], 3)).toBeNull();
    });

    it.each([
        [10, 10],
        [12, 10],
        [18, 20],
        [15, 10],
        [-5, 0],
        [99, 30],
    ])("closest to %d is %d", (target, expected) => {
        expect(findClosest(arr, target)).toBe(expected);
    });
});
