import { afterEach, describe, expect, it, vi } from "vitest";
import registryApi from "../algorithmsRegistryApi";
import {
    createRng,
    generateInput,
    type InputPreset,
} from "../../utils/randoms";
import type { SortAlgorithm } from "./SortAlgorithm";
import { MiracleSort } from "./MiracleSort";

type SortClass = new (array: number[]) => SortAlgorithm;

const items = registryApi.getAlgorithmsInCategory("sort") ?? [];
const JOKES = ["bogoSort", "bozoSort", "miracleSort", "stoogeSort", "slowSort"];
const regular = items.filter((item) => !JOKES.includes(item.id));

const run = (id: string, input: number[]): SortAlgorithm => {
    const item = items.find((entry) => entry.id === id)!;
    return new (item.algorithm.Class as unknown as SortClass)(input);
};

const finalArray = (algo: SortAlgorithm): number[] =>
    algo.getStateByStepsIndex(algo.getStepsLength() - 1);

// Applies every operation up to the step, without the state cache.
const replayFromScratch = (algo: SortAlgorithm, step: number): number[] => {
    const state = algo.getArray();
    const last = algo.getOperationIdByStepIndex(step) ?? -1;
    algo.operations
        .slice(0, last + 1)
        .forEach((operation) => algo.makeOperation(operation, state));
    return state;
};

const ascending = (values: number[]): number[] =>
    values.slice().sort((a, b) => a - b);

const inputs: Array<[string, number[]]> = [
    ...(
        ["random", "reversed", "nearlySorted", "fewUnique"] as InputPreset[]
    ).map((preset): [string, number[]] => [
        preset,
        generateInput({ preset, length: 40, min: 1, max: 30, seed: 7 }),
    ]),
    ["already sorted", [1, 2, 3, 4, 5, 6, 7, 8]],
    ["all equal", [5, 5, 5, 5, 5, 5]],
    ["two items", [2, 1]],
    ["single item", [42]],
];

describe("sorting algorithms", () => {
    it("registers every sort", () => {
        expect(items.length).toBeGreaterThanOrEqual(19);
    });

    describe.each(regular.map((item) => [item.meta.name, item.id]))(
        "%s",
        (_, id) => {
            it.each(inputs)("sorts %s input", (_, input) => {
                const algo = run(id, input);
                expect(finalArray(algo)).toEqual(ascending(input));
            });

            it("does not mutate the input array", () => {
                const input = [3, 1, 2];
                run(id, input);
                expect(input).toEqual([3, 1, 2]);
            });

            it("records steps that start and end the run", () => {
                const algo = run(id, [4, 2, 3, 1]);
                const last = algo.getStepsLength() - 1;
                expect(algo.getStepsLength()).toBeGreaterThan(2);
                expect(algo.getStepByIndex(0)?.type).toBe("initial");
                expect(algo.getStepByIndex(last)?.type).toBe("finish");
                expect(algo.getStateByStepsIndex(0)).toEqual([4, 2, 3, 1]);
            });

            it("replays every step to the same array as a fresh replay", () => {
                const input = [5, 3, 8, 1, 9, 2, 7, 3];
                const algo = run(id, input);
                for (let i = 0; i < algo.getStepsLength(); i += 1) {
                    expect(algo.getStateByStepsIndex(i)).toEqual(
                        replayFromScratch(algo, i)
                    );
                }
            });

            it("keeps a permutation of the input at every step when it only swaps", () => {
                const input = [5, 3, 8, 1, 9, 2, 7];
                const algo = run(id, input);
                const swapsOnly = algo
                    .getOperations()
                    .every((operation) => operation.type === "swap");
                if (!swapsOnly) return;
                for (let i = 0; i < algo.getStepsLength(); i += 1) {
                    expect(ascending(algo.getStateByStepsIndex(i))).toEqual(
                        ascending(input)
                    );
                }
            });
        }
    );
});

describe("state cache on long runs", () => {
    it("replays a step of a 500k-operation insertion sort correctly", () => {
        const input = Array.from({ length: 1000 }, (_, i) => 1000 - i);
        const algo = run("insertionSort", input);
        expect(algo.getOperations().length).toBeGreaterThan(200000);
        expect(algo.getStateByStepsIndex(21)).toEqual(
            replayFromScratch(algo, 21)
        );
    });
});

describe("joke sorts", () => {
    afterEach(() => vi.restoreAllMocks());

    it.each(["bogoSort", "bozoSort"])(
        "%s sorts a tiny input with a seeded Math.random",
        (id) => {
            vi.spyOn(Math, "random").mockImplementation(createRng(1));
            const algo = run(id, [3, 1, 4, 2]);
            expect(finalArray(algo)).toEqual([1, 2, 3, 4]);
            expect(algo.getMetrics().gaveUp).toBeUndefined();
        }
    );

    it.each(["stoogeSort", "slowSort"])("%s sorts a small input", (id) => {
        const input = [6, 2, 9, 1, 5, 3, 8];
        expect(finalArray(run(id, input))).toEqual(ascending(input));
    });

    it("bogo sort gives up once the step budget is spent", () => {
        vi.spyOn(Math, "random").mockReturnValue(0);
        const input = Array.from({ length: 12 }, (_, i) => 12 - i);
        const algo = run("bogoSort", input);
        expect(algo.getMetrics().gaveUp?.count).toBe(1);
    });

    it("miracle sort leaves the array as it was", () => {
        const algo = new MiracleSort([2, 1, 3]);
        expect(finalArray(algo)).toEqual([2, 1, 3]);
        expect(algo.getMetrics().prayers.count).toBe(5);
    });

    it("miracle sort accepts an already sorted array", () => {
        const algo = new MiracleSort([1, 2, 3]);
        expect(algo.getMetrics().gaveUp).toBeUndefined();
    });
});
