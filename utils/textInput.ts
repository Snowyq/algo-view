import { createRng } from "./randoms";

/*
 * Pattern-matching input: a text and a pattern to find in it. Presets
 * pick the shape that separates the algorithms: prose (skips pay off),
 * DNA (tiny alphabet), and a repetitive text that is the naive search's
 * worst case and KMP's best showcase.
 */

export const TEXT_PRESETS = ["prose", "dna", "repetitive"] as const;
export type TextPreset = (typeof TEXT_PRESETS)[number];

export type TextConfig = { preset: TextPreset; length: number; seed: number };
export type TextInput = { text: string; pattern: string };

export const TEXT_MIN_LENGTH = 16;
export const TEXT_MAX_LENGTH = 64;
export const TEXT_DEFAULT_LENGTH = 40;

export function isTextPreset(value: unknown): value is TextPreset {
    return (
        typeof value === "string" &&
        (TEXT_PRESETS as readonly string[]).includes(value)
    );
}

const PROSE =
    "the quick sort sorts the list then the merge sort merges the sorted halves while the heap sort heaps the rest of the input in place";

export function generateTextInput({
    preset,
    length,
    seed,
}: TextConfig): TextInput {
    const rng = createRng(seed);
    const n = Math.max(TEXT_MIN_LENGTH, Math.min(TEXT_MAX_LENGTH, length));
    let text: string;
    let pattern: string;

    if (preset === "prose") {
        const start = Math.floor(rng() * Math.max(1, PROSE.length - n));
        text = PROSE.slice(start, start + n);
        // A word from the text that appears at least once.
        const words = text.split(" ").filter((w) => w.length >= 3);
        pattern = words.length
            ? words[Math.floor(rng() * words.length)]
            : "sort";
    } else if (preset === "dna") {
        text = Array.from(
            { length: n },
            () => "ACGT"[Math.floor(rng() * 4)]
        ).join("");
        const at = Math.floor(rng() * (n - 5));
        pattern = text.slice(at, at + 4 + Math.floor(rng() * 2));
    } else {
        // aaaa…ab: every alignment nearly matches before failing.
        const m = 4 + Math.floor(rng() * 3);
        text = "a".repeat(n - 1) + "b";
        pattern = "a".repeat(m - 1) + "b";
    }
    return { text, pattern };
}
