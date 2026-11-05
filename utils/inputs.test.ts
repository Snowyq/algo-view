import { describe, expect, it } from "vitest";
import {
    DP_MAX_SIZE,
    DP_MIN_SIZE,
    DP_PRESETS,
    generateDpInput,
} from "./dpInput";
import {
    FILL_MAX_COLS,
    FILL_MIN_COLS,
    FILL_PRESETS,
    generateFillInput,
} from "./fillInput";
import {
    FIND_MAX_LENGTH,
    FIND_MIN_LENGTH,
    FIND_PRESETS,
    FIND_TARGETS,
    generateFindInput,
} from "./findInput";
import {
    generateGraphInput,
    GRAPH_MAX_NODES,
    GRAPH_MIN_NODES,
    GRAPH_PRESETS,
} from "./graphInput";
import {
    CELL_WALL,
    decodeCells,
    encodeCells,
    generateGrid,
    GRID_MAX_COLS,
    GRID_MIN_COLS,
    GRID_PRESETS,
    gridSize,
} from "./grid";
import {
    generateLifeInput,
    LIFE_MAX_COLS,
    LIFE_MIN_COLS,
    LIFE_PRESETS,
} from "./lifeInput";
import {
    generatePointsInput,
    POINTS_MAX,
    POINTS_MIN,
    POINTS_PRESETS,
} from "./pointsInput";
import {
    generateTextInput,
    TEXT_MAX_LENGTH,
    TEXT_MIN_LENGTH,
    TEXT_PRESETS,
} from "./textInput";
import {
    generateTreeInput,
    TREE_MAX_COUNT,
    TREE_MIN_COUNT,
    TREE_PRESETS,
} from "./treeInput";

const SEEDS = [1, 99];

describe("input generators are deterministic for a seed", () => {
    it.each(GRID_PRESETS)("grid: %s", (preset) => {
        for (const seed of SEEDS) {
            const config = { preset, cols: 31, seed };
            expect(generateGrid(config)).toEqual(generateGrid(config));
        }
    });

    it.each(FIND_PRESETS)("find: %s", (preset) => {
        const config = {
            preset,
            length: 40,
            target: "present" as const,
            seed: 5,
        };
        expect(generateFindInput(config)).toEqual(generateFindInput(config));
    });

    it.each(DP_PRESETS)("dp: %s", (preset) => {
        const config = { preset, size: 8, seed: 5 };
        expect(generateDpInput(config)).toEqual(generateDpInput(config));
    });

    it.each(TEXT_PRESETS)("text: %s", (preset) => {
        const config = { preset, length: 40, seed: 5 };
        expect(generateTextInput(config)).toEqual(generateTextInput(config));
    });

    it.each(GRAPH_PRESETS)("graph: %s", (preset) => {
        const config = { preset, nodes: 12, seed: 5 };
        expect(generateGraphInput(config)).toEqual(generateGraphInput(config));
    });

    it.each(TREE_PRESETS)("tree: %s", (preset) => {
        const config = { preset, count: 15, seed: 5 };
        expect(generateTreeInput(config)).toEqual(generateTreeInput(config));
    });

    it.each(POINTS_PRESETS)("points: %s", (preset) => {
        const config = { preset, count: 24, seed: 5 };
        expect(generatePointsInput(config)).toEqual(
            generatePointsInput(config)
        );
    });

    it.each(FILL_PRESETS)("fill: %s", (preset) => {
        const config = { preset, cols: 30, seed: 5 };
        expect(generateFillInput(config)).toEqual(generateFillInput(config));
    });

    it.each(LIFE_PRESETS)("life: %s", (preset) => {
        const config = { preset, cols: 30, seed: 5 };
        expect(generateLifeInput(config)).toEqual(generateLifeInput(config));
    });
});

describe("input generators clamp sizes", () => {
    it("grid", () => {
        expect(gridSize(1).cols).toBe(GRID_MIN_COLS);
        expect(gridSize(1000).cols).toBe(GRID_MAX_COLS);
        expect(gridSize(20).cols % 2).toBe(1);
        expect(gridSize(20).rows % 2).toBe(1);
    });

    it("find", () => {
        const small = generateFindInput({
            preset: "random",
            length: 1,
            target: "first",
            seed: 1,
        });
        const big = generateFindInput({
            preset: "random",
            length: 9999,
            target: "first",
            seed: 1,
        });
        expect(small.values).toHaveLength(FIND_MIN_LENGTH);
        expect(big.values).toHaveLength(FIND_MAX_LENGTH);
    });

    it("dp", () => {
        expect(
            generateDpInput({ preset: "letters", size: 1, seed: 1 }).a
        ).toHaveLength(DP_MIN_SIZE);
        expect(
            generateDpInput({ preset: "letters", size: 99, seed: 1 }).a
        ).toHaveLength(DP_MAX_SIZE);
    });

    it("text", () => {
        expect(
            generateTextInput({ preset: "dna", length: 1, seed: 1 }).text
        ).toHaveLength(TEXT_MIN_LENGTH);
        expect(
            generateTextInput({ preset: "dna", length: 999, seed: 1 }).text
        ).toHaveLength(TEXT_MAX_LENGTH);
    });

    it("graph", () => {
        expect(
            generateGraphInput({ preset: "sparse", nodes: 1, seed: 1 }).nodes
        ).toHaveLength(GRAPH_MIN_NODES);
        expect(
            generateGraphInput({ preset: "sparse", nodes: 99, seed: 1 }).nodes
        ).toHaveLength(GRAPH_MAX_NODES);
    });

    it("tree", () => {
        expect(
            generateTreeInput({ preset: "random", count: 1, seed: 1 }).keys
        ).toHaveLength(TREE_MIN_COUNT);
        expect(
            generateTreeInput({ preset: "random", count: 99, seed: 1 }).keys
        ).toHaveLength(TREE_MAX_COUNT);
    });

    it("points", () => {
        expect(
            generatePointsInput({ preset: "scatter", count: 1, seed: 1 }).points
        ).toHaveLength(POINTS_MIN);
        expect(
            generatePointsInput({ preset: "scatter", count: 99, seed: 1 })
                .points
        ).toHaveLength(POINTS_MAX);
    });

    it("fill", () => {
        expect(
            generateFillInput({ preset: "caves", cols: 1, seed: 1 }).cols
        ).toBe(FILL_MIN_COLS);
        expect(
            generateFillInput({ preset: "caves", cols: 999, seed: 1 }).cols
        ).toBe(FILL_MAX_COLS);
    });

    it("life", () => {
        expect(
            generateLifeInput({ preset: "soup", cols: 1, seed: 1 }).cols
        ).toBe(LIFE_MIN_COLS);
        expect(
            generateLifeInput({ preset: "soup", cols: 999, seed: 1 }).cols
        ).toBe(LIFE_MAX_COLS);
    });
});

describe("input generators produce valid data", () => {
    it.each(GRID_PRESETS)(
        "grid %s keeps start and end open and apart",
        (preset) => {
            const grid = generateGrid({ preset, cols: 41, seed: 3 });
            expect(grid.cells).toHaveLength(grid.cols * grid.rows);
            expect(grid.cells[grid.start]).not.toBe(CELL_WALL);
            expect(grid.cells[grid.end]).not.toBe(CELL_WALL);
            expect(grid.start).not.toBe(grid.end);
        }
    );

    it.each(
        FIND_PRESETS.flatMap((p) => FIND_TARGETS.map((t) => [p, t] as const))
    )(
        "find %s with a %s target is sorted and places the target as asked",
        (preset, target) => {
            const input = generateFindInput({
                preset,
                length: 48,
                target,
                seed: 2,
            });
            input.values
                .slice(1)
                .forEach((v, i) =>
                    expect(v).toBeGreaterThanOrEqual(input.values[i])
                );
            const present = input.values.includes(input.target);
            expect(present).toBe(target !== "missing");
            if (target === "first") expect(input.target).toBe(input.values[0]);
            if (target === "last")
                expect(input.target).toBe(
                    input.values[input.values.length - 1]
                );
        }
    );

    it("find keeps a numeric target for a fractional length", () => {
        const input = generateFindInput({
            preset: "even",
            length: 10.5,
            target: "last",
            seed: 1,
        });
        expect(input.target).toBe(input.values[input.values.length - 1]);
    });

    it.each(TREE_PRESETS)("tree %s keys are distinct", (preset) => {
        const { keys } = generateTreeInput({ preset, count: 31, seed: 6 });
        expect(new Set(keys).size).toBe(keys.length);
    });

    it("ascending tree keys are sorted", () => {
        const { keys } = generateTreeInput({
            preset: "ascending",
            count: 20,
            seed: 6,
        });
        expect(keys).toEqual(keys.slice().sort((a, b) => a - b));
    });

    it.each(FILL_PRESETS)("fill %s starts on an open cell", (preset) => {
        const input = generateFillInput({ preset, cols: 40, seed: 6 });
        expect(input.walls).toHaveLength(input.cols * input.rows);
        expect(input.walls[input.start]).toBe(0);
    });

    it.each(GRAPH_PRESETS)(
        "graph %s has positive weights and no self loops",
        (preset) => {
            const { nodes, edges } = generateGraphInput({
                preset,
                nodes: 16,
                seed: 6,
            });
            edges.forEach(({ a, b, w }) => {
                expect(a).toBeLessThan(b);
                expect(b).toBeLessThan(nodes.length);
                expect(w).toBeGreaterThanOrEqual(1);
            });
        }
    );
});

describe("grid cell encoding", () => {
    it.each(GRID_PRESETS)("round-trips a %s grid", (preset) => {
        const { cells } = generateGrid({ preset, cols: 41, seed: 8 });
        expect(decodeCells(encodeCells(cells), cells.length)).toEqual(cells);
    });

    it("uses URL-safe characters only", () => {
        const { cells } = generateGrid({ preset: "mud", cols: 81, seed: 8 });
        expect(encodeCells(cells)).toMatch(/^[A-Za-z0-9_-]*$/);
    });

    it("rejects text that is too short or not base64", () => {
        expect(decodeCells("AA", 100)).toBeNull();
        expect(decodeCells("!!!", 4)).toBeNull();
    });
});
