import { describe, expect, it } from "vitest";
import type { RootState } from "../../store";
import reducer, {
    applyInput,
    changeCategory,
    changeSpeed,
    changeStep,
    closeAlgorithm,
    closeAllAlgorithms,
    decreaseStep,
    getParkedAlgorithms,
    getVisibleAlgorithms,
    getWindowAlgorithmId,
    increaseStep,
    openAlgorithm,
    openAlgorithmWindow,
    passAlgorithmInfo,
    setInputValue,
    setPanelCapacity,
    startAnimation,
} from "./playSlice";

type PlayState = ReturnType<typeof reducer>;
type Action = Parameters<typeof reducer>[1];

const initial = (): PlayState => reducer(undefined, { type: "@@init" });

const apply = (state: PlayState, ...actions: Action[]): PlayState =>
    actions.reduce(reducer, state);

const root = (play: PlayState): RootState => ({ play }) as RootState;

/** Sort panels with finished runs of the given lengths. */
const withRuns = (runs: Record<string, number>): PlayState =>
    apply(
        initial(),
        ...Object.keys(runs).map((id) => openAlgorithm(id)),
        ...Object.entries(runs).map(([id, stepsLength]) =>
            passAlgorithmInfo({ id, stepsLength })
        )
    );

describe("playSlice", () => {
    it("starts on sort with nothing open", () => {
        const state = initial();
        expect(state.active.category).toBe("sort");
        expect(state.active.algorithms).toEqual([]);
        expect(state.animation.maxStep).toBe(-1);
        expect(state.registry.algorithms.length).toBeGreaterThan(0);
    });

    describe("panels", () => {
        it("opens a registered algorithm once", () => {
            const state = apply(
                initial(),
                openAlgorithm("quickSort"),
                openAlgorithm("quickSort")
            );
            expect(state.active.algorithms.map((a) => a.id)).toEqual([
                "quickSort",
            ]);
            expect(state.active.algorithms[0].info.name).toBe("Quick");
        });

        it("ignores ids from another category", () => {
            const state = apply(initial(), openAlgorithm("bfs"));
            expect(state.active.algorithms).toEqual([]);
        });

        it("closes one panel or all of them", () => {
            const two = apply(
                initial(),
                openAlgorithm("quickSort"),
                openAlgorithm("heapSort")
            );
            expect(
                apply(two, closeAlgorithm("quickSort")).active.algorithms.map(
                    (a) => a.id
                )
            ).toEqual(["heapSort"]);
            expect(apply(two, closeAllAlgorithms()).active.algorithms).toEqual(
                []
            );
        });

        it("evicts the oldest panel when the stage is full", () => {
            const state = apply(
                initial(),
                setPanelCapacity(2),
                openAlgorithm("bubbleSort"),
                openAlgorithm("quickSort"),
                openAlgorithm("heapSort")
            );
            expect(state.active.algorithms.map((a) => a.id)).toEqual([
                "quickSort",
                "heapSort",
            ]);
            expect(state.ui.evicted).toEqual({ name: "Bubble", seq: 1 });
        });

        it("parks panels that no longer fit instead of closing them", () => {
            const state = apply(
                initial(),
                openAlgorithm("bubbleSort"),
                openAlgorithm("quickSort"),
                openAlgorithm("heapSort"),
                setPanelCapacity(2)
            );
            expect(getVisibleAlgorithms(root(state)).map((a) => a.id)).toEqual([
                "bubbleSort",
                "quickSort",
            ]);
            expect(getParkedAlgorithms(root(state)).map((a) => a.id)).toEqual([
                "heapSort",
            ]);
        });

        it("forgets the focus window once its algorithm closes", () => {
            const open = apply(
                initial(),
                openAlgorithm("quickSort"),
                openAlgorithmWindow("quickSort")
            );
            expect(getWindowAlgorithmId(root(open))).toBe("quickSort");
            expect(
                getWindowAlgorithmId(
                    root(apply(open, closeAlgorithm("quickSort")))
                )
            ).toBeNull();
        });
    });

    describe("steps", () => {
        it("ends at the longest visible run", () => {
            const state = withRuns({ bubbleSort: 120, quickSort: 80 });
            expect(state.animation.maxStep).toBe(119);
        });

        it("clamps step changes into [0, maxStep]", () => {
            const state = withRuns({ bubbleSort: 50 });
            expect(
                apply(state, changeStep({ value: 999 })).animation.step.value
            ).toBe(49);
            expect(
                apply(state, changeStep({ value: -5 })).animation.step.value
            ).toBe(0);
            expect(
                apply(state, increaseStep({ value: 70 })).animation.step.value
            ).toBe(49);
            expect(
                apply(
                    state,
                    changeStep({ value: 10 }),
                    decreaseStep({ value: 20 })
                ).animation.step.value
            ).toBe(0);
        });

        it("records what moved the step", () => {
            const state = apply(
                withRuns({ bubbleSort: 50 }),
                changeStep({ value: 3, trigger: "scrub" })
            );
            expect(state.animation.step).toEqual({
                value: 3,
                trigger: "scrub",
            });
        });

        it("pulls the step back when the longest run closes", () => {
            const state = apply(
                withRuns({ bubbleSort: 120, quickSort: 30 }),
                changeStep({ value: 100 }),
                closeAlgorithm("bubbleSort")
            );
            expect(state.animation.maxStep).toBe(29);
            expect(state.animation.step.value).toBe(29);
        });
    });

    describe("inputs", () => {
        it("applyInput regenerates the value and resets playback", () => {
            const config = {
                preset: "reversed" as const,
                length: 20,
                min: 1,
                max: 9,
                seed: 3,
            };
            const state = apply(
                withRuns({ bubbleSort: 50 }),
                changeStep({ value: 20 }),
                startAnimation(),
                applyInput({ category: "sort", config })
            );
            expect(state.inputs.sort.config).toEqual(config);
            expect(state.inputs.sort.value).toHaveLength(20);
            expect(state.inputs.sort.edited).toBe(false);
            expect(state.animation.step).toEqual({
                value: 0,
                trigger: "changeInput",
            });
            expect(state.animation.status).toBe("stopped");
        });

        it("input for another category leaves playback alone", () => {
            const config = { preset: "dna" as const, length: 30, seed: 1 };
            const state = apply(
                withRuns({ bubbleSort: 50 }),
                changeStep({ value: 20 }),
                applyInput({ category: "strings", config })
            );
            expect(state.animation.step.value).toBe(20);
            expect(state.inputs.strings.config).toEqual(config);
        });

        it("setInputValue marks the input as edited", () => {
            const state = apply(
                initial(),
                setInputValue({ category: "sort", value: [3, 2, 1] })
            );
            expect(state.inputs.sort.value).toEqual([3, 2, 1]);
            expect(state.inputs.sort.edited).toBe(true);
        });
    });

    describe("category and speed", () => {
        it("switching category clears panels and loads its registry", () => {
            const state = apply(
                withRuns({ bubbleSort: 50 }),
                changeCategory("path")
            );
            expect(state.active.category).toBe("path");
            expect(state.active.algorithms).toEqual([]);
            expect(state.registry.algorithms.map((a) => a.id)).toContain("bfs");
            expect(state.animation.maxStep).toBe(-1);
        });

        it("ignores unknown categories", () => {
            expect(
                apply(initial(), changeCategory("cooking")).active.category
            ).toBe("sort");
        });

        it("only accepts listed speeds", () => {
            expect(apply(initial(), changeSpeed(100)).animation.speed).toBe(
                100
            );
            expect(apply(initial(), changeSpeed(123)).animation.speed).toBe(
                initial().animation.speed
            );
        });
    });
});
