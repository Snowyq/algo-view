import { describe, expect, it } from "vitest";
import {
    createRng,
    generateInput,
    INPUT_PRESETS,
    isInputPreset,
    pick,
    randomInt,
} from "./randoms";

describe("createRng", () => {
    it("returns the same sequence for the same seed", () => {
        const a = createRng(123);
        const b = createRng(123);
        expect(Array.from({ length: 20 }, a)).toEqual(
            Array.from({ length: 20 }, b)
        );
    });

    it("returns different sequences for different seeds", () => {
        expect(createRng(1)()).not.toBe(createRng(2)());
    });

    it("stays within [0, 1)", () => {
        const rng = createRng(99);
        for (let i = 0; i < 10000; i += 1) {
            const value = rng();
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThan(1);
        }
    });

    it("spreads values roughly evenly", () => {
        const rng = createRng(5);
        const buckets = new Array<number>(10).fill(0);
        for (let i = 0; i < 10000; i += 1) buckets[randomInt(rng, 10)] += 1;
        buckets.forEach((count) => {
            expect(count).toBeGreaterThan(850);
            expect(count).toBeLessThan(1150);
        });
    });

    it("pick only returns items from the list", () => {
        const rng = createRng(3);
        for (let i = 0; i < 100; i += 1)
            expect("abc").toContain(pick(rng, "abc"));
    });
});

describe("generateInput", () => {
    it.each(INPUT_PRESETS)("%s is deterministic for a seed", (preset) => {
        const config = { preset, length: 50, min: 1, max: 30, seed: 77 };
        expect(generateInput(config)).toEqual(generateInput(config));
    });

    it.each(INPUT_PRESETS)("%s respects length and value range", (preset) => {
        const values = generateInput({
            preset,
            length: 64,
            min: 5,
            max: 40,
            seed: 1,
        });
        expect(values).toHaveLength(64);
        values.forEach((v) => {
            expect(v).toBeGreaterThanOrEqual(5);
            expect(v).toBeLessThanOrEqual(40);
            expect(Number.isInteger(v)).toBe(true);
        });
    });

    it("reversed input is non-increasing", () => {
        const values = generateInput({
            preset: "reversed",
            length: 30,
            min: 1,
            max: 99,
            seed: 4,
        });
        values
            .slice(1)
            .forEach((v, i) => expect(v).toBeLessThanOrEqual(values[i]));
    });

    it("few unique input uses at most four values", () => {
        const values = generateInput({
            preset: "fewUnique",
            length: 80,
            min: 1,
            max: 99,
            seed: 4,
        });
        expect(new Set(values).size).toBeLessThanOrEqual(4);
    });

    it("swaps min and max when given the wrong way round", () => {
        const values = generateInput({
            preset: "random",
            length: 40,
            min: 20,
            max: 10,
            seed: 2,
        });
        values.forEach((v) => expect(v >= 10 && v <= 20).toBe(true));
    });

    it("always returns at least one value", () => {
        expect(
            generateInput({
                preset: "random",
                length: 0,
                min: 1,
                max: 5,
                seed: 1,
            })
        ).toHaveLength(1);
    });

    it("recognises presets", () => {
        expect(isInputPreset("organPipe")).toBe(true);
        expect(isInputPreset("shuffled")).toBe(false);
    });
});
