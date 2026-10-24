import type { GraphEdge, GraphInput } from "../../utils/graphInput";
import { Algorithm } from "../Algorithm";
import type {
    AlgorithmInstructions,
    StepAlgorithm,
    StepMetrics,
} from "../types";

/*
 * Graph algorithms on a small weighted graph. Every step carries the
 * node / edge / label changes it made; the state at any step is replayed
 * from the nearest snapshot. Subclasses implement run() with the helpers
 * below and describe what they colour; the worker draws the rest.
 */

export type GraphStepType =
    | "initial"
    | "visit"
    | "check"
    | "take"
    | "reject"
    | "relax"
    | "finish";

export const NODE_IDLE = 0;
export const NODE_FRONTIER = 1;
export const NODE_DONE = 2;

export const EDGE_IDLE = 0;
export const EDGE_SEEN = 1;
export const EDGE_TREE = 2;
export const EDGE_REJECT = 3;

const KIND_NODE = 0;
const KIND_EDGE = 1;
const KIND_LABEL = 2;

export type GraphStep = {
    type: GraphStepType;
    /** Node in focus (-1 = none). */
    node: number;
    /** Edge in focus (-1 = none). */
    edge: number;
    /** Flattened (kind, index, value) triples applied on this step. */
    changes: number[];
    instructionId?: string[];
    metrics: StepMetrics;
};

export type GraphState = {
    nodes: Uint8Array;
    edges: Uint8Array;
    /** Number shown on each node (distance, order…); NaN = none. */
    labels: Float64Array;
    node: number;
    edge: number;
    type: GraphStepType;
    directed: boolean;
};

export type Adjacent = { to: number; edge: number; w: number };

type StepOptions = { instructionId?: string[] };

const SNAPSHOT_EVERY = 32;

export abstract class GraphAlgorithm
    extends Algorithm
    implements StepAlgorithm<GraphStep, GraphState>
{
    nodeCount: number;
    edgeList: GraphEdge[];
    adjacency: Adjacent[][];
    steps: GraphStep[] = [];
    private pending: number[] = [];
    private snapshots = new Map<
        number,
        { nodes: Uint8Array; edges: Uint8Array; labels: Float64Array }
    >();
    metrics: StepMetrics = {
        checks: { count: 0, name: "Edge checks" },
        updates: { count: 0, name: "Updates" },
        weight: { count: 0, name: "Tree weight" },
    };

    constructor(input: GraphInput, options: Record<string, unknown> = {}) {
        super();
        this.options = options;
        this.nodeCount = input.nodes.length;
        this.edgeList = input.edges;
        this.adjacency = Array.from({ length: this.nodeCount }, () => []);
        input.edges.forEach(({ a, b, w }, edge) => {
            this.adjacency[a].push({ to: b, edge, w });
            if (!this.directed) this.adjacency[b].push({ to: a, edge, w });
        });
        // Neighbours in a stable, readable order (left to right).
        this.adjacency.forEach((list) => list.sort((p, q) => p.to - q.to));
        this.emit("initial", -1, -1, {});
        this.run();
        this.emit("finish", -1, -1, {});
        this.buildSnapshots();
    }

    /** Edges point from a to b (a is left of b). Prototype getter so it
        is already right while the constructor runs the algorithm. */
    get directed(): boolean {
        return false;
    }

    protected abstract run(): void;

    // ---------- Recording ----------

    protected setNode(node: number, value: number): void {
        this.pending.push(KIND_NODE, node, value);
    }

    protected setEdge(edge: number, value: number): void {
        this.pending.push(KIND_EDGE, edge, value);
    }

    protected setLabel(node: number, value: number): void {
        this.pending.push(KIND_LABEL, node, value);
    }

    protected count(key: "checks" | "updates" | "weight", by = 1): void {
        this.metrics[key].count += by;
    }

    protected emit(
        type: GraphStepType,
        node: number,
        edge: number,
        { instructionId }: StepOptions
    ): void {
        const metrics: StepMetrics = {};
        for (const key in this.metrics) metrics[key] = { ...this.metrics[key] };
        this.steps.push({
            type,
            node,
            edge,
            changes: this.pending,
            instructionId,
            metrics,
        });
        this.pending = [];
    }

    private fresh(): {
        nodes: Uint8Array;
        edges: Uint8Array;
        labels: Float64Array;
    } {
        return {
            nodes: new Uint8Array(this.nodeCount),
            edges: new Uint8Array(this.edgeList.length),
            labels: new Float64Array(this.nodeCount).fill(Number.NaN),
        };
    }

    private apply(
        target: { nodes: Uint8Array; edges: Uint8Array; labels: Float64Array },
        changes: number[]
    ): void {
        for (let k = 0; k < changes.length; k += 3) {
            const [kind, index, value] = [
                changes[k],
                changes[k + 1],
                changes[k + 2],
            ];
            if (kind === KIND_NODE) target.nodes[index] = value;
            else if (kind === KIND_EDGE) target.edges[index] = value;
            else target.labels[index] = value;
        }
    }

    private buildSnapshots(): void {
        const live = this.fresh();
        this.steps.forEach((step, index) => {
            this.apply(live, step.changes);
            if (index % SNAPSHOT_EVERY === 0) {
                this.snapshots.set(index, {
                    nodes: live.nodes.slice(),
                    edges: live.edges.slice(),
                    labels: live.labels.slice(),
                });
            }
        });
    }

    // ---------- Replay API ----------

    getStepsLength(): number {
        return this.steps.length;
    }

    getStepByIndex(index: number): GraphStep | undefined {
        return this.steps[index];
    }

    getMetrics(): StepMetrics {
        return this.steps[this.steps.length - 1]?.metrics ?? this.metrics;
    }

    getStateByStepsIndex(index: number): GraphState {
        const last = Math.max(0, Math.min(index, this.steps.length - 1));
        const base = last - (last % SNAPSHOT_EVERY);
        const snap = this.snapshots.get(base);
        const state = snap
            ? {
                  nodes: snap.nodes.slice(),
                  edges: snap.edges.slice(),
                  labels: snap.labels.slice(),
              }
            : this.fresh();
        for (let i = base + 1; i <= last; i += 1) {
            this.apply(state, this.steps[i].changes);
        }
        const step = this.steps[last];
        return {
            ...state,
            node: step?.node ?? -1,
            edge: step?.edge ?? -1,
            type: step?.type ?? "initial",
            directed: this.directed,
        };
    }

    static getInstructions(): AlgorithmInstructions {
        return {};
    }
}
