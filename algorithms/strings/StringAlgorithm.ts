import type { TextInput } from "../../utils/textInput";
import { Algorithm } from "../Algorithm";
import type {
    AlgorithmInstructions,
    StepAlgorithm,
    StepMetrics,
} from "../types";

/*
 * Pattern matching: the pattern slides along the text. Steps are
 * compares (one character pair), shifts (new alignment), matches, and
 * writes into the helper table some algorithms precompute (KMP prefix
 * table, Horspool shift table, Z array). Matches and the table are
 * cumulative and replayed incrementally.
 */

export type StringStepType =
    | "initial"
    | "compare"
    | "shift"
    | "match"
    | "table"
    | "finish";

export type StringStep = {
    type: StringStepType;
    shift: number;
    /** Text index compared (-1 = none). */
    i: number;
    /** Pattern index compared (-1 = none). */
    j: number;
    ok: boolean;
    tableIndex: number;
    tableValue: number;
    instructionId?: string[];
    metrics: StepMetrics;
};

export type StringState = StringStep & {
    matches: number[];
    table: Float64Array;
    tableLabel: string;
    /** "pattern" = table under the pattern, "text" = under the text. */
    tableOn: "pattern" | "text" | "none";
};

type StepOptions = { instructionId?: string[] };

export abstract class StringAlgorithm
    extends Algorithm
    implements StepAlgorithm<StringStep, StringState>
{
    text: string;
    pattern: string;
    steps: StringStep[] = [];
    protected shiftAt = 0;
    tableLabel = "";
    tableOn: "pattern" | "text" | "none" = "none";
    metrics: StepMetrics = {
        compares: { count: 0, name: "Compares" },
        shifts: { count: 0, name: "Shifts" },
        matches: { count: 0, name: "Matches" },
    };
    private replay: {
        index: number;
        matches: number[];
        table: Float64Array;
    } | null = null;

    constructor(input: TextInput, options: Record<string, unknown> = {}) {
        super();
        this.options = options;
        this.text = input.text;
        this.pattern = input.pattern;
        this.push("initial", -1, -1, false, -1, Number.NaN, {});
        this.search();
        this.push("finish", -1, -1, false, -1, Number.NaN, {});
    }

    abstract search(): void;

    /** Size of the helper table, if the algorithm has one. */
    protected tableSize(): number {
        return this.tableOn === "text" ? this.text.length : this.pattern.length;
    }

    private push(
        type: StringStepType,
        i: number,
        j: number,
        ok: boolean,
        tableIndex: number,
        tableValue: number,
        { instructionId }: StepOptions
    ): void {
        const metrics: StepMetrics = {};
        for (const key in this.metrics) metrics[key] = { ...this.metrics[key] };
        this.steps.push({
            type,
            shift: this.shiftAt,
            i,
            j,
            ok,
            tableIndex,
            tableValue,
            instructionId,
            metrics,
        });
    }

    /** Compare text[i] with pattern[j]. */
    protected compareChars(
        i: number,
        j: number,
        options: StepOptions = {}
    ): boolean {
        const ok = this.text[i] === this.pattern[j];
        this.metrics.compares.count += 1;
        this.push("compare", i, j, ok, -1, Number.NaN, options);
        return ok;
    }

    protected shiftTo(shift: number, options: StepOptions = {}): void {
        this.shiftAt = shift;
        this.metrics.shifts.count += 1;
        this.push("shift", -1, -1, false, -1, Number.NaN, options);
    }

    protected matchAt(shift: number, options: StepOptions = {}): void {
        this.metrics.matches.count += 1;
        this.push("match", shift, -1, true, -1, Number.NaN, options);
    }

    protected writeTable(
        index: number,
        value: number,
        options: StepOptions = {}
    ): void {
        this.push("table", -1, -1, false, index, value, options);
    }

    // ---------- Replay API ----------

    getStepsLength(): number {
        return this.steps.length;
    }

    getStepByIndex(index: number): StringStep | undefined {
        return this.steps[index];
    }

    getMetrics(): StepMetrics {
        return this.steps[this.steps.length - 1]?.metrics ?? this.metrics;
    }

    getStateByStepsIndex(index: number): StringState {
        const k = Math.max(0, Math.min(index, this.steps.length - 1));
        let replay = this.replay;
        if (!replay || replay.index > k) {
            replay = {
                index: 0,
                matches: [],
                table: new Float64Array(this.tableSize()).fill(Number.NaN),
            };
        }
        for (let s = replay.index + 1; s <= k; s += 1) {
            const step = this.steps[s];
            if (step.type === "match") replay.matches.push(step.i);
            if (step.type === "table")
                replay.table[step.tableIndex] = step.tableValue;
        }
        replay.index = k;
        this.replay = replay;
        return {
            ...this.steps[k],
            matches: replay.matches.slice(),
            table: replay.table,
            tableLabel: this.tableLabel,
            tableOn: this.tableOn,
        };
    }

    static getInstructions(): AlgorithmInstructions {
        return {};
    }
}
