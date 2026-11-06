import type { TreeInput } from "../../utils/treeInput";
import { RecordedAlgorithm, type StepOptions } from "../RecordedAlgorithm";
import type { StepMetrics } from "../types";

/*
 * Trees built by inserting keys one at a time. Nodes live in slot arrays
 * and rotations rewire them in place. Trees are tiny (31 nodes at most),
 * so every step keeps a full snapshot.
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
    /** [root, size, keys, left, right, tag] */
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

export abstract class TreeAlgorithm extends RecordedAlgorithm<
    TreeStep,
    TreeState
> {
    capacity: number;
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
        super(options);
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

    // Getters, not fields, so they already work inside the constructor.
    get movesName(): string {
        return "Rotations";
    }

    get tagKind(): TagKind {
        return "none";
    }

    protected abstract insert(key: number): void;

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

    /** Plain BST insert. The slot is taken only once attached, so no snapshot holds a loose node. */
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
        this.rotate(x, this.right, this.left, options);
    }

    protected rotateRight(x: number, options: StepOptions = {}): void {
        this.rotate(x, this.left, this.right, options);
    }

    /** Lifts x's child on the `up` side above x. */
    private rotate(
        x: number,
        up: number[],
        across: number[],
        options: StepOptions
    ): void {
        const y = up[x];
        up[x] = across[y];
        if (across[y] !== NIL) this.parent[across[y]] = x;
        this.relink(x, y);
        across[y] = x;
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
        const metrics = this.metricsSnapshot();
        this.steps.push({
            type,
            focus,
            other,
            keyIndex: this.keyIndex,
            snapshot: this.snapshot(),
            instructionId,
            metrics,
        });
    }

    private snapshot(): Int16Array {
        const n = this.capacity;
        const snapshot = new Int16Array(2 + n * 4);
        snapshot[0] = this.root;
        snapshot[1] = this.size;
        snapshot.set(this.key, 2);
        snapshot.set(this.left, 2 + n);
        snapshot.set(this.right, 2 + 2 * n);
        snapshot.set(this.tag, 2 + 3 * n);
        return snapshot;
    }

    getStateByStepsIndex(index: number): TreeState {
        const step = this.steps[this.clampStep(index)];
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
}
