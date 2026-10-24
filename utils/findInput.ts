import { createRng } from "./randoms";

/*
 * Search input: a sorted array and the value to look for. The shape of
 * the data matters a lot here: interpolation search flies on evenly
 * spaced values and crawls on skewed ones.
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
    return (
        typeof value === "string" &&
        (FIND_PRESETS as readonly string[]).includes(value)
    );
}

export function isFindTarget(value: unknown): value is FindTarget {
    return (
        typeof value === "string" &&
        (FIND_TARGETS as readonly string[]).includes(value)
    );
}

export function generateFindInput({
    preset,
    length,
    target,
    seed,
}: FindConfig): FindInput {
    const rng = createRng(seed);
    const n = Math.max(FIND_MIN_LENGTH, Math.min(FIND_MAX_LENGTH, length));
    let values: number[];

    switch (preset) {
        case "even": {
            // Gaps of 2 leave room for a value that is truly missing.
            const step = 2;
            const base = 2 + Math.floor(rng() * 4) * 2;
            values = Array.from({ length: n }, (_, i) => base + i * step);
            break;
        }
        case "random": {
            values = Array.from(
                { length: n },
                () => 1 + Math.floor(rng() * n * 3)
            );
            values.sort((a, b) => a - b);
            break;
        }
        case "duplicates": {
            const distinct = Math.max(3, Math.round(n / 8));
            values = Array.from(
                { length: n },
                () => 2 * (1 + Math.floor(rng() * distinct))
            ).sort((a, b) => a - b);
            break;
        }
        case "skewed": {
            // Slow start, then a steep climb: the worst case for guessing
            // a position from the value.
            values = Array.from({ length: n }, (_, i) =>
                Math.round(2 + Math.pow(1.09, i) + i)
            );
            break;
        }
    }

    const present = new Set(values);
    let goal: number;
    switch (target) {
        case "first":
            goal = values[0];
            break;
        case "last":
            goal = values[n - 1];
            break;
        case "missing": {
            // A value inside the range that the array does not contain.
            const candidates: number[] = [];
            for (let v = values[0] + 1; v < values[n - 1]; v += 1) {
                if (!present.has(v)) candidates.push(v);
                if (candidates.length > 400) break;
            }
            goal = candidates.length
                ? candidates[Math.floor(rng() * candidates.length)]
                : values[n - 1] + 1;
            break;
        }
        case "present":
        default:
            goal = values[Math.floor(rng() * n)];
    }
    return { values, target: goal };
}
