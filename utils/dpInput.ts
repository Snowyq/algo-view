import { createRng } from "./randoms";

/*
 * Dynamic-programming input: one seeded bundle every DP algorithm can
 * draw from, so all panels work on related data. String algorithms use
 * a/b, knapsack uses items/capacity, coin change uses coins/amount, LIS
 * uses sequence.
 */

export const DP_PRESETS = ["words", "dna", "letters"] as const;
export type DpPreset = (typeof DP_PRESETS)[number];

export type DpConfig = {
    preset: DpPreset;
    /** Rough problem size: string length, item count… */
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
    return (
        typeof value === "string" &&
        (DP_PRESETS as readonly string[]).includes(value)
    );
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

export function generateDpInput({ preset, size, seed }: DpConfig): DpInput {
    const rng = createRng(seed);
    const n = Math.max(DP_MIN_SIZE, Math.min(DP_MAX_SIZE, Math.round(size)));
    const letters = (alphabet: string, length: number): string =>
        Array.from(
            { length },
            () => alphabet[Math.floor(rng() * alphabet.length)]
        ).join("");

    let a: string;
    let b: string;
    if (preset === "words") {
        const pair = WORDS[Math.floor(rng() * WORDS.length)];
        a = pair[0].slice(0, n + 2);
        b = pair[1].slice(0, n + 2);
    } else if (preset === "dna") {
        a = letters("ACGT", n);
        b = letters("ACGT", n);
    } else {
        a = letters("abcdefgh", n);
        b = letters("abcdefgh", n);
    }

    const itemCount = Math.max(3, Math.min(8, Math.round(n * 0.7)));
    const items = Array.from({ length: itemCount }, () => ({
        weight: 1 + Math.floor(rng() * 6),
        value: 1 + Math.floor(rng() * 12),
    }));
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const capacity = Math.max(4, Math.min(16, Math.round(totalWeight * 0.5)));

    // Coins that make greedy fail sometimes (e.g. 1, 3, 4 for 6).
    const coinSets = [
        [1, 3, 4],
        [1, 5, 6, 9],
        [2, 3, 7],
        [1, 4, 6],
    ];
    const coins = coinSets[Math.floor(rng() * coinSets.length)];
    const amount = Math.max(6, Math.min(18, n + 6 + Math.floor(rng() * 4)));

    const sequence = Array.from({ length: Math.min(14, n + 4) }, () =>
        Math.floor(rng() * 20)
    );

    return { a, b, items, capacity, coins, amount, sequence };
}
