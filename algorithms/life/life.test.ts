import { describe, expect, it } from "vitest";
import { generateLifeInput, type LifeInput } from "../../utils/lifeInput";
import { ConwayLife } from "./ConwayLife";
import { HighLife } from "./HighLife";
import { LangtonsAnt } from "./LangtonsAnt";
import type { LifeAlgorithm } from "./LifeAlgorithm";
import { Seeds } from "./Seeds";

const COLS = 10;
const ROWS = 10;

const board = (alive: Array<[number, number]>): LifeInput => {
    const cells = new Array<number>(COLS * ROWS).fill(0);
    alive.forEach(([x, y]) => (cells[y * COLS + x] = 1));
    return { cols: COLS, rows: ROWS, cells };
};

const aliveAt = (
    algo: LifeAlgorithm,
    step: number
): Array<[number, number]> => {
    const { cells } = algo.getStateByStepsIndex(step);
    const out: Array<[number, number]> = [];
    cells.forEach((v, i) => {
        if (v === 1) out.push([i % COLS, Math.floor(i / COLS)]);
    });
    return out;
};

const BLINKER: Array<[number, number]> = [
    [3, 4],
    [4, 4],
    [5, 4],
];
const GLIDER: Array<[number, number]> = [
    [1, 0],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2],
];

describe("Conway's Game of Life", () => {
    it("a blinker flips between horizontal and vertical", () => {
        const algo = new ConwayLife(board(BLINKER));
        expect(aliveAt(algo, 1)).toEqual([
            [4, 3],
            [4, 4],
            [4, 5],
        ]);
        expect(aliveAt(algo, 2)).toEqual(BLINKER);
    });

    it("stops early once a pattern oscillates", () => {
        const algo = new ConwayLife(board(BLINKER));
        expect(algo.getStepsLength()).toBeLessThan(6);
        expect(algo.getStepByIndex(algo.getStepsLength() - 1)?.type).toBe(
            "finish"
        );
    });

    it("a block is a still life", () => {
        const block: Array<[number, number]> = [
            [2, 2],
            [3, 2],
            [2, 3],
            [3, 3],
        ];
        const algo = new ConwayLife(board(block));
        expect(aliveAt(algo, 1)).toEqual(block);
        expect(algo.getMetrics().births.count).toBe(0);
    });

    it("a glider moves one cell diagonally every four generations", () => {
        const algo = new ConwayLife(board(GLIDER));
        const shifted = GLIDER.map(([x, y]) => [x + 1, y + 1]);
        const sortCells = (cells: number[][]) =>
            cells.map((c) => c.join()).sort();
        expect(sortCells(aliveAt(algo, 4))).toEqual(sortCells(shifted));
        expect(aliveAt(algo, 4)).toHaveLength(5);
    });

    it("a lone cell dies of loneliness", () => {
        const algo = new ConwayLife(board([[5, 5]]));
        expect(aliveAt(algo, 1)).toEqual([]);
        expect(algo.getMetrics().deaths.count).toBe(1);
    });

    it("wraps around the edges", () => {
        const algo = new ConwayLife(
            board([
                [9, 4],
                [0, 4],
                [1, 4],
            ])
        );
        expect(aliveAt(algo, 1)).toEqual([
            [0, 3],
            [0, 4],
            [0, 5],
        ]);
    });
});

describe("other automata", () => {
    it("HighLife (B36/S23) still treats a blinker like Conway", () => {
        expect(aliveAt(new HighLife(board(BLINKER)), 2)).toEqual(BLINKER);
    });

    it("Seeds (B2/S) kills every live cell each generation", () => {
        const algo = new Seeds(
            board([
                [4, 4],
                [5, 4],
            ])
        );
        const next = aliveAt(algo, 1);
        expect(next).not.toContainEqual([4, 4]);
        expect(next).toContainEqual([4, 3]);
    });

    it("Langton's ant never settles and runs every generation", () => {
        const input = generateLifeInput({ preset: "soup", cols: 24, seed: 1 });
        const empty = { ...input, cells: input.cells.map(() => 0) };
        const algo = new LangtonsAnt(empty);
        expect(algo.getStateByStepsIndex(1).marker).toBeGreaterThanOrEqual(0);
        expect(algo.getStepsLength()).toBe(152);
    });

    it("generated soups are deterministic per seed", () => {
        const config = { preset: "soup" as const, cols: 40, seed: 3 };
        expect(generateLifeInput(config)).toEqual(generateLifeInput(config));
    });
});
