import type { Point, PointsInput } from "../../utils/pointsInput";
import { Algorithm } from "../Algorithm";
import type {
    AlgorithmInstructions,
    StepAlgorithm,
    StepMetrics,
} from "../types";

/*
 * Convex hull of a point set. Every algorithm boils down to orientation
 * tests: does c lie left of the line a → b? Steps record those tests,
 * plus the current hull candidate as a list of segments and which points
 * are already known to be inside. Arrays are shared between steps until
 * they change, so long runs stay cheap.
 */

export type HullStepType =
    | "initial"
    | "test"
    | "push"
    | "pop"
    | "edge"
    | "sort"
    | "finish";

export const POINT_IDLE = 0;
export const POINT_INSIDE = 1;
export const POINT_HULL = 2;

export type HullStep = {
    type: HullStepType;
    a: number;
    b: number;
    c: number;
    /** Test result: c is strictly left of a → b (counter-clockwise). */
    ok: boolean;
    /** Flattened segment pairs of the current candidate. */
    lines: Int16Array;
    status: Uint8Array;
    /** Closed polygon (at the end). */
    closed: boolean;
    instructionId?: string[];
    metrics: StepMetrics;
};

export type HullState = HullStep;

type StepOptions = { instructionId?: string[] };

export abstract class HullAlgorithm
    extends Algorithm
    implements StepAlgorithm<HullStep, HullState>
{
    points: Point[];
    steps: HullStep[] = [];
    private lines = new Int16Array(0);
    private status: Uint8Array;
    private closed = false;
    metrics: StepMetrics = {
        tests: { count: 0, name: "Orientation tests" },
        discarded: { count: 0, name: "Discarded" },
        hull: { count: 0, name: "Hull size" },
    };

    constructor(input: PointsInput, options: Record<string, unknown> = {}) {
        super();
        this.options = options;
        this.points = input.points;
        this.status = new Uint8Array(input.points.length);
        this.emit("initial", -1, -1, -1, false, {});
        const hull = this.run();
        this.metrics.hull.count = hull.length;
        const status = new Uint8Array(this.points.length).fill(POINT_INSIDE);
        hull.forEach((i) => (status[i] = POINT_HULL));
        this.status = status;
        this.setChain(hull, true);
        this.emit("finish", -1, -1, -1, false, {});
    }

    /** Returns the hull vertices in order. */
    protected abstract run(): number[];

    // ---------- Geometry ----------

    /** Cross product in math orientation (screen y flipped). */
    protected cross(a: number, b: number, c: number): number {
        const p = this.points;
        return (
            (p[b].x - p[a].x) * -(p[c].y - p[a].y) -
            -(p[b].y - p[a].y) * (p[c].x - p[a].x)
        );
    }

    protected dist2(a: number, b: number): number {
        const p = this.points;
        return (p[a].x - p[b].x) ** 2 + (p[a].y - p[b].y) ** 2;
    }

    /** Counted, visible orientation test. Returns the cross product. */
    protected test(
        a: number,
        b: number,
        c: number,
        options: StepOptions = {}
    ): number {
        const value = this.cross(a, b, c);
        this.metrics.tests.count += 1;
        this.emit("test", a, b, c, value > 0, options);
        return value;
    }

    // ---------- State ----------

    protected setChain(chain: number[], closed = false): void {
        const pairs: number[] = [];
        for (let k = 0; k + 1 < chain.length; k += 1)
            pairs.push(chain[k], chain[k + 1]);
        if (closed && chain.length > 2)
            pairs.push(chain[chain.length - 1], chain[0]);
        this.lines = Int16Array.from(pairs);
        this.closed = closed;
    }

    protected setSegments(pairs: number[]): void {
        this.lines = Int16Array.from(pairs);
    }

    protected mark(point: number, value: number): void {
        if (this.status[point] === value) return;
        if (value === POINT_INSIDE && this.status[point] !== POINT_INSIDE) {
            this.metrics.discarded.count += 1;
        }
        this.status = this.status.slice();
        this.status[point] = value;
        this.metrics.hull.count = this.status.reduce(
            (sum, v) => sum + (v === POINT_HULL ? 1 : 0),
            0
        );
    }

    protected emit(
        type: HullStepType,
        a: number,
        b: number,
        c: number,
        ok: boolean,
        { instructionId }: StepOptions
    ): void {
        const metrics: StepMetrics = {};
        for (const k in this.metrics) metrics[k] = { ...this.metrics[k] };
        this.steps.push({
            type,
            a,
            b,
            c,
            ok,
            lines: this.lines,
            status: this.status,
            closed: this.closed,
            instructionId,
            metrics,
        });
    }

    // ---------- Replay API ----------

    getStepsLength(): number {
        return this.steps.length;
    }

    getStepByIndex(index: number): HullStep | undefined {
        return this.steps[index];
    }

    getMetrics(): StepMetrics {
        return this.steps[this.steps.length - 1]?.metrics ?? this.metrics;
    }

    getStateByStepsIndex(index: number): HullState {
        return this.steps[Math.max(0, Math.min(index, this.steps.length - 1))];
    }

    static getInstructions(): AlgorithmInstructions {
        return {};
    }
}
