import type { FindInput } from "../../utils/findInput";
import {
    ForwardReplay,
    RecordedAlgorithm,
    type StepOptions,
} from "../RecordedAlgorithm";
import type { StepMetrics } from "../types";

export type FindStepType =
    | "initial"
    | "probe"
    | "narrow"
    | "found"
    | "miss"
    | "finish";

export type FindStep = {
    type: FindStepType;
    /** Index compared on this step (-1 = none). */
    probe: number;
    /** Live search range, inclusive. */
    lo: number;
    hi: number;
    /** Where the target was found (-1 = not yet / never). */
    found: number;
    instructionId?: string[];
    metrics: StepMetrics;
};

export type FindState = FindStep & {
    /** Every index probed up to this step. */
    probed: Uint8Array;
};

/** Base for array searches; subclasses report through probe/narrow/found/miss. */
export abstract class FindAlgorithm extends RecordedAlgorithm<
    FindStep,
    FindState
> {
    values: number[];
    target: number;
    protected lo = 0;
    protected hi = 0;
    protected foundAt = -1;
    metrics: StepMetrics = {
        probes: { count: 0, name: "Probes" },
        range: { count: 0, name: "Range" },
    };
    private probed = new ForwardReplay(
        () => new Uint8Array(this.values.length),
        (probed, index) => {
            const probe = this.steps[index].probe;
            if (probe >= 0) probed[probe] = 1;
        }
    );

    constructor(input: FindInput, options: Record<string, unknown> = {}) {
        super(options);
        this.values = input.values;
        this.target = input.target;
        this.hi = input.values.length - 1;
        this.metrics.range.count = input.values.length;
        this.push("initial", -1, {});
        this.search();
        this.push("finish", -1, {});
    }

    abstract search(): void;

    private push(
        type: FindStepType,
        probe: number,
        { instructionId }: StepOptions
    ): void {
        this.steps.push({
            type,
            probe,
            lo: this.lo,
            hi: this.hi,
            found: this.foundAt,
            instructionId,
            metrics: this.metricsSnapshot(),
        });
    }

    protected count(key: string, name: string, amount = 1): void {
        const metric = this.metrics[key] ?? { count: 0, name };
        metric.count += amount;
        this.metrics[key] = metric;
    }

    /** Compare values[i] with the target: -1 smaller, 0 equal, 1 bigger. */
    protected probe(i: number, options: StepOptions = {}): number {
        this.count("probes", "Probes");
        this.push("probe", i, options);
        const value = this.values[i];
        return value === this.target ? 0 : value < this.target ? -1 : 1;
    }

    protected narrow(lo: number, hi: number, options: StepOptions = {}): void {
        this.lo = lo;
        this.hi = hi;
        this.metrics.range.count = Math.max(0, hi - lo + 1);
        this.push("narrow", -1, options);
    }

    protected found(i: number, options: StepOptions = {}): void {
        this.foundAt = i;
        this.lo = i;
        this.hi = i;
        this.metrics.range.count = 1;
        this.push("found", i, options);
    }

    protected miss(options: StepOptions = {}): void {
        this.count("noPath", "Not found");
        this.metrics.range.count = 0;
        this.push("miss", -1, options);
    }

    protected giveUp(): void {
        this.count("gaveUp", "Gave up");
        this.push("miss", -1, {});
    }

    getStateByStepsIndex(index: number): FindState {
        const k = this.clampStep(index);
        return { ...this.steps[k], probed: this.probed.at(k) };
    }
}
