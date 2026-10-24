import type { LifeInput } from "../../utils/lifeInput";
import { Algorithm } from "../Algorithm";
import type {
    AlgorithmInstructions,
    StepAlgorithm,
    StepMetrics,
} from "../types";

/*
 * Cellular automata on a wrapping grid. One step = one generation; every
 * generation is stored whole (grids are small), and a run ends early once
 * the pattern settles into a still life or a period-2 blinker.
 */

export const MAX_GENERATIONS = 150;

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

type StepOptions = { instructionId?: string[] };

export abstract class LifeAlgorithm
    extends Algorithm
    implements StepAlgorithm<LifeStep, LifeState>
{
    cols: number;
    rows: number;
    steps: LifeStep[] = [];
    /** Free slots for subclasses (fields declared here exist before run). */
    protected marker = -1;
    protected heading = 0;
    metrics: StepMetrics = {
        alive: { count: 0, name: "Alive" },
        births: { count: 0, name: "Births" },
        deaths: { count: 0, name: "Deaths" },
    };

    constructor(input: LifeInput, options: Record<string, unknown> = {}) {
        super();
        this.options = options;
        this.cols = input.cols;
        this.rows = input.rows;
        this.setup();
        let cells: Uint8Array = Uint8Array.from(input.cells);
        this.count(cells);
        this.emit("initial", 0, cells, {});
        for (let g = 1; g <= MAX_GENERATIONS; g += 1) {
            const next = this.next(cells);
            for (let i = 0; i < next.length; i += 1) {
                const was = cells[i] === 1;
                const is = next[i] === 1;
                if (is && !was) this.metrics.births.count += 1;
                if (was && !is) this.metrics.deaths.count += 1;
            }
            this.count(next);
            this.emit("generation", g, next, { instructionId: ["g"] });
            const twoBack = this.steps[this.steps.length - 3]?.cells;
            const settled =
                this.settles &&
                (same(next, cells) ||
                    (twoBack !== undefined && same(next, twoBack)));
            cells = next;
            if (settled) break;
        }
        this.emit("finish", this.steps.length - 1, cells, {});
    }

    /* Prototype getters: valid while the base constructor runs. */
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

    private count(cells: Uint8Array): void {
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
        const metrics: StepMetrics = {};
        for (const k in this.metrics) metrics[k] = { ...this.metrics[k] };
        this.steps.push({
            type,
            generation,
            cells,
            marker: this.marker,
            instructionId,
            metrics,
        });
    }

    // ---------- Replay API ----------

    getStepsLength(): number {
        return this.steps.length;
    }

    getStepByIndex(index: number): LifeStep | undefined {
        return this.steps[index];
    }

    getMetrics(): StepMetrics {
        return this.steps[this.steps.length - 1]?.metrics ?? this.metrics;
    }

    getStateByStepsIndex(index: number): LifeState {
        const k = Math.max(0, Math.min(index, this.steps.length - 1));
        const step = this.steps[k];
        return { ...step, previous: this.steps[Math.max(0, k - 1)].cells };
    }

    static getInstructions(): AlgorithmInstructions {
        return {};
    }
}

function same(a: Uint8Array, b: Uint8Array): boolean {
    for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
    return true;
}

/** Life-like rule "Bxx/Syy": born with xx neighbours, survives with yy. */
export abstract class LifeLikeRule extends LifeAlgorithm {
    abstract get born(): number[];
    abstract get survive(): number[];

    protected next(cells: Uint8Array): Uint8Array {
        const born = this.born;
        const survive = this.survive;
        const out = new Uint8Array(cells.length);
        for (let y = 0; y < this.rows; y += 1) {
            for (let x = 0; x < this.cols; x += 1) {
                const i = y * this.cols + x;
                const n = this.neighbours(cells, x, y);
                out[i] = (cells[i] ? survive : born).includes(n) ? 1 : 0;
            }
        }
        return out;
    }

    static ruleInstructions(
        born: number[],
        survive: number[]
    ): AlgorithmInstructions {
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
