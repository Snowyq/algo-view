import { describe, expect, it } from "vitest";
import registryApi from "../algorithmsRegistryApi";
import {
    generateTreeInput,
    TREE_PRESETS,
    type TreeInput,
} from "../../utils/treeInput";
import {
    BLACK,
    NIL,
    RED,
    type TreeAlgorithm,
    type TreeState,
} from "./TreeAlgorithm";

type TreeClass = new (input: TreeInput) => TreeAlgorithm;

const items = registryApi.getAlgorithmsInCategory("tree") ?? [];
const searchTrees = items.filter((item) => item.id !== "binaryHeap");

const build = (id: string, keys: number[]): TreeState => {
    const item = items.find((entry) => entry.id === id)!;
    const algo = new (item.algorithm.Class as unknown as TreeClass)({ keys });
    return algo.getStateByStepsIndex(algo.getStepsLength() - 1);
};

function inOrder(tree: TreeState): number[] {
    const out: number[] = [];
    const walk = (x: number): void => {
        if (x === NIL) return;
        walk(tree.left[x]);
        out.push(tree.keys[x]);
        walk(tree.right[x]);
    };
    walk(tree.root);
    return out;
}

function height(tree: TreeState, x = tree.root): number {
    if (x === NIL) return 0;
    return (
        1 + Math.max(height(tree, tree.left[x]), height(tree, tree.right[x]))
    );
}

function nodes(tree: TreeState): number[] {
    const out: number[] = [];
    const walk = (x: number): void => {
        if (x === NIL) return;
        out.push(x);
        walk(tree.left[x]);
        walk(tree.right[x]);
    };
    walk(tree.root);
    return out;
}

/** Black nodes on every root-to-leaf path, or -1 if they differ. */
function blackHeight(tree: TreeState, x: number): number {
    if (x === NIL) return 1;
    const l = blackHeight(tree, tree.left[x]);
    const r = blackHeight(tree, tree.right[x]);
    if (l === -1 || r === -1 || l !== r) return -1;
    return l + (tree.tag[x] === BLACK ? 1 : 0);
}

const inputs = TREE_PRESETS.flatMap((preset) =>
    [5, 15, 31].map((count) => ({
        name: `${preset}, ${count} keys`,
        keys: generateTreeInput({ preset, count, seed: 8 }).keys,
    }))
);

const ascending = (keys: number[]): number[] =>
    keys.slice().sort((a, b) => a - b);

describe("search trees", () => {
    describe.each(searchTrees.map((item) => [item.meta.name, item.id]))(
        "%s",
        (_, id) => {
            it.each(inputs)("keeps keys in order ($name)", ({ keys }) => {
                const tree = build(id, keys);
                expect(tree.size).toBe(keys.length);
                expect(inOrder(tree)).toEqual(ascending(keys));
            });
        }
    );

    it.each(inputs)(
        "AVL stays within 1.44·log2(n) height ($name)",
        ({ keys }) => {
            const tree = build("avl", keys);
            expect(height(tree)).toBeLessThanOrEqual(
                Math.floor(1.44 * Math.log2(keys.length + 2))
            );
            for (const x of nodes(tree)) {
                const balance =
                    height(tree, tree.left[x]) - height(tree, tree.right[x]);
                expect(Math.abs(balance)).toBeLessThanOrEqual(1);
                expect(tree.tag[x]).toBe(height(tree, x));
            }
        }
    );

    it.each(inputs)("red-black rules hold ($name)", ({ keys }) => {
        const tree = build("redBlack", keys);
        expect(tree.tag[tree.root]).toBe(BLACK);
        for (const x of nodes(tree)) {
            if (tree.tag[x] !== RED) continue;
            for (const child of [tree.left[x], tree.right[x]]) {
                if (child !== NIL) expect(tree.tag[child]).toBe(BLACK);
            }
        }
        expect(blackHeight(tree, tree.root)).toBeGreaterThan(0);
    });

    it.each(inputs)("treap priorities form a heap ($name)", ({ keys }) => {
        const tree = build("treap", keys);
        for (const x of nodes(tree)) {
            for (const child of [tree.left[x], tree.right[x]]) {
                if (child !== NIL) {
                    expect(tree.tag[x]).toBeLessThanOrEqual(tree.tag[child]);
                }
            }
        }
    });

    it.each(inputs)(
        "splay tree ends with the last key at the root ($name)",
        ({ keys }) => {
            const tree = build("splay", keys);
            expect(tree.keys[tree.root]).toBe(keys[keys.length - 1]);
        }
    );

    it("plain BST degrades to a list on ascending keys", () => {
        const keys = Array.from({ length: 15 }, (_, i) => i + 1);
        expect(height(build("bst", keys))).toBe(15);
        expect(height(build("avl", keys))).toBe(4);
        expect(height(build("redBlack", keys))).toBeLessThanOrEqual(8);
    });
});

describe("binary heap", () => {
    it.each(inputs)("keeps the min-heap property ($name)", ({ keys }) => {
        const tree = build("binaryHeap", keys);
        expect(tree.keys[tree.root]).toBe(Math.min(...keys));
        expect(ascending(Array.from(tree.keys))).toEqual(ascending(keys));
        for (const x of nodes(tree)) {
            for (const child of [tree.left[x], tree.right[x]]) {
                if (child !== NIL) {
                    expect(tree.keys[x]).toBeLessThanOrEqual(tree.keys[child]);
                }
            }
        }
    });
});
