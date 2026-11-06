import { describe, expect, it } from "vitest";
import registryApi from "../algorithmsRegistryApi";
import {
    CELL_EMPTY,
    CELL_WALL,
    GRID_PRESETS,
    generateGrid,
    MUD_COST,
    type GridInput,
} from "../../utils/grid";
import type { PathAlgorithm } from "./PathAlgorithm";

type PathClass = new (grid: GridInput) => PathAlgorithm;

const items = registryApi.getAlgorithmsInCategory("path") ?? [];
const COMPLETE = ["bfs", "dijkstra", "astar", "greedy", "bidirectional", "dfs"];
const FEWEST_STEPS = ["bfs", "bidirectional"];
const CHEAPEST = ["dijkstra", "astar"];

const solve = (id: string, grid: GridInput) => {
    const item = items.find((entry) => entry.id === id)!;
    const algo = new (item.algorithm.Class as unknown as PathClass)(grid);
    const path: number[] = [];
    for (let i = 0; i < algo.getStepsLength(); i += 1) {
        const step = algo.getStepByIndex(i)!;
        if (step.type === "path") path.push(...step.cells);
    }
    return { path, metrics: algo.getMetrics() };
};

/** Fewest steps and cheapest cost from start to end, or null if unreachable. */
function reference(grid: GridInput): { steps: number; cost: number } | null {
    const { cols, rows, cells, start, end } = grid;
    const neighbours = (cell: number): number[] => {
        const x = cell % cols;
        const out: number[] = [];
        if (cell >= cols) out.push(cell - cols);
        if (cell < cols * (rows - 1)) out.push(cell + cols);
        if (x > 0) out.push(cell - 1);
        if (x < cols - 1) out.push(cell + 1);
        return out.filter((n) => cells[n] !== CELL_WALL);
    };
    const hops = new Array<number>(cells.length).fill(Infinity);
    hops[start] = 0;
    const queue = [start];
    for (let k = 0; k < queue.length; k += 1) {
        for (const n of neighbours(queue[k])) {
            if (hops[n] !== Infinity) continue;
            hops[n] = hops[queue[k]] + 1;
            queue.push(n);
        }
    }
    if (hops[end] === Infinity) return null;
    // Bellman-Ford style relaxation: slow but obviously correct.
    const cost = new Array<number>(cells.length).fill(Infinity);
    cost[start] = 0;
    for (let changed = true; changed; ) {
        changed = false;
        for (let cell = 0; cell < cells.length; cell += 1) {
            if (cost[cell] === Infinity) continue;
            for (const n of neighbours(cell)) {
                const step = cells[n] === CELL_EMPTY ? 1 : MUD_COST;
                if (cost[cell] + step < cost[n]) {
                    cost[n] = cost[cell] + step;
                    changed = true;
                }
            }
        }
    }
    return { steps: hops[end], cost: cost[end] };
}

function expectValidPath(grid: GridInput, path: number[]): void {
    expect(path[0]).toBe(grid.start);
    expect(path[path.length - 1]).toBe(grid.end);
    for (let k = 1; k < path.length; k += 1) {
        const [a, b] = [path[k - 1], path[k]];
        const dx = Math.abs((a % grid.cols) - (b % grid.cols));
        const dy = Math.abs(
            Math.floor(a / grid.cols) - Math.floor(b / grid.cols)
        );
        expect(dx + dy).toBe(1);
        expect(grid.cells[b]).not.toBe(CELL_WALL);
    }
}

const grids = GRID_PRESETS.flatMap((preset) =>
    [1, 2, 3].map((seed) => ({
        name: `${preset} #${seed}`,
        grid: generateGrid({ preset, cols: 21, seed }),
    }))
);
const reachable = grids.filter(({ grid }) => reference(grid) !== null);

describe("path finding", () => {
    it("has reachable goals on most generated grids", () => {
        expect(reachable.length).toBeGreaterThan(grids.length / 2);
    });

    describe.each(COMPLETE)("%s", (id) => {
        it.each(reachable)("reaches the goal on $name", ({ grid }) => {
            const { path, metrics } = solve(id, grid);
            expectValidPath(grid, path);
            expect(metrics.noPath).toBeUndefined();
        });

        it("reports no path when the goal is walled off", () => {
            const grid = generateGrid({ preset: "empty", cols: 15, seed: 1 });
            for (let y = 0; y < grid.rows; y += 1) {
                grid.cells[y * grid.cols + 7] = CELL_WALL;
            }
            const { path, metrics } = solve(id, grid);
            expect(path).toEqual([]);
            expect(metrics.noPath?.count).toBe(1);
        });
    });

    it.each(reachable)(
        "BFS and bidirectional BFS find a fewest-steps route on $name",
        ({ grid }) => {
            const { steps } = reference(grid)!;
            for (const id of FEWEST_STEPS) {
                expect(solve(id, grid).path.length - 1).toBe(steps);
            }
        }
    );

    it.each(reachable)(
        "Dijkstra and A* find the cheapest route on $name",
        ({ grid }) => {
            const { cost } = reference(grid)!;
            for (const id of CHEAPEST) {
                expect(solve(id, grid).metrics.cost.count).toBe(cost);
            }
        }
    );

    it("on open ground every optimal search walks the Manhattan distance", () => {
        const grid = generateGrid({ preset: "empty", cols: 25, seed: 4 });
        const distance = (grid.end % grid.cols) - (grid.start % grid.cols);
        for (const id of [...FEWEST_STEPS, ...CHEAPEST]) {
            expect(solve(id, grid).path.length - 1).toBe(distance);
        }
    });

    it.each(["randomWalk", "wallFollower"])(
        "%s either gives up or returns a valid route",
        (id) => {
            for (const { grid } of reachable) {
                const { path, metrics } = solve(id, grid);
                if (metrics.gaveUp) expect(path).toEqual([]);
                else expectValidPath(grid, path);
            }
        }
    );
});
