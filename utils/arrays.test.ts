import { describe, expect, it } from "vitest";
import { findFloor, insertSorted } from "./arrays";

describe("insertSorted", () => {
    it("keeps the array sorted", () => {
        const arr: number[] = [];
        [5, 1, 4, 1, 9, 0].forEach((n) => insertSorted(arr, n));
        expect(arr).toEqual([0, 1, 1, 4, 5, 9]);
    });
});

describe("findFloor", () => {
    const arr = [0, 10, 20, 30];

    it("returns null for an empty array", () => {
        expect(findFloor([], 3)).toBeNull();
    });

    it("returns null when every value is above the target", () => {
        expect(findFloor(arr, -5)).toBeNull();
    });

    it.each([
        [10, 10],
        [12, 10],
        [18, 10],
        [20, 20],
        [99, 30],
    ])("floor of %d is %d", (target, expected) => {
        expect(findFloor(arr, target)).toBe(expected);
    });
});
