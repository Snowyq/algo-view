import type { LifeInput } from "../../utils/lifeInput";
import { GridAlgorithm } from "../GridAlgorithm";
import type { StepOptions } from "../RecordedAlgorithm";
import type { AlgorithmInstructions, StepMetrics } from "../types";

/*
 * Cellular automata on a wrapping grid. One step = one generation, each
 * stored whole (grids are small). A run stops early once the pattern
 * settles into a still life or a period-2 oscillator.
 */

const MAX_GENERATIONS = 150;

export type LifeStepType = "initial" | "generation" | "finish";

export type LifeStep = {
    type: LifeStepType;
    generation: number;
    cells: Uint8Array;
    /** Extra marker (Langton's ant position), -1 = none. */
    marker: number;
    instructionId?: string[];
    metrics: StepMetrics;
};

export type LifeState = LifeStep & { previous: Uint8Array };

export abstract class LifeAlgorithm extends GridAlgorithm<LifeStep, LifeState> {
    /* Declared here: setup() runs before subclass fields exist. */
    protected marker = -1;
    protected heading = 0;
    metrics: StepMetrics = {
        alive: { count: 0, name: "Alive" },
        births: { count: 0, name: "Births" },
        deaths: { count: 0, name: "Deaths" },
    };

    constructor(input: LifeInput, options: Record<string, unknown> = {}) {
        super(input.cols, input.rows, options);
        this.setup();
        let cells: Uint8Array = Uint8Array.from(input.cells);
        this.countAlive(cells);
        this.emit("initial", 0, cells, {});
        for (let g = 1; g <= MAX_GENERATIONS; g += 1) {
            const next = this.next(cells);
            this.countChanges(cells, next);
            this.countAlive(next);
            this.emit("generation", g, next, { instructionId: ["g"] });
            const settled = this.settles && this.repeats(next, cells);
            cells = next;
            if (settled) break;
        }
        this.emit("finish", this.steps.length - 1, cells, {});
    }

    /* Prototype getter: valid while the base constructor runs. */
    get settles(): boolean {
        return true;
    }

    protected setup(): void {}

    protected abstract next(cells: Uint8Array): Uint8Array;

    /** Live (state 1) neighbours of a cell, wrapping at the edges. */
    protected neighbours(cells: Uint8Array, x: number, y: number): number {
        const { cols, rows } = this;
        let n = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
            const yy = (y + dy + rows) % rows;
            for (let dx = -1; dx <= 1; dx += 1) {
                if (!dx && !dy) continue;
                if (cells[yy * cols + ((x + dx + cols) % cols)] === 1) n += 1;
            }
        }
        return n;
    }

    /** `next` (already emitted) equals the previous or the one before. */
    private repeats(next: Uint8Array, previous: Uint8Array): boolean {
        const twoBack = this.steps[this.steps.length - 3]?.cells;
        return (
            same(next, previous) ||
            (twoBack !== undefined && same(next, twoBack))
        );
    }

    private countChanges(before: Uint8Array, after: Uint8Array): void {
        for (let i = 0; i < after.length; i += 1) {
            const was = before[i] === 1;
            const is = after[i] === 1;
            if (is && !was) this.metrics.births.count += 1;
            if (was && !is) this.metrics.deaths.count += 1;
        }
    }

    private countAlive(cells: Uint8Array): void {
        let alive = 0;
        for (let i = 0; i < cells.length; i += 1)
            if (cells[i] === 1) alive += 1;
        this.metrics.alive.count = alive;
    }

    private emit(
        type: LifeStepType,
        generation: number,
        cells: Uint8Array,
        { instructionId }: StepOptions
    ): void {
        this.steps.push({
            type,
            generation,
            cells,
            marker: this.marker,
            instructionId,
            metrics: this.metricsSnapshot(),
        });
    }

    getStateByStepsIndex(index: number): LifeState {
        const k = this.clampStep(index);
        return {
            ...this.steps[k],
            previous: this.steps[Math.max(0, k - 1)].cells,
        };
    }
}

function same(a: Uint8Array, b: Uint8Array): boolean {
    for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
    return true;
}

/** Life-like rule "Bxx/Syy": born with xx neighbours, survives with yy. */
export abstract class LifeLikeRule extends LifeAlgorithm {
    /* Static so they are set before the base constructor runs. */
    static born: number[] = [];
    static survive: number[] = [];

    protected next(cells: Uint8Array): Uint8Array {
        const { born, survive } = this.constructor as typeof LifeLikeRule;
        const out = new Uint8Array(cells.length);
        for (let y = 0; y < this.rows; y += 1) {
            for (let x = 0; x < this.cols; x += 1) {
                const i = this.at(x, y);
                const n = this.neighbours(cells, x, y);
                out[i] = (cells[i] ? survive : born).includes(n) ? 1 : 0;
            }
        }
        return out;
    }

    static getInstructions(): AlgorithmInstructions {
        const { born, survive } = this;
        return {
            g: { line: "for every cell: n = live neighbours;", indent: 0 },
            b: { line: `dead and n ∈ {${born.join(",")}} → born;`, indent: 1 },
            s: {
                line: `alive and n ∈ {${survive.join(",")}} → stays;`,
                indent: 1,
            },
            d: { line: "otherwise → dead;", indent: 1 },
        };
    }
}
