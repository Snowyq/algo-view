import { describe, expect, it } from "vitest";
import { MinHeap } from "./minHeap";
import { createRng, randomInt } from "./randoms";

const drain = (heap: MinHeap): number[] => {
    const out: number[] = [];
    while (heap.size > 0) out.push(heap.pop()!);
    return out;
};

describe("MinHeap", () => {
    it("pops undefined when empty", () => {
        expect(new MinHeap().pop()).toBeUndefined();
    });

    it("pops values in priority order", () => {
        const heap = new MinHeap();
        [5, 1, 4, 2, 3].forEach((p) => heap.push(p, p * 10));
        expect(drain(heap)).toEqual([10, 20, 30, 40, 50]);
    });

    it("breaks ties on the tie value", () => {
        const heap = new MinHeap();
        heap.push(1, 100, 3);
        heap.push(1, 200, 1);
        heap.push(1, 300, 2);
        expect(drain(heap)).toEqual([200, 300, 100]);
    });

    it("works as a heap sort on random priorities", () => {
        const rng = createRng(11);
        const priorities = Array.from({ length: 500 }, () =>
            randomInt(rng, 1000)
        );
        const heap = new MinHeap();
        priorities.forEach((p) => heap.push(p, p));
        expect(heap.size).toBe(500);
        expect(drain(heap)).toEqual(priorities.slice().sort((a, b) => a - b));
    });
});
