import type { TextInput } from "../../utils/textInput";
import {
    ForwardReplay,
    RecordedAlgorithm,
    type StepOptions,
} from "../RecordedAlgorithm";
import type { StepMetrics } from "../types";

/*
 * The pattern slides along the text. Steps are compares, shifts, matches
 * and writes into the helper table (KMP prefix table, Horspool skips, Z array).
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

type StepFields = Pick<
    StringStep,
    "i" | "j" | "ok" | "tableIndex" | "tableValue"
>;

type StringHistory = { matches: number[]; table: Float64Array };

export abstract class StringAlgorithm extends RecordedAlgorithm<
    StringStep,
    StringState
> {
    text: string;
    pattern: string;
    protected shiftAt = 0;
    tableLabel = "";
    tableOn: "pattern" | "text" | "none" = "none";
    metrics: StepMetrics = {
        compares: { count: 0, name: "Compares" },
        shifts: { count: 0, name: "Shifts" },
        matches: { count: 0, name: "Matches" },
    };
    private history = new ForwardReplay<StringHistory>(
        () => ({
            matches: [],
            table: new Float64Array(this.tableSize()).fill(Number.NaN),
        }),
        ({ matches, table }, index) => {
            const step = this.steps[index];
            if (step.type === "match") matches.push(step.i);
            if (step.type === "table") table[step.tableIndex] = step.tableValue;
        }
    );

    constructor(input: TextInput, options: Record<string, unknown> = {}) {
        super(options);
        this.text = input.text;
        this.pattern = input.pattern;
        this.push("initial", {});
        this.search();
        this.push("finish", {});
    }

    abstract search(): void;

    /** Size of the helper table, if the algorithm has one. */
    protected tableSize(): number {
        return this.tableOn === "text" ? this.text.length : this.pattern.length;
    }

    private push(
        type: StringStepType,
        { instructionId }: StepOptions,
        {
            i = -1,
            j = -1,
            ok = false,
            tableIndex = -1,
            tableValue = Number.NaN,
        }: Partial<StepFields> = {}
    ): void {
        this.steps.push({
            type,
            shift: this.shiftAt,
            i,
            j,
            ok,
            tableIndex,
            tableValue,
            instructionId,
            metrics: this.metricsSnapshot(),
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
        this.push("compare", options, { i, j, ok });
        return ok;
    }

    protected shiftTo(shift: number, options: StepOptions = {}): void {
        this.shiftAt = shift;
        this.metrics.shifts.count += 1;
        this.push("shift", options);
    }

    protected matchAt(shift: number, options: StepOptions = {}): void {
        this.metrics.matches.count += 1;
        this.push("match", options, { i: shift, ok: true });
    }

    protected writeTable(
        index: number,
        value: number,
        options: StepOptions = {}
    ): void {
        this.push("table", options, { tableIndex: index, tableValue: value });
    }

    getStateByStepsIndex(index: number): StringState {
        const k = this.clampStep(index);
        const { matches, table } = this.history.at(k);
        return {
            ...this.steps[k],
            matches: matches.slice(),
            table,
            tableLabel: this.tableLabel,
            tableOn: this.tableOn,
        };
    }
}
