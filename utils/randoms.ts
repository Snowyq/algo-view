import { isOneOf } from "./values";

export type Rng = () => number;

/** Seeded PRNG (mulberry32): same seed, same numbers on any machine. */
export function createRng(seed: number): Rng {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function randomSeed(): number {
    return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

/** Integer in [0, n). */
export function randomInt(rng: Rng, n: number): number {
    return Math.floor(rng() * n);
}

export function pick<T>(rng: Rng, items: ArrayLike<T>): T {
    return items[randomInt(rng, items.length)];
}

export const INPUT_PRESETS = [
    "random",
    "nearlySorted",
    "reversed",
    "fewUnique",
    "sawtooth",
    "organPipe",
] as const;

export type InputPreset = (typeof INPUT_PRESETS)[number];

export type InputConfig = {
    preset: InputPreset;
    length: number;
    min: number;
    max: number;
    seed: number;
};

export function isInputPreset(value: unknown): value is InputPreset {
    return isOneOf(INPUT_PRESETS, value);
}

/** Sort input in a given shape, values within [min, max]. */
export function generateInput({
    preset,
    length,
    min,
    max,
    seed,
}: InputConfig): number[] {
    const rng = createRng(seed);
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const span = hi - lo;
    const randomValue = (): number => randomInt(rng, span + 1) + lo;
    const at = (t: number): number => Math.round(lo + t * span);
    const n = Math.max(1, length);

    switch (preset) {
        case "random":
            return Array.from({ length: n }, randomValue);
        case "nearlySorted": {
            const values = Array.from({ length: n }, randomValue).sort(
                (a, b) => a - b
            );
            const swaps = Math.max(1, Math.round(n * 0.06));
            for (let i = 0; i < swaps; i += 1) {
                const a = randomInt(rng, n);
                const b = Math.min(n - 1, a + 1 + randomInt(rng, 3));
                [values[a], values[b]] = [values[b], values[a]];
            }
            return values;
        }
        case "reversed":
            return Array.from({ length: n }, randomValue).sort((a, b) => b - a);
        case "fewUnique": {
            const pool = Array.from({ length: 4 }, (_, i) => at((i + 1) / 4));
            return Array.from({ length: n }, () => pick(rng, pool));
        }
        case "sawtooth": {
            const teeth = Math.max(2, Math.round(n / 12));
            const size = Math.ceil(n / teeth);
            return Array.from({ length: n }, (_, i) =>
                at(((i % size) + 1) / size)
            );
        }
        case "organPipe": {
            const half = (n - 1) / 2 || 1;
            return Array.from({ length: n }, (_, i) =>
                at(1 - Math.abs(i - half) / half)
            );
        }
    }
}
