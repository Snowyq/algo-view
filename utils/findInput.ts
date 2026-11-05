import { createRng, pick, randomInt, type Rng } from "./randoms";
import { clamp, isOneOf } from "./values";

/*
 * Search input: a sorted array and a target. The shape matters:
 * interpolation search flies on evenly spaced values and crawls on skewed ones.
 */

export const FIND_PRESETS = ["even", "random", "duplicates", "skewed"] as const;
export type FindPreset = (typeof FIND_PRESETS)[number];

export const FIND_TARGETS = ["present", "missing", "first", "last"] as const;
export type FindTarget = (typeof FIND_TARGETS)[number];

export type FindConfig = {
    preset: FindPreset;
    length: number;
    target: FindTarget;
    seed: number;
};

export type FindInput = {
    values: number[];
    target: number;
};

export const FIND_MIN_LENGTH = 8;
export const FIND_MAX_LENGTH = 512;
export const FIND_DEFAULT_LENGTH = 48;

export function isFindPreset(value: unknown): value is FindPreset {
    return isOneOf(FIND_PRESETS, value);
}

export function isFindTarget(value: unknown): value is FindTarget {
    return isOneOf(FIND_TARGETS, value);
}

function sortedValues(rng: Rng, preset: FindPreset, n: number): number[] {
    const ascending = (a: number, b: number): number => a - b;
    switch (preset) {
        case "even": {
            // Gaps of 2 leave room for a truly missing value.
            const base = 2 + randomInt(rng, 4) * 2;
            return Array.from({ length: n }, (_, i) => base + i * 2);
        }
        case "random":
            return Array.from(
                { length: n },
                () => 1 + randomInt(rng, n * 3)
            ).sort(ascending);
        case "duplicates": {
            const distinct = Math.max(3, Math.round(n / 8));
            return Array.from(
                { length: n },
                () => 2 * (1 + randomInt(rng, distinct))
            ).sort(ascending);
        }
        case "skewed":
            // Slow start, then a steep climb: worst case for guessing by value.
            return Array.from({ length: n }, (_, i) =>
                Math.round(2 + Math.pow(1.09, i) + i)
            );
    }
}

/** A value inside the range that the array does not contain. */
function missingValue(rng: Rng, values: number[], last: number): number {
    const present = new Set(values);
    const candidates: number[] = [];
    for (let v = values[0] + 1; v < last; v += 1) {
        if (!present.has(v)) candidates.push(v);
        if (candidates.length > 400) break;
    }
    return candidates.length ? pick(rng, candidates) : last + 1;
}

// n may be fractional (length is not rounded), so index by n.
function targetValue(
    rng: Rng,
    target: FindTarget,
    values: number[],
    n: number
): number {
    switch (target) {
        case "first":
            return values[0];
        case "last":
            return values[n - 1];
        case "missing":
            return missingValue(rng, values, values[n - 1]);
        case "present":
        default:
            return values[randomInt(rng, n)];
    }
}

export function generateFindInput({
    preset,
    length,
    target,
    seed,
}: FindConfig): FindInput {
    const rng = createRng(seed);
    const n = Math.round(clamp(length, FIND_MIN_LENGTH, FIND_MAX_LENGTH));
    const values = sortedValues(rng, preset, n);
    return { values, target: targetValue(rng, target, values, n) };
}
