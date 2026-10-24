import type { TreeInput } from "../../utils/treeInput";
import { Algorithm } from "../Algorithm";
import type {
    AlgorithmInstructions,
    StepAlgorithm,
    StepMetrics,
} from "../types";

/*
 * Trees built by inserting keys one at a time. Nodes live in slots
 * (key / left / right / parent / tag arrays); rotations rewire them in
 * place. The trees are tiny (≤ 31 nodes), so every step simply keeps a
 * full snapshot and any step replays in O(1).
 */

export type TreeStepType =
    | "initial"
    | "compare"
    | "insert"
    | "rotate"
    | "recolor"
    | "swap"
    | "finish";

/** What the per-node tag means, for the renderer. */
export type TagKind = "none" | "color" | "height" | "priority";

export const NIL = -1;
export const BLACK = 0;
export const RED = 1;

export type TreeStep = {
    type: TreeStepType;
    focus: number;
    other: number;
    /** Index of the key being inserted. */
    keyIndex: number;
    /** [root, size, keys…, left…, right…, tag…] */
    snapshot: Int16Array;
    instructionId?: string[];
    metrics: StepMetrics;
};

export type TreeState = {
    root: number;
    size: number;
    keys: Int16Array;
    left: Int16Array;
    right: Int16Array;
    tag: Int16Array;
    tagKind: TagKind;
    focus: number;
    other: number;
    keyIndex: number;
    type: TreeStepType;
};

type StepOptions = { instructionId?: string[] };

export abstract class TreeAlgorithm
    extends Algorithm
    implements StepAlgorithm<TreeStep, TreeState>
{
    capacity: number;
    steps: TreeStep[] = [];
    protected key: number[];
    protected left: number[];
    protected right: number[];
    protected parent: number[];
    protected tag: number[];
    protected root = NIL;
    protected size = 0;
    protected keyIndex = -1;
    metrics: StepMetrics = {
        compares: { count: 0, name: "Compares" },
        moves: { count: 0, name: "Rotations" },
        height: { count: 0, name: "Height" },
    };

    constructor(input: TreeInput, options: Record<string, unknown> = {}) {
        super();
        this.options = options;
        const n = input.keys.length;
        this.capacity = n;
        this.key = new Array<number>(n).fill(0);
        this.left = new Array<number>(n).fill(NIL);
        this.right = new Array<number>(n).fill(NIL);
        this.parent = new Array<number>(n).fill(NIL);
        this.tag = new Array<number>(n).fill(0);
        this.metrics.moves.name = this.movesName;
        this.emit("initial", NIL, NIL, {});
        input.keys.forEach((key, index) => {
            this.keyIndex = index;
            this.insert(key);
        });
        this.keyIndex = n;
        this.emit("finish", NIL, NIL, {});
    }

    /* Prototype getters: valid while the base constructor runs. */
    get movesName(): string {
        return "Rotations";
    }

    get tagKind(): TagKind {
        return "none";
    }

    protected abstract insert(key: number): void;

    // ---------- Building blocks ----------

    protected newNode(key: number, tag = 0): number {
        const id = this.size;
        this.size += 1;
        this.key[id] = key;
        this.tag[id] = tag;
        return id;
    }

    /** Count and show one comparison of `key` against node `slot`. */
    protected compareAt(
        slot: number,
        key: number,
        options: StepOptions = {}
    ): boolean {
        this.metrics.compares.count += 1;
        this.emit("compare", slot, NIL, options);
        return key < this.key[slot];
    }

    /** Plain BST descent; the new node hangs as a leaf. It only gets
        a slot once attached, so snapshots never hold a loose node. */
    protected insertLeaf(
        key: number,
        tag = 0,
        options: StepOptions = {}
    ): number {
        if (this.root === NIL) {
            const id = this.newNode(key, tag);
            this.root = id;
            this.emit("insert", id, NIL, options);
            return id;
        }
        let x = this.root;
        for (;;) {
            const goLeft = this.compareAt(x, key, { instructionId: ["c"] });
            const next = goLeft ? this.left[x] : this.right[x];
            if (next === NIL) {
                const id = this.newNode(key, tag);
                if (goLeft) this.left[x] = id;
                else this.right[x] = id;
                this.parent[id] = x;
                this.emit("insert", id, x, options);
                return id;
            }
            x = next;
        }
    }

    private relink(x: number, y: number): void {
        const p = this.parent[x];
        this.parent[y] = p;
        if (p === NIL) this.root = y;
        else if (this.left[p] === x) this.left[p] = y;
        else this.right[p] = y;
        this.parent[x] = y;
    }

    /** Called after a rotation rewires x (now lower) and y (now on top). */
    protected afterRotate(x: number, y: number): void {
        void x;
        void y;
    }

    protected rotateLeft(x: number, options: StepOptions = {}): void {
        const y = this.right[x];
        this.right[x] = this.left[y];
        if (this.left[y] !== NIL) this.parent[this.left[y]] = x;
        this.relink(x, y);
        this.left[y] = x;
        this.metrics.moves.count += 1;
        this.afterRotate(x, y);
        this.emit("rotate", y, x, options);
    }

    protected rotateRight(x: number, options: StepOptions = {}): void {
        const y = this.left[x];
        this.left[x] = this.right[y];
        if (this.right[y] !== NIL) this.parent[this.right[y]] = x;
        this.relink(x, y);
        this.right[y] = x;
        this.metrics.moves.count += 1;
        this.afterRotate(x, y);
        this.emit("rotate", y, x, options);
    }

    /** Rotate x above its parent. */
    protected rotateUp(x: number, options: StepOptions = {}): void {
        const p = this.parent[x];
        if (this.left[p] === x) this.rotateRight(p, options);
        else this.rotateLeft(p, options);
    }

    protected heightOf(x: number): number {
        if (x === NIL) return 0;
        return (
            1 +
            Math.max(this.heightOf(this.left[x]), this.heightOf(this.right[x]))
        );
    }

    protected emit(
        type: TreeStepType,
        focus: number,
        other: number,
        { instructionId }: StepOptions
    ): void {
        this.metrics.height.count = this.heightOf(this.root);
        const metrics: StepMetrics = {};
        for (const k in this.metrics) metrics[k] = { ...this.metrics[k] };
        const n = this.capacity;
        const snapshot = new Int16Array(2 + n * 4);
        snapshot[0] = this.root;
        snapshot[1] = this.size;
        for (let i = 0; i < n; i += 1) {
            snapshot[2 + i] = this.key[i];
            snapshot[2 + n + i] = this.left[i];
            snapshot[2 + 2 * n + i] = this.right[i];
            snapshot[2 + 3 * n + i] = this.tag[i];
        }
        this.steps.push({
            type,
            focus,
            other,
            keyIndex: this.keyIndex,
            snapshot,
            instructionId,
            metrics,
        });
    }

    // ---------- Replay API ----------

    getStepsLength(): number {
        return this.steps.length;
    }

    getStepByIndex(index: number): TreeStep | undefined {
        return this.steps[index];
    }

    getMetrics(): StepMetrics {
        return this.steps[this.steps.length - 1]?.metrics ?? this.metrics;
    }

    getStateByStepsIndex(index: number): TreeState {
        const k = Math.max(0, Math.min(index, this.steps.length - 1));
        const step = this.steps[k];
        const s = step.snapshot;
        const n = this.capacity;
        return {
            root: s[0],
            size: s[1],
            keys: s.subarray(2, 2 + n),
            left: s.subarray(2 + n, 2 + 2 * n),
            right: s.subarray(2 + 2 * n, 2 + 3 * n),
            tag: s.subarray(2 + 3 * n, 2 + 4 * n),
            tagKind: this.tagKind,
            focus: step.focus,
            other: step.other,
            keyIndex: step.keyIndex,
            type: step.type,
        };
    }

    static getInstructions(): AlgorithmInstructions {
        return {};
    }
}
