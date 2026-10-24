import type { FindInput } from "../../utils/findInput";
import { Algorithm } from "../Algorithm";
import type { AlgorithmInstructions, StepAlgorithm } from "../types";

export type FindStepType =
    | "initial"
    | "probe"
    | "narrow"
    | "found"
    | "miss"
    | "finish";

type FindMetric = { count: number; name: string };
type FindMetrics = Record<string, FindMetric>;

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
    metrics: FindMetrics;
};

export type FindState = FindStep & {
    /** Every index probed up to this step. */
    probed: Uint8Array;
};

type StepOptions = { instructionId?: string[] };

/*
 * Base for array searches. Subclasses implement search() and report
 * through probe / narrow / found / miss; every step is a full, tiny
 * snapshot (range, probe, result), and probed history is replayed.
 */
export abstract class FindAlgorithm
    extends Algorithm
    implements StepAlgorithm<FindStep, FindState>
{
    values: number[];
    target: number;
    steps: FindStep[] = [];
    protected lo = 0;
    protected hi = 0;
    protected foundAt = -1;
    metrics: FindMetrics = {
        probes: { count: 0, name: "Probes" },
        range: { count: 0, name: "Range" },
    };
    private replay: { index: number; probed: Uint8Array } | null = null;

    constructor(input: FindInput, options: Record<string, unknown> = {}) {
        super();
        this.options = options;
        this.values = input.values;
        this.target = input.target;
        this.lo = 0;
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
        const metrics: FindMetrics = {};
        for (const key in this.metrics) metrics[key] = { ...this.metrics[key] };
        this.steps.push({
            type,
            probe,
            lo: this.lo,
            hi: this.hi,
            found: this.foundAt,
            instructionId,
            metrics,
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

    // ---------- Replay API ----------

    getStepsLength(): number {
        return this.steps.length;
    }

    getStepByIndex(index: number): FindStep | undefined {
        return this.steps[index];
    }

    getMetrics(): FindMetrics {
        return this.steps[this.steps.length - 1]?.metrics ?? this.metrics;
    }

    getStateByStepsIndex(index: number): FindState {
        const k = Math.max(0, Math.min(index, this.steps.length - 1));
        // Playback moves forward: extend the cached history when we can.
        let replay = this.replay;
        if (!replay || replay.index > k) {
            replay = { index: 0, probed: new Uint8Array(this.values.length) };
        }
        for (let i = replay.index + 1; i <= k; i += 1) {
            const probe = this.steps[i].probe;
            if (probe >= 0) replay.probed[probe] = 1;
        }
        replay.index = k;
        this.replay = replay;
        return { ...this.steps[k], probed: replay.probed };
    }

    static getInstructions(): AlgorithmInstructions {
        return {};
    }
}
