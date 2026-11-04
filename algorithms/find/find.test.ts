import { describe, expect, it } from "vitest";
import registryApi from "../algorithmsRegistryApi";
import {
    FIND_PRESETS,
    FIND_TARGETS,
    generateFindInput,
    type FindInput,
} from "../../utils/findInput";
import type { FindAlgorithm } from "./FindAlgorithm";
import { RandomGuess } from "./RandomGuess";

type FindClass = new (input: FindInput) => FindAlgorithm;

const items = registryApi.getAlgorithmsInCategory("find") ?? [];
const exact = items.filter((item) => item.id !== "randomGuess");

const search = (id: string, input: FindInput): number => {
    const item = items.find((entry) => entry.id === id)!;
    const Class = item.algorithm.Class as unknown as FindClass;
    const algo = new Class(input);
    return algo.getStateByStepsIndex(algo.getStepsLength() - 1).found;
};

const values = [3, 7, 9, 14, 20, 21, 35, 40, 41, 58, 60, 77, 90];

describe("search algorithms", () => {
    it("registers the random guess baseline", () => {
        expect(items.some((item) => item.id === "randomGuess")).toBe(true);
    });

    describe.each(exact.map((item) => [item.meta.name, item.id]))(
        "%s",
        (_, id) => {
            it.each(values.map((value, index) => [value, index]))(
                "finds %i at index %i",
                (target, index) => {
                    expect(search(id, { values, target })).toBe(index);
                }
            );

            it.each([0, 8, 50, 100])("reports %i as missing", (target) => {
                expect(search(id, { values, target })).toBe(-1);
            });

            it("finds a value inside a run of duplicates", () => {
                const dupes = [1, 2, 2, 2, 2, 2, 5, 8, 8, 9];
                const found = search(id, { values: dupes, target: 2 });
                expect(dupes[found]).toBe(2);
            });

            it.each(
                FIND_PRESETS.flatMap((p) =>
                    FIND_TARGETS.map((t) => [p, t] as const)
                )
            )(
                "agrees with indexOf on the %s preset (%s target)",
                (preset, target) => {
                    const input = generateFindInput({
                        preset,
                        target,
                        length: 64,
                        seed: 11,
                    });
                    const found = search(id, input);
                    if (input.values.includes(input.target)) {
                        expect(input.values[found]).toBe(input.target);
                    } else {
                        expect(found).toBe(-1);
                    }
                }
            );
        }
    );

    describe("Random guess", () => {
        it("never reports a wrong index", () => {
            for (const target of values) {
                const found = search("randomGuess", { values, target });
                if (found !== -1) expect(values[found]).toBe(target);
            }
        });

        it("gives up on a missing value", () => {
            const algo = new RandomGuess({ values, target: 8 });
            expect(algo.getMetrics().gaveUp?.count).toBe(1);
            expect(algo.getMetrics().probes.count).toBe(values.length * 3);
        });
    });

    it("binary search needs at most log2(n) + 1 probes", () => {
        const sorted = Array.from({ length: 512 }, (_, i) => i * 2);
        const Class = items.find((item) => item.id === "binarySearch")!
            .algorithm.Class as unknown as FindClass;
        for (const target of [0, 511, 1022, 333]) {
            const algo = new Class({ values: sorted, target });
            expect(algo.getMetrics().probes.count).toBeLessThanOrEqual(10);
        }
    });
});
