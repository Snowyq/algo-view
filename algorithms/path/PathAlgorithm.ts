import {
    CELL_MUD,
    CELL_WALL,
    MUD_COST,
    type GridInput,
} from "../../utils/grid";
import type { StepMetrics } from "../types";
import { Snapshots, type StepOptions } from "../RecordedAlgorithm";
import { GridAlgorithm } from "../GridAlgorithm";

export type PathStepType = "initial" | "frontier" | "visit" | "path" | "finish";

/** Overlay state of a cell at a given step. */
export const OVERLAY_NONE = 0;
export const OVERLAY_FRONTIER = 1;
export const OVERLAY_VISITED = 2;
export const OVERLAY_PATH = 3;

export type PathStep = {
    type: PathStepType;
    /** Cells this step changes, and the overlay they get. */
    cells: number[];
    overlay: number;
    /** The cell being expanded right now (-1 = none). */
    current: number;
    instructionId?: string[];
    metrics: StepMetrics;
};

export type PathState = {
    overlay: Uint8Array;
    current: number;
};

const SNAPSHOT_EVERY = 32;

/*
 * Base for every path-finding algorithm. Subclasses implement search()
 * and report through visit / frontier / tracePath.
 */
export abstract class PathAlgorithm extends GridAlgorithm<PathStep, PathState> {
    grid: GridInput;
    protected overlay: Uint8Array;
    protected current = -1;
    private snapshots = new Snapshots<Uint8Array>(
        SNAPSHOT_EVERY,
        () => new Uint8Array(this.size),
        (overlay) => overlay.slice(),
        (overlay, index) => {
            const step = this.steps[index];
            step.cells.forEach((cell) => (overlay[cell] = step.overlay));
        }
    );
    metrics: StepMetrics = {
        visited: { count: 0, name: "Visited" },
        open: { count: 0, name: "Open" },
        path: { count: 0, name: "Path" },
        cost: { count: 0, name: "Cost" },
    };

    constructor(grid: GridInput, options: Record<string, unknown> = {}) {
        super(grid.cols, grid.rows, options);
        this.grid = grid;
        this.overlay = new Uint8Array(this.size);
        this.pushStep("initial", [], OVERLAY_NONE, {});
        this.search();
        this.current = -1;
        this.pushStep("finish", [], OVERLAY_NONE, {});
        this.snapshots.build(this.steps.length);
    }

    abstract search(): void;

    // ---------- Recording ----------

    private pushStep(
        type: PathStepType,
        cells: number[],
        overlay: number,
        { instructionId }: StepOptions
    ): void {
        this.steps.push({
            type,
            cells,
            overlay,
            current: this.current,
            instructionId,
            metrics: this.metricsSnapshot(),
        });
    }

    protected count(key: string, name: string, amount = 1): void {
        const metric = this.metrics[key] ?? { count: 0, name };
        metric.count += amount;
        this.metrics[key] = metric;
    }

    /** The search expands this cell. */
    protected visit(cell: number, options: StepOptions = {}): void {
        if (this.overlay[cell] !== OVERLAY_VISITED)
            this.count("visited", "Visited");
        this.overlay[cell] = OVERLAY_VISITED;
        this.current = cell;
        this.pushStep("visit", [cell], OVERLAY_VISITED, options);
    }

    /** New cells join the open set (queue, stack or heap). */
    protected frontier(
        cells: number[],
        openSize: number,
        options: StepOptions = {}
    ): void {
        const fresh = cells.filter(
            (cell) => this.overlay[cell] === OVERLAY_NONE
        );
        fresh.forEach((cell) => (this.overlay[cell] = OVERLAY_FRONTIER));
        this.setCount("open", openSize);
        if (fresh.length > 0) {
            this.pushStep("frontier", fresh, OVERLAY_FRONTIER, options);
        }
    }

    /** Walk cameFrom back from `to`, then draw the path from the start. */
    protected tracePath(
        cameFrom: Int32Array,
        to: number,
        options: StepOptions = {}
    ): void {
        const path: number[] = [];
        for (let cell = to; cell !== -1; cell = cameFrom[cell]) {
            path.push(cell);
            if (cell === this.grid.start) break;
        }
        path.reverse();
        this.markPath(path, options);
    }

    protected markPath(path: number[], options: StepOptions = {}): void {
        this.current = -1;
        let cost = 0;
        path.forEach((cell, index) => {
            if (index > 0) cost += this.costOf(cell);
            this.overlay[cell] = OVERLAY_PATH;
            this.setCount("path", index + 1);
            this.setCount("cost", cost);
            this.pushStep("path", [cell], OVERLAY_PATH, options);
        });
    }

    protected noPath(): void {
        this.count("noPath", "No path");
    }

    protected giveUp(): void {
        this.count("gaveUp", "Gave up");
    }

    // ---------- Grid helpers ----------

    /** -1 for every cell: nothing reached yet. */
    protected emptyCameFrom(): Int32Array {
        return new Int32Array(this.size).fill(-1);
    }

    isWall(cell: number): boolean {
        return this.grid.cells[cell] === CELL_WALL;
    }

    costOf(cell: number): number {
        return this.grid.cells[cell] === CELL_MUD ? MUD_COST : 1;
    }

    /** Open neighbours in a fixed order: up, right, down, left. */
    neighbors(cell: number): number[] {
        const [x, y] = this.xy(cell);
        const out: number[] = [];
        if (y > 0) out.push(cell - this.cols);
        if (x < this.cols - 1) out.push(cell + 1);
        if (y < this.rows - 1) out.push(cell + this.cols);
        if (x > 0) out.push(cell - 1);
        return out.filter((n) => !this.isWall(n));
    }

    /** Manhattan distance to the end. */
    heuristic(cell: number): number {
        const [x, y] = this.xy(cell);
        const [endX, endY] = this.xy(this.grid.end);
        return Math.abs(x - endX) + Math.abs(y - endY);
    }

    getStateByStepsIndex(index: number): PathState {
        const last = this.clampStep(index);
        return {
            overlay: this.snapshots.at(last),
            current: this.steps[last]?.current ?? -1,
        };
    }
}
