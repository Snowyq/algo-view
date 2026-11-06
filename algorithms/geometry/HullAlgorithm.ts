import type { Point, PointsInput } from "../../utils/pointsInput";
import { RecordedAlgorithm, type StepOptions } from "../RecordedAlgorithm";
import type { StepMetrics } from "../types";

/*
 * Convex hull. Every algorithm boils down to orientation tests (is c left
 * of a -> b?). Steps share their arrays until they change, so long runs stay cheap.
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
    /** Test result: c is strictly left of a -> b (counter-clockwise). */
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

export abstract class HullAlgorithm extends RecordedAlgorithm<
    HullStep,
    HullState
> {
    points: Point[];
    private lines = new Int16Array(0);
    private status: Uint8Array;
    private closed = false;
    metrics: StepMetrics = {
        tests: { count: 0, name: "Orientation tests" },
        discarded: { count: 0, name: "Discarded" },
        hull: { count: 0, name: "Hull size" },
    };

    constructor(input: PointsInput, options: Record<string, unknown> = {}) {
        super(options);
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
            metrics: this.metricsSnapshot(),
        });
    }

    /** Pops points that do not turn left, then pushes i. `done` is drawn before the chain. */
    protected pushTurningLeft(
        chain: number[],
        i: number,
        done: number[],
        [testId, popId, pushId]: [string, string, string]
    ): void {
        while (chain.length >= 2) {
            const turn = this.test(
                chain[chain.length - 2],
                chain[chain.length - 1],
                i,
                { instructionId: [testId] }
            );
            if (turn > 0) break;
            const dropped = chain.pop()!;
            if (!done.includes(dropped)) this.mark(dropped, POINT_INSIDE);
            this.setChain([...done, ...chain]);
            this.emit("pop", dropped, -1, i, false, { instructionId: [popId] });
        }
        chain.push(i);
        this.mark(i, POINT_HULL);
        this.setChain([...done, ...chain]);
        this.emit("push", i, -1, -1, true, { instructionId: [pushId] });
    }

    getStateByStepsIndex(index: number): HullState {
        return this.steps[this.clampStep(index)];
    }
}
