import { createRng, pick, randomInt, type Rng } from "./randoms";
import { clamp, isOneOf } from "./values";

/*
 * One seeded bundle shared by every DP algorithm: strings use a/b,
 * knapsack items/capacity, coin change coins/amount, LIS the sequence.
 */

export const DP_PRESETS = ["words", "dna", "letters"] as const;
export type DpPreset = (typeof DP_PRESETS)[number];

export type DpConfig = {
    preset: DpPreset;
    /** Rough problem size (string length, item count). */
    size: number;
    seed: number;
};

export type DpInput = {
    a: string;
    b: string;
    items: Array<{ weight: number; value: number }>;
    capacity: number;
    coins: number[];
    amount: number;
    sequence: number[];
};

export const DP_MIN_SIZE = 4;
export const DP_MAX_SIZE = 16;
export const DP_DEFAULT_SIZE = 8;

export function isDpPreset(value: unknown): value is DpPreset {
    return isOneOf(DP_PRESETS, value);
}

const WORDS = [
    ["kitten", "sitting"],
    ["sunday", "saturday"],
    ["algorithm", "altruistic"],
    ["intention", "execution"],
    ["dynamic", "dramatic"],
    ["pixel", "pickle"],
    ["sorting", "starting"],
    ["horse", "rose"],
    ["playground", "background"],
    ["distance", "instance"],
];

// Sets where greedy sometimes fails, e.g. {1, 3, 4} for 6.
const COIN_SETS = [
    [1, 3, 4],
    [1, 5, 6, 9],
    [2, 3, 7],
    [1, 4, 6],
];

function wordPair(rng: Rng, preset: DpPreset, n: number): [string, string] {
    const letters = (alphabet: string): string =>
        Array.from({ length: n }, () => pick(rng, alphabet)).join("");
    if (preset === "words") {
        const [a, b] = pick(rng, WORDS);
        return [a.slice(0, n + 2), b.slice(0, n + 2)];
    }
    const alphabet = preset === "dna" ? "ACGT" : "abcdefgh";
    return [letters(alphabet), letters(alphabet)];
}

export function generateDpInput({ preset, size, seed }: DpConfig): DpInput {
    const rng = createRng(seed);
    const n = clamp(Math.round(size), DP_MIN_SIZE, DP_MAX_SIZE);
    const [a, b] = wordPair(rng, preset, n);

    const itemCount = clamp(Math.round(n * 0.7), 3, 8);
    const items = Array.from({ length: itemCount }, () => ({
        weight: 1 + randomInt(rng, 6),
        value: 1 + randomInt(rng, 12),
    }));
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const capacity = clamp(Math.round(totalWeight * 0.5), 4, 16);

    const coins = pick(rng, COIN_SETS);
    const amount = clamp(n + 6 + randomInt(rng, 4), 6, 18);

    const sequence = Array.from({ length: Math.min(14, n + 4) }, () =>
        randomInt(rng, 20)
    );

    return { a, b, items, capacity, coins, amount, sequence };
}
