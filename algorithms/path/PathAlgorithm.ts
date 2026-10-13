import {
    CELL_MUD,
    CELL_WALL,
    MUD_COST,
    type GridInput,
} from "../../utils/grid";
import { Algorithm } from "../Algorithm";
import type { AlgorithmInstructions } from "../types";

export type PathStepType = "initial" | "frontier" | "visit" | "path" | "finish";

/** Overlay state of a cell at a given step. */
export const OVERLAY_NONE = 0;
export const OVERLAY_FRONTIER = 1;
export const OVERLAY_VISITED = 2;
export const OVERLAY_PATH = 3;

type PathMetric = { count: number; name: string };
type PathMetrics = Record<string, PathMetric>;

export type PathStep = {
    type: PathStepType;
    /** Cells this step changes, and the overlay they get. */
    cells: number[];
    overlay: number;
    /** The cell being expanded right now (-1 = none). */
    current: number;
    instructionId?: string[];
    metrics: PathMetrics;
};

export type PathState = {
    overlay: Uint8Array;
    current: number;
};

type StepOptions = { instructionId?: string[] };

const SNAPSHOT_EVERY = 32;

/*
 * Base for every path-finding algorithm. Subclasses implement search()
 * and report what they do through visit / frontier / tracePath; this
 * class turns that into replayable steps. Like SortAlgorithm, the steps
 * are computed once in the worker; drawing step k rebuilds the overlay
 * from the nearest snapshot.
 */
export abstract class PathAlgorithm extends Algorithm {
    grid: GridInput;
    steps: PathStep[] = [];
    protected overlay: Uint8Array;
    protected current = -1;
    private snapshots = new Map<number, Uint8Array>();
    metrics: PathMetrics = {
        visited: { count: 0, name: "Visited" },
        open: { count: 0, name: "Open" },
        path: { count: 0, name: "Path" },
        cost: { count: 0, name: "Cost" },
    };

    constructor(grid: GridInput, options: Record<string, unknown> = {}) {
        super();
        this.options = options;
        this.grid = grid;
        this.overlay = new Uint8Array(grid.cols * grid.rows);
        this.createSteps();
    }

    abstract search(): void;

    // ---------- Recording ----------

    private createSteps(): void {
        this.pushStep("initial", [], OVERLAY_NONE, {});
        this.search();
        this.current = -1;
        this.pushStep("finish", [], OVERLAY_NONE, {});
        // Snapshots for fast seeking: overlay after step k, every N steps.
        const working = new Uint8Array(this.overlay.length);
        this.steps.forEach((step, index) => {
            step.cells.forEach((cell) => (working[cell] = step.overlay));
            if (index % SNAPSHOT_EVERY === 0) {
                this.snapshots.set(index, working.slice());
            }
        });
    }

    private pushStep(
        type: PathStepType,
        cells: number[],
        overlay: number,
        { instructionId }: StepOptions
    ): void {
        const metrics: PathMetrics = {};
        for (const key in this.metrics) {
            metrics[key] = { ...this.metrics[key] };
        }
        this.steps.push({
            type,
            cells,
            overlay,
            current: this.current,
            instructionId,
            metrics,
        });
    }

    protected count(key: string, name: string, amount = 1): void {
        const metric = this.metrics[key] ?? { count: 0, name };
        metric.count += amount;
        this.metrics[key] = metric;
    }

    protected setCount(key: string, value: number): void {
        if (this.metrics[key]) this.metrics[key].count = value;
    }

    /** The search expands this cell. */
    protected visit(cell: number, options: StepOptions = {}): void {
        if (this.overlay[cell] !== OVERLAY_VISITED) this.count("visited", "Visited");
        this.overlay[cell] = OVERLAY_VISITED;
        this.current = cell;
        this.pushStep("visit", [cell], OVERLAY_VISITED, options);
    }

    /** New cells join the open set (queue, stack or heap). */
    protected frontier(cells: number[], openSize: number, options: StepOptions = {}): void {
        const fresh = cells.filter((cell) => this.overlay[cell] === OVERLAY_NONE);
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

    get size(): number {
        return this.grid.cols * this.grid.rows;
    }

    isWall(cell: number): boolean {
        return this.grid.cells[cell] === CELL_WALL;
    }

    costOf(cell: number): number {
        return this.grid.cells[cell] === CELL_MUD ? MUD_COST : 1;
    }

    /** Open neighbours in a fixed order: up, right, down, left. */
    neighbors(cell: number): number[] {
        const { cols, rows } = this.grid;
        const x = cell % cols;
        const y = (cell - x) / cols;
        const out: number[] = [];
        if (y > 0) out.push(cell - cols);
        if (x < cols - 1) out.push(cell + 1);
        if (y < rows - 1) out.push(cell + cols);
        if (x > 0) out.push(cell - 1);
        return out.filter((n) => !this.isWall(n));
    }

    /** Manhattan distance to the end. */
    heuristic(cell: number): number {
        const { cols, end } = this.grid;
        return (
            Math.abs((cell % cols) - (end % cols)) +
            Math.abs(Math.floor(cell / cols) - Math.floor(end / cols))
        );
    }

    // ---------- Replay API (used by the canvas worker) ----------

    getStepsLength(): number {
        return this.steps.length;
    }

    getStepByIndex(index: number): PathStep | undefined {
        return this.steps[index];
    }

    getMetrics(): PathMetrics {
        return this.steps[this.steps.length - 1]?.metrics ?? this.metrics;
    }

    getStateByStepsIndex(index: number): PathState {
        const last = Math.max(0, Math.min(index, this.steps.length - 1));
        const base = last - (last % SNAPSHOT_EVERY);
        const overlay = (this.snapshots.get(base) ?? new Uint8Array(this.size)).slice();
        for (let i = base + 1; i <= last; i += 1) {
            const step = this.steps[i];
            step.cells.forEach((cell) => (overlay[cell] = step.overlay));
        }
        return { overlay, current: this.steps[last]?.current ?? -1 };
    }

    static getInstructions(): AlgorithmInstructions {
        return {};
    }
}
