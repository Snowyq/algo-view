import { createRng } from "./randoms";

/*
 * Tree input: distinct keys inserted one by one. The order is what
 * matters: random keys give a bushy BST, ascending keys turn a plain BST
 * into a linked list, zigzag (outside in) into a zigzag chain. Balanced
 * trees shrug both off, which is the point of the comparison.
 */

export const TREE_PRESETS = ["random", "ascending", "zigzag"] as const;
export type TreePreset = (typeof TREE_PRESETS)[number];

export type TreeConfig = { preset: TreePreset; count: number; seed: number };
export type TreeInput = { keys: number[] };

export const TREE_MIN_COUNT = 5;
export const TREE_MAX_COUNT = 31;
export const TREE_DEFAULT_COUNT = 15;

export function isTreePreset(value: unknown): value is TreePreset {
    return (
        typeof value === "string" &&
        (TREE_PRESETS as readonly string[]).includes(value)
    );
}

export function generateTreeInput({
    preset,
    count,
    seed,
}: TreeConfig): TreeInput {
    const rng = createRng(seed);
    const n = Math.max(
        TREE_MIN_COUNT,
        Math.min(TREE_MAX_COUNT, Math.round(count))
    );
    const pool = Array.from({ length: 99 }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const keys = pool.slice(0, n);
    if (preset === "random") return { keys };
    keys.sort((a, b) => a - b);
    if (preset === "ascending") return { keys };
    const zig: number[] = [];
    for (let lo = 0, hi = n - 1; lo <= hi; lo += 1, hi -= 1) {
        zig.push(keys[lo]);
        if (hi !== lo) zig.push(keys[hi]);
    }
    return { keys: zig };
}
