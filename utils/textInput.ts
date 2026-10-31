import { createRng, pick, randomInt } from "./randoms";
import { clamp, isOneOf } from "./values";

/*
 * Text and pattern. Prose rewards skipping, DNA has a tiny alphabet, and
 * the repetitive text is the naive search's worst case.
 */

export const TEXT_PRESETS = ["prose", "dna", "repetitive"] as const;
export type TextPreset = (typeof TEXT_PRESETS)[number];

export type TextConfig = { preset: TextPreset; length: number; seed: number };
export type TextInput = { text: string; pattern: string };

export const TEXT_MIN_LENGTH = 16;
export const TEXT_MAX_LENGTH = 64;
export const TEXT_DEFAULT_LENGTH = 40;

export function isTextPreset(value: unknown): value is TextPreset {
    return isOneOf(TEXT_PRESETS, value);
}

const PROSE =
    "the quick sort sorts the list then the merge sort merges the sorted halves while the heap sort heaps the rest of the input in place";

export function generateTextInput({
    preset,
    length,
    seed,
}: TextConfig): TextInput {
    const rng = createRng(seed);
    const n = clamp(length, TEXT_MIN_LENGTH, TEXT_MAX_LENGTH);

    if (preset === "prose") {
        const start = randomInt(rng, Math.max(1, PROSE.length - n));
        const text = PROSE.slice(start, start + n);
        // A word that appears in the text at least once.
        const words = text.split(" ").filter((w) => w.length >= 3);
        return { text, pattern: words.length ? pick(rng, words) : "sort" };
    }
    if (preset === "dna") {
        const letters = Array.from({ length: n }, () => pick(rng, "ACGT"));
        const text = letters.join("");
        const at = randomInt(rng, n - 5);
        return { text, pattern: text.slice(at, at + 4 + randomInt(rng, 2)) };
    }
    // aaaa...ab: every alignment nearly matches before failing.
    const m = 4 + randomInt(rng, 3);
    return { text: "a".repeat(n - 1) + "b", pattern: "a".repeat(m - 1) + "b" };
}
