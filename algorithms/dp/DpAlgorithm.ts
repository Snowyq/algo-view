import type { DpInput } from "../../utils/dpInput";
import {
    RecordedAlgorithm,
    Snapshots,
    type StepOptions,
} from "../RecordedAlgorithm";
import type { StepMetrics } from "../types";

/*
 * A DP table filled cell by cell; each write shows the cells it was read
 * from. Subclasses describe the table (setup) and fill it (solve).
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

type DpCells = { values: Float64Array; traced: Uint8Array };

const SNAPSHOT_EVERY = 64;

export abstract class DpAlgorithm extends RecordedAlgorithm<DpStep, DpState> {
    table: DpTable;
    protected values: Float64Array;
    metrics: StepMetrics = {
        cells: { count: 0, name: "Cells" },
        reads: { count: 0, name: "Reads" },
        answer: { count: 0, name: "Answer" },
    };
    private snapshots = new Snapshots<DpCells>(
        SNAPSHOT_EVERY,
        () => this.emptyCells(),
        ({ values, traced }) => ({
            values: values.slice(),
            traced: traced.slice(),
        }),
        (cells, index) => this.applyStep(cells, this.steps[index])
    );

    constructor(input: DpInput, options: Record<string, unknown> = {}) {
        super(options);
        this.table = this.setup(input);
        this.values = new Float64Array(this.table.rows * this.table.cols).fill(
            Number.NaN
        );
        this.push("initial", -1, Number.NaN, [], {});
        this.solve(input);
        this.push("finish", -1, Number.NaN, [], {});
        this.snapshots.build(this.steps.length);
    }

    protected abstract setup(input: DpInput): DpTable;
    protected abstract solve(input: DpInput): void;

    private push(
        type: DpStepType,
        cell: number,
        value: number,
        deps: number[],
        { instructionId }: StepOptions
    ): void {
        const metrics = this.metricsSnapshot();
        this.steps.push({ type, cell, value, deps, instructionId, metrics });
    }

    private emptyCells(): DpCells {
        return {
            values: new Float64Array(this.values.length).fill(Number.NaN),
            traced: new Uint8Array(this.values.length),
        };
    }

    private applyStep({ values, traced }: DpCells, step: DpStep): void {
        if (step.type === "fill") values[step.cell] = step.value;
        if (step.type === "trace") traced[step.cell] = 1;
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

    getStateByStepsIndex(index: number): DpState {
        const last = this.clampStep(index);
        const step = this.steps[last];
        return {
            table: this.table,
            ...this.snapshots.at(last),
            cell: step?.cell ?? -1,
            deps: step?.deps ?? [],
            type: step?.type ?? "initial",
        };
    }
}
