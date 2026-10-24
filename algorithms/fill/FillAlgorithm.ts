import type { FillInput } from "../../utils/fillInput";
import { Algorithm } from "../Algorithm";
import type {
    AlgorithmInstructions,
    StepAlgorithm,
    StepMetrics,
} from "../types";

/*
 * Filling a bitmap region from a start cell. Marks per cell: 0 untouched,
 * -1 waiting in the queue / stack, k > 0 filled as the k-th cell (or,
 * for labelling, region id k). One step = one cell (or one span) filled
 * together with the cells it queued; replay from snapshots.
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

type StepOptions = { instructionId?: string[] };

const SNAPSHOT_EVERY = 48;
export const DIRS4: Array<[number, number]> = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
];

export abstract class FillAlgorithm
    extends Algorithm
    implements StepAlgorithm<FillStep, FillState>
{
    cols: number;
    rows: number;
    start: number;
    protected walls: number[];
    protected marks: Int32Array;
    protected filled = 0;
    steps: FillStep[] = [];
    private pending: number[] = [];
    private orders: number[] = [];
    private snapshots = new Map<number, Int32Array>();
    metrics: StepMetrics = {
        filled: { count: 0, name: "Filled" },
        pushes: { count: 0, name: "Pushes" },
        peak: { count: 0, name: "Peak memory" },
    };

    constructor(input: FillInput, options: Record<string, unknown> = {}) {
        super();
        this.options = options;
        this.cols = input.cols;
        this.rows = input.rows;
        this.start = input.start;
        this.walls = input.walls;
        this.marks = new Int32Array(input.cols * input.rows);
        const names = this.metricNames;
        this.metrics.filled.name = names[0];
        this.metrics.pushes.name = names[1];
        this.metrics.peak.name = names[2];
        this.emit("initial", -1, {});
        this.run();
        this.emit("finish", -1, {});
        this.buildSnapshots();
    }

    /* Prototype getters: valid while the base constructor runs. */
    get metricNames(): [string, string, string] {
        return ["Filled", "Pushes", "Peak memory"];
    }

    get mode(): "order" | "label" {
        return "order";
    }

    protected abstract run(): void;

    // ---------- Grid ----------

    protected open(x: number, y: number): boolean {
        return (
            x >= 0 &&
            y >= 0 &&
            x < this.cols &&
            y < this.rows &&
            this.walls[y * this.cols + x] === 0
        );
    }

    protected xy(cell: number): [number, number] {
        return [cell % this.cols, Math.floor(cell / this.cols)];
    }

    protected at(x: number, y: number): number {
        return y * this.cols + x;
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

    protected paint(cell: number): void {
        this.filled += 1;
        this.metrics.filled.count = this.filled;
        this.setMark(cell, this.filled);
    }

    protected memory(size: number): void {
        if (size > this.metrics.peak.count) this.metrics.peak.count = size;
    }

    protected emit(
        type: FillStepType,
        cell: number,
        { instructionId }: StepOptions
    ): void {
        const metrics: StepMetrics = {};
        for (const k in this.metrics) metrics[k] = { ...this.metrics[k] };
        this.steps.push({
            type,
            cell,
            changes: this.pending,
            instructionId,
            metrics,
        });
        this.orders.push(this.filled);
        this.pending = [];
    }

    private buildSnapshots(): void {
        const marks = new Int32Array(this.marks.length);
        this.steps.forEach((step, index) => {
            for (let k = 0; k < step.changes.length; k += 2) {
                marks[step.changes[k]] = step.changes[k + 1];
            }
            if (index % SNAPSHOT_EVERY === 0)
                this.snapshots.set(index, marks.slice());
        });
    }

    // ---------- Replay API ----------

    getStepsLength(): number {
        return this.steps.length;
    }

    getStepByIndex(index: number): FillStep | undefined {
        return this.steps[index];
    }

    getMetrics(): StepMetrics {
        return this.steps[this.steps.length - 1]?.metrics ?? this.metrics;
    }

    getStateByStepsIndex(index: number): FillState {
        const last = Math.max(0, Math.min(index, this.steps.length - 1));
        const base = last - (last % SNAPSHOT_EVERY);
        const marks = (
            this.snapshots.get(base) ?? new Int32Array(this.marks.length)
        ).slice();
        for (let i = base + 1; i <= last; i += 1) {
            const changes = this.steps[i].changes;
            for (let k = 0; k < changes.length; k += 2)
                marks[changes[k]] = changes[k + 1];
        }
        return {
            marks,
            cell: this.steps[last]?.cell ?? -1,
            type: this.steps[last]?.type ?? "initial",
            order: this.orders[last] ?? 0,
            mode: this.mode,
        };
    }

    static getInstructions(): AlgorithmInstructions {
        return {};
    }
}
