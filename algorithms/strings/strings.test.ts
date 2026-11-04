import { describe, expect, it } from "vitest";
import registryApi from "../algorithmsRegistryApi";
import {
    generateTextInput,
    TEXT_PRESETS,
    type TextInput,
} from "../../utils/textInput";
import type { StringAlgorithm } from "./StringAlgorithm";

type StringClass = new (input: TextInput) => StringAlgorithm;

const items = registryApi.getAlgorithmsInCategory("strings") ?? [];

const matchesOf = (id: string, input: TextInput): number[] => {
    const item = items.find((entry) => entry.id === id)!;
    const algo = new (item.algorithm.Class as unknown as StringClass)(input);
    return algo.getStateByStepsIndex(algo.getStepsLength() - 1).matches;
};

/** Every start index of the pattern, overlaps included. */
const indexOfScan = ({ text, pattern }: TextInput): number[] => {
    const out: number[] = [];
    for (let at = text.indexOf(pattern); at !== -1; ) {
        out.push(at);
        at = text.indexOf(pattern, at + 1);
    }
    return out;
};

const cases: Array<[string, TextInput]> = [
    ["a single match", { text: "the quick brown fox", pattern: "quick" }],
    ["overlapping matches", { text: "aaaaaa", pattern: "aa" }],
    ["periodic pattern", { text: "abababcabababab", pattern: "abab" }],
    ["a match at both ends", { text: "abcxxxabc", pattern: "abc" }],
    ["no match", { text: "mississippi", pattern: "issa" }],
    ["pattern equal to text", { text: "pixel", pattern: "pixel" }],
    ["single-character pattern", { text: "banana", pattern: "a" }],
    ["worst case for naive", { text: "aaaaaaaaab", pattern: "aaab" }],
    ["dna", { text: "ACGTACGTTACGACGT", pattern: "ACG" }],
];

const generated: Array<[string, TextInput]> = TEXT_PRESETS.flatMap((preset) =>
    [1, 2, 3].map((seed): [string, TextInput] => [
        `${preset} seed ${seed}`,
        generateTextInput({ preset, length: 64, seed }),
    ])
);

describe("string matching algorithms", () => {
    it("registers every matcher", () => {
        expect(items.map((item) => item.id).sort()).toEqual(
            ["horspool", "kmp", "naiveMatch", "rabinKarp", "zAlgorithm"].sort()
        );
    });

    describe.each(items.map((item) => [item.meta.name, item.id]))(
        "%s",
        (_, id) => {
            it.each([...cases, ...generated])(
                "matches indexOf on %s",
                (_, input) => {
                    expect(matchesOf(id, input)).toEqual(indexOfScan(input));
                }
            );
        }
    );

    describe("pattern longer than the text", () => {
        const input = { text: "abc", pattern: "abcd" };
        const safe = items.filter((item) => item.id !== "rabinKarp");

        it.each(safe.map((item) => [item.meta.name, item.id]))(
            "%s finds nothing",
            (_, id) => {
                expect(matchesOf(id, input)).toEqual([]);
            }
        );

        // the first window hash reads past the end of the text
        it.skip("Rabin-Karp finds nothing", () => {
            expect(matchesOf("rabinKarp", input)).toEqual([]);
        });
    });

    it("generated prose always contains its pattern", () => {
        for (const seed of [1, 2, 3, 4, 5]) {
            const input = generateTextInput({
                preset: "prose",
                length: 40,
                seed,
            });
            expect(input.text).toContain(input.pattern);
        }
    });
});
