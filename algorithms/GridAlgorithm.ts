import { RecordedAlgorithm } from "./RecordedAlgorithm";
import type { StepBase, StepMetrics } from "./types";

/** Up, right, down, left. */
export const DIRS: ReadonlyArray<readonly [number, number]> = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
];

type GridStep = StepBase & { metrics: StepMetrics };

/** Base for path, maze, fill and automata. Cells are y * cols + x. */
export abstract class GridAlgorithm<
    TStep extends GridStep,
    TState,
> extends RecordedAlgorithm<TStep, TState> {
    cols: number;
    rows: number;

    constructor(cols: number, rows: number, options: Record<string, unknown>) {
        super(options);
        this.cols = cols;
        this.rows = rows;
    }

    get size(): number {
        return this.cols * this.rows;
    }

    at(x: number, y: number): number {
        return y * this.cols + x;
    }

    xy(cell: number): [number, number] {
        return [cell % this.cols, Math.floor(cell / this.cols)];
    }

    inside(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.cols && y < this.rows;
    }

    protected setCount(key: string, value: number): void {
        if (this.metrics[key]) this.metrics[key].count = value;
    }
}
