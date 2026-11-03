import type { GraphEdge, GraphInput } from "../../utils/graphInput";
import {
    RecordedAlgorithm,
    Snapshots,
    type StepOptions,
} from "../RecordedAlgorithm";
import type { StepMetrics } from "../types";

/*
 * Graph algorithms on a small weighted graph. Each step carries the node,
 * edge and label changes it made; subclasses implement run().
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
    /** Number shown on each node (distance, order); NaN = none. */
    labels: Float64Array;
    node: number;
    edge: number;
    type: GraphStepType;
    directed: boolean;
};

export type Adjacent = { to: number; edge: number; w: number };

type GraphMarks = Pick<GraphState, "nodes" | "edges" | "labels">;

const SNAPSHOT_EVERY = 32;

export abstract class GraphAlgorithm extends RecordedAlgorithm<
    GraphStep,
    GraphState
> {
    nodeCount: number;
    edgeList: GraphEdge[];
    adjacency: Adjacent[][];
    metrics: StepMetrics = {
        checks: { count: 0, name: "Edge checks" },
        updates: { count: 0, name: "Updates" },
        weight: { count: 0, name: "Tree weight" },
    };
    private pending: number[] = [];
    /** Current value of every edge, for algorithms that read it back. */
    private edgeValues: Uint8Array;
    private snapshots = new Snapshots<GraphMarks>(
        SNAPSHOT_EVERY,
        () => this.emptyMarks(),
        ({ nodes, edges, labels }) => ({
            nodes: nodes.slice(),
            edges: edges.slice(),
            labels: labels.slice(),
        }),
        (marks, index) => this.applyChanges(marks, this.steps[index].changes)
    );

    constructor(input: GraphInput, options: Record<string, unknown> = {}) {
        super(options);
        this.nodeCount = input.nodes.length;
        this.edgeList = input.edges;
        this.edgeValues = new Uint8Array(input.edges.length);
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
        this.snapshots.build(this.steps.length);
    }

    /** Edges point from a to b. A getter so it works during the constructor. */
    get directed(): boolean {
        return false;
    }

    protected abstract run(): void;

    protected setNode(node: number, value: number): void {
        this.pending.push(KIND_NODE, node, value);
    }

    protected setEdge(edge: number, value: number): void {
        this.edgeValues[edge] = value;
        this.pending.push(KIND_EDGE, edge, value);
    }

    protected edgeAt(edge: number): number {
        return this.edgeValues[edge];
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
        this.steps.push({
            type,
            node,
            edge,
            changes: this.pending,
            instructionId,
            metrics: this.metricsSnapshot(),
        });
        this.pending = [];
    }

    private emptyMarks(): GraphMarks {
        return {
            nodes: new Uint8Array(this.nodeCount),
            edges: new Uint8Array(this.edgeList.length),
            labels: new Float64Array(this.nodeCount).fill(Number.NaN),
        };
    }

    private applyChanges(marks: GraphMarks, changes: number[]): void {
        for (let k = 0; k < changes.length; k += 3) {
            const [kind, index, value] = changes.slice(k, k + 3);
            if (kind === KIND_NODE) marks.nodes[index] = value;
            else if (kind === KIND_EDGE) marks.edges[index] = value;
            else marks.labels[index] = value;
        }
    }

    getStateByStepsIndex(index: number): GraphState {
        const last = this.clampStep(index);
        const step = this.steps[last];
        return {
            ...this.snapshots.at(last),
            node: step?.node ?? -1,
            edge: step?.edge ?? -1,
            type: step?.type ?? "initial",
            directed: this.directed,
        };
    }
}
