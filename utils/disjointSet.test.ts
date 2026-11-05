import { describe, expect, it } from "vitest";
import { DisjointSet } from "./disjointSet";

describe("DisjointSet", () => {
    it("starts with every element in its own set", () => {
        const sets = new DisjointSet(4);
        expect([0, 1, 2, 3].map((i) => sets.find(i))).toEqual([0, 1, 2, 3]);
    });

    it("joins sets and reports when they were already joined", () => {
        const sets = new DisjointSet(5);
        expect(sets.union(0, 1)).toBe(true);
        expect(sets.union(1, 2)).toBe(true);
        expect(sets.union(0, 2)).toBe(false);
        expect(sets.find(0)).toBe(sets.find(2));
        expect(sets.find(3)).not.toBe(sets.find(0));
    });

    it("handles long chains", () => {
        const n = 10000;
        const sets = new DisjointSet(n);
        for (let i = 1; i < n; i += 1) sets.union(i - 1, i);
        expect(sets.find(0)).toBe(sets.find(n - 1));
    });
});
