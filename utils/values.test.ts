import { describe, expect, it } from "vitest";
import { clamp, isOneOf } from "./values";

describe("clamp", () => {
    it.each([
        [5, 0, 10, 5],
        [-3, 0, 10, 0],
        [42, 0, 10, 10],
        [0, 0, 0, 0],
    ])("clamp(%d, %d, %d) = %d", (value, min, max, expected) => {
        expect(clamp(value, min, max)).toBe(expected);
    });
});

describe("isOneOf", () => {
    const COLORS = ["red", "green"] as const;

    it("accepts listed strings", () => {
        expect(isOneOf(COLORS, "red")).toBe(true);
    });

    it.each(["blue", 1, null, undefined, {}])("rejects %j", (value) => {
        expect(isOneOf(COLORS, value)).toBe(false);
    });
});
