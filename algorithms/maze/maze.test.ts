import { describe, expect, it } from "vitest";
import registryApi from "../algorithmsRegistryApi";
import { gridSize } from "../../utils/grid";
import type { MazeAlgorithm, MazeInput } from "./MazeAlgorithm";

type MazeClass = new (input: MazeInput) => MazeAlgorithm;

const items = registryApi.getAlgorithmsInCategory("maze") ?? [];

const generate = (id: string, input: MazeInput): MazeAlgorithm => {
    const item = items.find((entry) => entry.id === id)!;
    return new (item.algorithm.Class as unknown as MazeClass)(input);
};

/** Rooms sit on odd coordinates; passages are the open cells between them. */
function analyse(walls: Uint8Array, cols: number, rows: number) {
    const open = (x: number, y: number): boolean => walls[y * cols + x] === 0;
    let rooms = 0;
    let passages = 0;
    let stray = 0;
    for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
            if (!open(x, y)) continue;
            const oddX = x % 2 === 1;
            const oddY = y % 2 === 1;
            const border =
                x === 0 || y === 0 || x === cols - 1 || y === rows - 1;
            if (border || (!oddX && !oddY)) stray += 1;
            else if (oddX && oddY) rooms += 1;
            else passages += 1;
        }
    }
    // Flood fill over open cells from the first room.
    const seen = new Uint8Array(walls.length);
    const queue = [cols + 1];
    seen[cols + 1] = 1;
    for (let k = 0; k < queue.length; k += 1) {
        const cell = queue[k];
        for (const next of [cell - 1, cell + 1, cell - cols, cell + cols]) {
            if (walls[next] === 0 && !seen[next]) {
                seen[next] = 1;
                queue.push(next);
            }
        }
    }
    return { rooms, passages, stray, reached: queue.length };
}

const sizes: MazeInput[] = [11, 21, 31].flatMap((cols) =>
    [1, 42, 2024].map((seed) => ({ ...gridSize(cols), seed }))
);

describe("maze generators", () => {
    it("registers eight generators", () => {
        expect(items).toHaveLength(8);
    });

    describe.each(items.map((item) => [item.meta.name, item.id]))(
        "%s",
        (_, id) => {
            it.each(sizes)(
                "carves a perfect maze ($cols×$rows, seed $seed)",
                (input) => {
                    const { cols, rows } = input;
                    const walls = generate(id, input).getFinalWalls();
                    const result = analyse(walls, cols, rows);
                    const roomCount = ((cols - 1) / 2) * ((rows - 1) / 2);
                    expect(result.stray).toBe(0);
                    expect(result.rooms).toBe(roomCount);
                    // A spanning tree: rooms - 1 passages, everything connected.
                    expect(result.passages).toBe(roomCount - 1);
                    expect(result.reached).toBe(roomCount + result.passages);
                }
            );

            it("is deterministic for a seed", () => {
                const input = { ...gridSize(21), seed: 9 };
                expect(generate(id, input).getFinalWalls()).toEqual(
                    generate(id, input).getFinalWalls()
                );
            });

            it("replays its last step to the final maze", () => {
                const algo = generate(id, { ...gridSize(21), seed: 5 });
                const last = algo.getStateByStepsIndex(
                    algo.getStepsLength() - 1
                );
                expect(last.walls).toEqual(algo.getFinalWalls());
                expect(
                    algo.getStateByStepsIndex(0).walls.every((w) => w === 1)
                ).toBe(true);
            });
        }
    );

    it("different seeds give different mazes", () => {
        const a = generate("backtracker", { ...gridSize(21), seed: 1 });
        const b = generate("backtracker", { ...gridSize(21), seed: 2 });
        expect(a.getFinalWalls()).not.toEqual(b.getFinalWalls());
    });
});
