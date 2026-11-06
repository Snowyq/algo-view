import { createRng } from "../../utils/randoms";
import { DIRS, GridAlgorithm } from "../GridAlgorithm";
import { Snapshots, type StepOptions } from "../RecordedAlgorithm";
import type { StepMetrics } from "../types";

/*
 * Maze generation on an odd-sized grid. Every cell starts as wall, rooms
 * sit on odd coordinates and passages are carved between them.
 */

export type MazeInput = { cols: number; rows: number; seed: number };

export type MazeStepType =
    | "initial"
    | "carve"
    | "frontier"
    | "visit"
    | "walk"
    | "finish";

/** Mark layer on top of the walls. */
export const MARK_NONE = 0;
export const MARK_FRONTIER = 1;
export const MARK_IN_MAZE = 2;
export const MARK_WALK = 3;

export type MazeStep = {
    type: MazeStepType;
    /** Cells opened (wall to passage) on this step. */
    carve: number[];
    /** Cells whose mark changes, and to what. */
    mark: number[];
    markValue: number;
    current: number;
    instructionId?: string[];
    metrics: StepMetrics;
};

export type MazeState = {
    /** 1 = wall, 0 = passage. */
    walls: Uint8Array;
    marks: Uint8Array;
    current: number;
};

type MazeLayers = { walls: Uint8Array; marks: Uint8Array };

const SNAPSHOT_EVERY = 32;

export abstract class MazeAlgorithm extends GridAlgorithm<MazeStep, MazeState> {
    protected rng: () => number;
    protected walls: Uint8Array;
    protected marks: Uint8Array;
    protected current = -1;
    private snapshots = new Snapshots<MazeLayers>(
        SNAPSHOT_EVERY,
        () => ({
            walls: new Uint8Array(this.size).fill(1),
            marks: new Uint8Array(this.size),
        }),
        ({ walls, marks }) => ({ walls: walls.slice(), marks: marks.slice() }),
        ({ walls, marks }, index) => {
            const step = this.steps[index];
            step.carve.forEach((cell) => (walls[cell] = 0));
            step.mark.forEach((cell) => (marks[cell] = step.markValue));
        }
    );
    metrics: StepMetrics = {
        carved: { count: 0, name: "Carved" },
        visits: { count: 0, name: "Visits" },
        deadEnds: { count: 0, name: "Dead ends" },
    };

    constructor(input: MazeInput, options: Record<string, unknown> = {}) {
        super(input.cols, input.rows, options);
        this.rng = createRng(input.seed);
        this.walls = new Uint8Array(this.size).fill(1);
        this.marks = new Uint8Array(this.size);
        this.push("initial", [], [], MARK_NONE, {});
        this.generate();
        this.current = -1;
        this.setCount("deadEnds", this.countDeadEnds());
        this.push("finish", [], [], MARK_NONE, {});
        this.snapshots.build(this.steps.length);
    }

    abstract generate(): void;

    // ---------- Recording ----------

    private push(
        type: MazeStepType,
        carve: number[],
        mark: number[],
        markValue: number,
        { instructionId }: StepOptions
    ): void {
        this.steps.push({
            type,
            carve,
            mark,
            markValue,
            current: this.current,
            instructionId,
            metrics: this.metricsSnapshot(),
        });
    }

    /** Open a room and the wall between it and where we came from. */
    protected carve(cells: number[], options: StepOptions = {}): void {
        const fresh = cells.filter((cell) => this.walls[cell] === 1);
        fresh.forEach((cell) => (this.walls[cell] = 0));
        this.setCount("carved", this.metrics.carved.count + fresh.length);
        const marked = cells.filter((cell) => this.isRoom(cell));
        marked.forEach((cell) => (this.marks[cell] = MARK_IN_MAZE));
        this.push("carve", fresh, marked, MARK_IN_MAZE, options);
    }

    protected markCells(
        type: MazeStepType,
        cells: number[],
        value: number,
        options: StepOptions = {}
    ): void {
        cells.forEach((cell) => (this.marks[cell] = value));
        this.push(type, [], cells, value, options);
    }

    /** Move the cursor (counts a visit). */
    protected visit(cell: number, options: StepOptions = {}): void {
        this.current = cell;
        this.setCount("visits", this.metrics.visits.count + 1);
        this.push("visit", [], [], MARK_NONE, options);
    }

    // ---------- Grid helpers ----------

    isRoom(cell: number): boolean {
        const [x, y] = this.xy(cell);
        return x % 2 === 1 && y % 2 === 1;
    }

    /** All rooms (odd coordinates), row by row. */
    rooms(): number[] {
        const out: number[] = [];
        for (let y = 1; y < this.rows - 1; y += 2) {
            for (let x = 1; x < this.cols - 1; x += 2) out.push(this.at(x, y));
        }
        return out;
    }

    /** Rooms two steps away, with the wall cell between them. */
    roomNeighbors(cell: number): Array<{ room: number; wall: number }> {
        const [x, y] = this.xy(cell);
        const out: Array<{ room: number; wall: number }> = [];
        for (const [dx, dy] of DIRS) {
            const nx = x + dx * 2;
            const ny = y + dy * 2;
            if (nx < 1 || ny < 1 || nx > this.cols - 2 || ny > this.rows - 2) {
                continue;
            }
            out.push({ room: this.at(nx, ny), wall: this.at(x + dx, y + dy) });
        }
        return out;
    }

    isOpen(cell: number): boolean {
        return this.walls[cell] === 0;
    }

    pick<T>(items: T[]): T {
        return items[Math.floor(this.rng() * items.length)];
    }

    shuffle<T>(items: T[]): T[] {
        const out = items.slice();
        for (let i = out.length - 1; i > 0; i -= 1) {
            const j = Math.floor(this.rng() * (i + 1));
            [out[i], out[j]] = [out[j], out[i]];
        }
        return out;
    }

    private countDeadEnds(): number {
        return this.rooms().filter((room) => {
            if (!this.isOpen(room)) return false;
            const exits = this.roomNeighbors(room).filter(({ wall }) =>
                this.isOpen(wall)
            ).length;
            return exits === 1;
        }).length;
    }

    getStateByStepsIndex(index: number): MazeState {
        const last = this.clampStep(index);
        return {
            ...this.snapshots.at(last),
            current: this.steps[last]?.current ?? -1,
        };
    }

    /** The finished maze, e.g. to hand over to the path finders. */
    getFinalWalls(): Uint8Array {
        return this.walls.slice();
    }
}
