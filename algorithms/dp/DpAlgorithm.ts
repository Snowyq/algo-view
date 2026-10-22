import type { DpInput } from "../../utils/dpInput";
import { Algorithm } from "../Algorithm";
import type {
    AlgorithmInstructions,
    StepAlgorithm,
    StepMetrics,
} from "../types";

/*
 * Dynamic programming as a table filled cell by cell. Every write shows
 * the cells it was computed from; at the end the answer is traced back
 * through the table. Subclasses describe the table (setup) and fill it
 * (solve); this base records and replays.
 */

export type DpStepType = "initial" | "fill" | "trace" | "finish";

export type DpStep = {
    type: DpStepType;
    /** Cell index (row * cols + col) written or traced; -1 = none. */
    cell: number;
    value: number;
    /** Cells this value was read from. */
    deps: number[];
    instructionId?: string[];
    metrics: StepMetrics;
};

export type DpTable = {
    rows: number;
    cols: number;
    rowLabels: string[];
    colLabels: string[];
    /** What the row/column axes mean, for the corner label. */
    corner: string;
};

export type DpState = {
    table: DpTable;
    /** NaN = not filled yet. */
    values: Float64Array;
    traced: Uint8Array;
    cell: number;
    deps: number[];
    type: DpStepType;
};

type StepOptions = { instructionId?: string[] };

const SNAPSHOT_EVERY = 64;

export abstract class DpAlgorithm
    extends Algorithm
    implements StepAlgorithm<DpStep, DpState>
{
    table: DpTable = {
        rows: 0,
        cols: 0,
        rowLabels: [],
        colLabels: [],
        corner: "",
    };
    steps: DpStep[] = [];
    protected values: Float64Array = new Float64Array(0);
    private snapshots = new Map<
        number,
        { values: Float64Array; traced: Uint8Array }
    >();
    metrics: StepMetrics = {
        cells: { count: 0, name: "Cells" },
        reads: { count: 0, name: "Reads" },
        answer: { count: 0, name: "Answer" },
    };

    constructor(input: DpInput, options: Record<string, unknown> = {}) {
        super();
        this.options = options;
        this.table = this.setup(input);
        this.values = new Float64Array(this.table.rows * this.table.cols).fill(
            Number.NaN
        );
        this.push("initial", -1, Number.NaN, [], {});
        this.solve(input);
        this.push("finish", -1, Number.NaN, [], {});
        this.buildSnapshots();
    }

    protected abstract setup(input: DpInput): DpTable;
    protected abstract solve(input: DpInput): void;

    // ---------- Recording ----------

    private push(
        type: DpStepType,
        cell: number,
        value: number,
        deps: number[],
        { instructionId }: StepOptions
    ): void {
        const metrics: StepMetrics = {};
        for (const key in this.metrics) metrics[key] = { ...this.metrics[key] };
        this.steps.push({ type, cell, value, deps, instructionId, metrics });
    }

    private buildSnapshots(): void {
        const values = new Float64Array(this.values.length).fill(Number.NaN);
        const traced = new Uint8Array(this.values.length);
        this.steps.forEach((step, index) => {
            if (step.type === "fill") values[step.cell] = step.value;
            if (step.type === "trace") traced[step.cell] = 1;
            if (index % SNAPSHOT_EVERY === 0) {
                this.snapshots.set(index, {
                    values: values.slice(),
                    traced: traced.slice(),
                });
            }
        });
    }

    protected idx(r: number, c: number): number {
        return r * this.table.cols + c;
    }

    protected get(r: number, c: number): number {
        return this.values[this.idx(r, c)];
    }

    /** Write a cell, showing the cells it was computed from. */
    protected fill(
        r: number,
        c: number,
        value: number,
        deps: Array<[number, number]>,
        options: StepOptions = {}
    ): void {
        const cell = this.idx(r, c);
        this.values[cell] = value;
        this.metrics.cells.count += 1;
        this.metrics.reads.count += deps.length;
        this.push(
            "fill",
            cell,
            value,
            deps.map(([dr, dc]) => this.idx(dr, dc)),
            options
        );
    }

    protected trace(r: number, c: number, options: StepOptions = {}): void {
        this.push("trace", this.idx(r, c), this.get(r, c), [], options);
    }

    protected answer(value: number): void {
        this.metrics.answer.count = Number.isFinite(value) ? value : -1;
    }

    // ---------- Replay API ----------

    getStepsLength(): number {
        return this.steps.length;
    }

    getStepByIndex(index: number): DpStep | undefined {
        return this.steps[index];
    }

    getMetrics(): StepMetrics {
        return this.steps[this.steps.length - 1]?.metrics ?? this.metrics;
    }

    getStateByStepsIndex(index: number): DpState {
        const last = Math.max(0, Math.min(index, this.steps.length - 1));
        const base = last - (last % SNAPSHOT_EVERY);
        const snap = this.snapshots.get(base);
        const values = snap
            ? snap.values.slice()
            : new Float64Array(this.values.length).fill(Number.NaN);
        const traced = snap
            ? snap.traced.slice()
            : new Uint8Array(this.values.length);
        for (let i = base + 1; i <= last; i += 1) {
            const step = this.steps[i];
            if (step.type === "fill") values[step.cell] = step.value;
            if (step.type === "trace") traced[step.cell] = 1;
        }
        const step = this.steps[last];
        return {
            table: this.table,
            values,
            traced,
            cell: step?.cell ?? -1,
            deps: step?.deps ?? [],
            type: step?.type ?? "initial",
        };
    }

    static getInstructions(): AlgorithmInstructions {
        return {};
    }
}
