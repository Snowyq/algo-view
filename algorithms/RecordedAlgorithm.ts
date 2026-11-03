import { Algorithm } from "./Algorithm";
import type {
    AlgorithmInstructions,
    StepAlgorithm,
    StepBase,
    StepMetrics,
} from "./types";

export type StepOptions = { instructionId?: string[] };

type RecordedStep = StepBase & { metrics: StepMetrics };

export function copyMetrics(metrics: StepMetrics): StepMetrics {
    const copy: StepMetrics = {};
    for (const key in metrics) copy[key] = { ...metrics[key] };
    return copy;
}

/** Base for algorithms that record every step up front and replay them. */
export abstract class RecordedAlgorithm<TStep extends RecordedStep, TState>
    extends Algorithm
    implements StepAlgorithm<TStep, TState>
{
    declare steps: TStep[];
    abstract metrics: StepMetrics;

    constructor(options: Record<string, unknown>) {
        super();
        this.options = options;
    }

    abstract getStateByStepsIndex(index: number): TState;

    getStepByIndex(index: number): TStep | undefined {
        return this.steps[index];
    }

    getMetrics(): StepMetrics {
        return this.steps[this.steps.length - 1]?.metrics ?? this.metrics;
    }

    static getInstructions(): AlgorithmInstructions {
        return {};
    }

    /** Copy of the counters, stored with each step. */
    protected metricsSnapshot(): StepMetrics {
        return copyMetrics(this.metrics);
    }

    protected clampStep(index: number): number {
        return Math.max(0, Math.min(index, this.steps.length - 1));
    }
}

type ApplyStep<S> = (state: S, step: number) => void;

/** Saves a copy of the state every few steps; any step replays from the nearest one. */
export class Snapshots<S> {
    private saved = new Map<number, S>();

    constructor(
        private every: number,
        private fresh: () => S,
        private copy: (state: S) => S,
        private apply: ApplyStep<S>
    ) {}

    build(stepCount: number): void {
        const live = this.fresh();
        for (let i = 0; i < stepCount; i += 1) {
            this.apply(live, i);
            if (i % this.every === 0) this.saved.set(i, this.copy(live));
        }
    }

    at(index: number): S {
        const base = index - (index % this.every);
        const saved = this.saved.get(base);
        const state = saved ? this.copy(saved) : this.fresh();
        for (let i = base + 1; i <= index; i += 1) this.apply(state, i);
        return state;
    }
}

/** One live state that only rewinds when playback goes backwards. */
export class ForwardReplay<S> {
    private state: S | null = null;
    private index = 0;

    constructor(
        private fresh: () => S,
        private apply: ApplyStep<S>
    ) {}

    at(index: number): S {
        if (!this.state || this.index > index) {
            this.state = this.fresh();
            this.index = 0;
        }
        for (let i = this.index + 1; i <= index; i += 1) {
            this.apply(this.state, i);
        }
        this.index = index;
        return this.state;
    }
}
