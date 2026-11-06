import type { FillInput } from "../../utils/fillInput";
import { GridAlgorithm } from "../GridAlgorithm";
import { Snapshots, type StepOptions } from "../RecordedAlgorithm";
import type { StepMetrics } from "../types";

/*
 * Filling a bitmap region from a start cell. Marks per cell: 0 untouched,
 * -1 queued, k > 0 filled as the k-th cell (or region id k when labelling).
 * One step = one cell (or span) filled plus the cells it queued.
 */

export type FillStepType =
    | "initial"
    | "fill"
    | "span"
    | "label"
    | "merge"
    | "finish";

export const MARK_QUEUED = -1;

export type FillStep = {
    type: FillStepType;
    cell: number;
    /** Flattened (cell, mark) pairs. */
    changes: number[];
    instructionId?: string[];
    metrics: StepMetrics;
};

export type FillState = {
    marks: Int32Array;
    cell: number;
    type: FillStepType;
    /** Cells filled so far (for the "fresh paint" glow). */
    order: number;
    mode: "order" | "label";
};

const SNAPSHOT_EVERY = 48;

/** Clockwise from east, diagonals included. */
export const DIRS8: ReadonlyArray<readonly [number, number]> = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
];

/** Right, down, left, up. */
export const DIRS4 = DIRS8.filter((_, i) => i % 2 === 0);

export abstract class FillAlgorithm extends GridAlgorithm<FillStep, FillState> {
    start: number;
    protected walls: number[];
    protected marks: Int32Array;
    protected filled = 0;
    private pending: number[] = [];
    private orders: number[] = [];
    private snapshots = new Snapshots<Int32Array>(
        SNAPSHOT_EVERY,
        () => new Int32Array(this.size),
        (marks) => marks.slice(),
        (marks, index) => {
            const { changes } = this.steps[index];
            for (let k = 0; k < changes.length; k += 2)
                marks[changes[k]] = changes[k + 1];
        }
    );
    metrics: StepMetrics = {
        filled: { count: 0, name: "Filled" },
        pushes: { count: 0, name: "Pushes" },
        peak: { count: 0, name: "Peak memory" },
    };

    constructor(input: FillInput, options: Record<string, unknown> = {}) {
        super(input.cols, input.rows, options);
        this.start = input.start;
        this.walls = input.walls;
        this.marks = new Int32Array(this.size);
        const [filled, pushes, peak] = this.metricNames;
        this.metrics.filled.name = filled;
        this.metrics.pushes.name = pushes;
        this.metrics.peak.name = peak;
        this.emit("initial", -1, {});
        this.run();
        this.emit("finish", -1, {});
        this.snapshots.build(this.steps.length);
    }

    /* Prototype getters: valid while the base constructor runs. */
    get metricNames(): [string, string, string] {
        return ["Filled", "Pushes", "Peak memory"];
    }

    get mode(): "order" | "label" {
        return "order";
    }

    protected abstract run(): void;

    protected open(x: number, y: number): boolean {
        return this.inside(x, y) && this.walls[this.at(x, y)] === 0;
    }

    /** Queues every open, untouched neighbour and returns them. */
    protected pushNeighbours(
        cell: number,
        dirs: ReadonlyArray<readonly [number, number]>
    ): number[] {
        const [x, y] = this.xy(cell);
        const added: number[] = [];
        for (const [dx, dy] of dirs) {
            if (!this.open(x + dx, y + dy)) continue;
            const next = this.at(x + dx, y + dy);
            if (this.marks[next] !== 0) continue;
            this.push(next);
            added.push(next);
        }
        return added;
    }

    // ---------- Recording ----------

    protected setMark(cell: number, value: number): void {
        this.marks[cell] = value;
        this.pending.push(cell, value);
    }

    protected push(cell: number): void {
        this.metrics.pushes.count += 1;
        this.setMark(cell, MARK_QUEUED);
    }

    protected paint(cell: number, mark = this.filled + 1): void {
        this.filled += 1;
        this.metrics.filled.count = this.filled;
        this.setMark(cell, mark);
    }

    protected memory(size: number): void {
        if (size > this.metrics.peak.count) this.metrics.peak.count = size;
    }

    /** Closes a step with every mark set since the previous one. */
    protected emit(
        type: FillStepType,
        cell: number,
        { instructionId }: StepOptions
    ): void {
        this.steps.push({
            type,
            cell,
            changes: this.pending,
            instructionId,
            metrics: this.metricsSnapshot(),
        });
        this.orders.push(this.filled);
        this.pending = [];
    }

    getStateByStepsIndex(index: number): FillState {
        const last = this.clampStep(index);
        return {
            marks: this.snapshots.at(last),
            cell: this.steps[last]?.cell ?? -1,
            type: this.steps[last]?.type ?? "initial",
            order: this.orders[last] ?? 0,
            mode: this.mode,
        };
    }
}
