import { describe, expect, it } from "vitest";
import registryApi from "../algorithmsRegistryApi";
import {
    FILL_PRESETS,
    generateFillInput,
    type FillInput,
} from "../../utils/fillInput";
import type { FillAlgorithm } from "./FillAlgorithm";

type FillClass = new (input: FillInput) => FillAlgorithm;

const items = registryApi.getAlgorithmsInCategory("fill") ?? [];
const FOUR_WAY = ["queueFill", "stackFill", "scanlineFill", "randomFill"];

const run = (id: string, input: FillInput) => {
    const item = items.find((entry) => entry.id === id)!;
    const algo = new (item.algorithm.Class as unknown as FillClass)(input);
    return {
        marks: algo.getStateByStepsIndex(algo.getStepsLength() - 1).marks,
        metrics: algo.getMetrics(),
    };
};

const painted = (marks: Int32Array): number[] =>
    Array.from(marks.keys()).filter((cell) => marks[cell] > 0);

/** Open cells connected to `from`, by 4 or 8 neighbours. */
function region(input: FillInput, from: number, diagonals: boolean): number[] {
    const { cols, rows, walls } = input;
    const seen = new Set([from]);
    const queue = [from];
    for (let k = 0; k < queue.length; k += 1) {
        const x = queue[k] % cols;
        const y = Math.floor(queue[k] / cols);
        for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
                if (!dx && !dy) continue;
                if (!diagonals && dx && dy) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
                const n = ny * cols + nx;
                if (walls[n] || seen.has(n)) continue;
                seen.add(n);
                queue.push(n);
            }
        }
    }
    return [...seen].sort((a, b) => a - b);
}

function countRegions(input: FillInput): number {
    const seen = new Set<number>();
    let regions = 0;
    input.walls.forEach((wall, cell) => {
        if (wall || seen.has(cell)) return;
        regions += 1;
        region(input, cell, false).forEach((c) => seen.add(c));
    });
    return regions;
}

const inputs = FILL_PRESETS.flatMap((preset) =>
    [16, 40].flatMap((cols) =>
        [1, 2].map((seed) => ({
            name: `${preset}, ${cols} cols, seed ${seed}`,
            input: generateFillInput({ preset, cols, seed }),
        }))
    )
);

describe("flood fill", () => {
    describe.each(FOUR_WAY)("%s", (id) => {
        it.each(inputs)(
            "paints the 4-connected region ($name)",
            ({ input }) => {
                const { marks, metrics } = run(id, input);
                const expected = region(input, input.start, false);
                expect(painted(marks)).toEqual(expected);
                expect(metrics.filled.count).toBe(expected.length);
            }
        );
    });

    it.each(inputs)(
        "all 4-way fills paint the same cells ($name)",
        ({ input }) => {
            const results = FOUR_WAY.map((id) => painted(run(id, input).marks));
            results.forEach((cells) => expect(cells).toEqual(results[0]));
        }
    );

    it.each(inputs)(
        "8-way fill leaks through diagonals ($name)",
        ({ input }) => {
            const { marks } = run("eightWayFill", input);
            expect(painted(marks)).toEqual(region(input, input.start, true));
        }
    );

    it.each(inputs)("labelling finds every region ($name)", ({ input }) => {
        const { marks, metrics } = run("componentLabeling", input);
        const regions = countRegions(input);
        expect(metrics.peak.count).toBe(regions);
        const startLabel = marks[input.start];
        const sameLabel = painted(marks).filter((c) => marks[c] === startLabel);
        expect(sameLabel).toEqual(region(input, input.start, false));
        expect(new Set(painted(marks).map((c) => marks[c])).size).toBe(regions);
    });

    it("never paints walls", () => {
        const { input } = inputs[0];
        for (const { id } of items) {
            const { marks } = run(id, input);
            painted(marks).forEach((cell) => expect(input.walls[cell]).toBe(0));
        }
    });
});
