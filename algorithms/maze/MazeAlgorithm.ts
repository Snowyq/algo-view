import { createRng } from "../../utils/randoms";
import { Algorithm } from "../Algorithm";
import type {
    AlgorithmInstructions,
    StepAlgorithm,
    StepMetrics,
} from "../types";

/*
 * Maze generation on an odd-sized grid of cells: every cell starts as
 * wall; "rooms" sit on odd coordinates and passages are carved between
 * them. Subclasses implement generate() and report through carve / mark;
 * like the other categories, steps are replayed from snapshots.
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
    /** Cells opened (wall → passage) on this step. */
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

type StepOptions = { instructionId?: string[] };

const SNAPSHOT_EVERY = 32;
const DIRS: Array<[number, number]> = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
];

export abstract class MazeAlgorithm
    extends Algorithm
    implements StepAlgorithm<MazeStep, MazeState>
{
    cols: number;
    rows: number;
    steps: MazeStep[] = [];
    protected rng: () => number;
    protected walls: Uint8Array;
    protected marks: Uint8Array;
    protected current = -1;
    private snapshots = new Map<
        number,
        { walls: Uint8Array; marks: Uint8Array }
    >();
    metrics: StepMetrics = {
        carved: { count: 0, name: "Carved" },
        visits: { count: 0, name: "Visits" },
        deadEnds: { count: 0, name: "Dead ends" },
    };

    constructor(input: MazeInput, options: Record<string, unknown> = {}) {
        super();
        this.options = options;
        this.cols = input.cols;
        this.rows = input.rows;
        this.rng = createRng(input.seed);
        this.walls = new Uint8Array(input.cols * input.rows).fill(1);
        this.marks = new Uint8Array(input.cols * input.rows);
        this.push("initial", [], [], MARK_NONE, {});
        this.generate();
        this.current = -1;
        this.setCount("deadEnds", this.countDeadEnds());
        this.push("finish", [], [], MARK_NONE, {});
        this.buildSnapshots();
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
        const metrics: StepMetrics = {};
        for (const key in this.metrics) metrics[key] = { ...this.metrics[key] };
        this.steps.push({
            type,
            carve,
            mark,
            markValue,
            current: this.current,
            instructionId,
            metrics,
        });
    }

    private buildSnapshots(): void {
        const walls = new Uint8Array(this.walls.length).fill(1);
        const marks = new Uint8Array(this.marks.length);
        this.steps.forEach((step, index) => {
            step.carve.forEach((cell) => (walls[cell] = 0));
            step.mark.forEach((cell) => (marks[cell] = step.markValue));
            if (index % SNAPSHOT_EVERY === 0) {
                this.snapshots.set(index, {
                    walls: walls.slice(),
                    marks: marks.slice(),
                });
            }
        });
    }

    protected setCount(key: string, value: number): void {
        if (this.metrics[key]) this.metrics[key].count = value;
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

    get size(): number {
        return this.cols * this.rows;
    }

    at(x: number, y: number): number {
        return y * this.cols + x;
    }

    xy(cell: number): [number, number] {
        return [cell % this.cols, Math.floor(cell / this.cols)];
    }

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

    // ---------- Replay API ----------

    getStepsLength(): number {
        return this.steps.length;
    }

    getStepByIndex(index: number): MazeStep | undefined {
        return this.steps[index];
    }

    getMetrics(): StepMetrics {
        return this.steps[this.steps.length - 1]?.metrics ?? this.metrics;
    }

    getStateByStepsIndex(index: number): MazeState {
        const last = Math.max(0, Math.min(index, this.steps.length - 1));
        const base = last - (last % SNAPSHOT_EVERY);
        const snap = this.snapshots.get(base);
        const walls = snap
            ? snap.walls.slice()
            : new Uint8Array(this.size).fill(1);
        const marks = snap ? snap.marks.slice() : new Uint8Array(this.size);
        for (let i = base + 1; i <= last; i += 1) {
            const step = this.steps[i];
            step.carve.forEach((cell) => (walls[cell] = 0));
            step.mark.forEach((cell) => (marks[cell] = step.markValue));
        }
        return { walls, marks, current: this.steps[last]?.current ?? -1 };
    }

    /** The finished maze, e.g. to hand over to the path finders. */
    getFinalWalls(): Uint8Array {
        return this.walls.slice();
    }

    static getInstructions(): AlgorithmInstructions {
        return {};
    }
}
