import { describe, expect, it } from "vitest";
import { DP_PRESETS, generateDpInput, type DpInput } from "../../utils/dpInput";
import { CoinChange } from "./CoinChange";
import type { DpAlgorithm } from "./DpAlgorithm";
import { EditDistance } from "./EditDistance";
import { Knapsack } from "./Knapsack";
import { LongestCommonSubsequence } from "./LongestCommonSubsequence";
import { LongestIncreasingSubsequence } from "./LongestIncreasingSubsequence";

const blank: DpInput = {
    a: "",
    b: "",
    items: [],
    capacity: 0,
    coins: [1],
    amount: 0,
    sequence: [0],
};

type DpClass = new (input: DpInput) => DpAlgorithm;

const answer = (Class: DpClass, input: Partial<DpInput>): number =>
    new Class({ ...blank, ...input }).getMetrics().answer.count;

const finalState = (algo: DpAlgorithm) =>
    algo.getStateByStepsIndex(algo.getStepsLength() - 1);

// Plain references, written differently from the table-filling code.
function editDistance(a: string, b: string): number {
    const memo = new Map<string, number>();
    const go = (i: number, j: number): number => {
        if (i === a.length) return b.length - j;
        if (j === b.length) return a.length - i;
        const key = `${i},${j}`;
        if (!memo.has(key)) {
            memo.set(
                key,
                a[i] === b[j]
                    ? go(i + 1, j + 1)
                    : 1 + Math.min(go(i + 1, j), go(i, j + 1), go(i + 1, j + 1))
            );
        }
        return memo.get(key)!;
    };
    return go(0, 0);
}

function lcs(a: string, b: string): number {
    const memo = new Map<string, number>();
    const go = (i: number, j: number): number => {
        if (i === a.length || j === b.length) return 0;
        const key = `${i},${j}`;
        if (!memo.has(key)) {
            memo.set(
                key,
                a[i] === b[j]
                    ? 1 + go(i + 1, j + 1)
                    : Math.max(go(i + 1, j), go(i, j + 1))
            );
        }
        return memo.get(key)!;
    };
    return go(0, 0);
}

function knapsack({ items, capacity }: DpInput): number {
    let best = 0;
    for (let mask = 0; mask < 1 << items.length; mask += 1) {
        let weight = 0;
        let value = 0;
        items.forEach((item, k) => {
            if (mask & (1 << k)) {
                weight += item.weight;
                value += item.value;
            }
        });
        if (weight <= capacity) best = Math.max(best, value);
    }
    return best;
}

function coinChange({ coins, amount }: DpInput): number {
    const dist = new Map<number, number>([[0, 0]]);
    const queue = [0];
    for (let k = 0; k < queue.length; k += 1) {
        const at = queue[k];
        if (at === amount) return dist.get(at)!;
        for (const coin of coins) {
            const next = at + coin;
            if (next > amount || dist.has(next)) continue;
            dist.set(next, dist.get(at)! + 1);
            queue.push(next);
        }
    }
    return -1;
}

function lis(sequence: number[]): number {
    let best = 0;
    for (let mask = 1; mask < 1 << sequence.length; mask += 1) {
        const picked = sequence.filter((_, k) => mask & (1 << k));
        if (picked.every((v, k) => k === 0 || picked[k - 1] < v)) {
            best = Math.max(best, picked.length);
        }
    }
    return best;
}

describe("edit distance", () => {
    it.each([
        ["kitten", "sitting", 3],
        ["sunday", "saturday", 3],
        ["horse", "rose", 2],
        ["intention", "execution", 5],
        ["", "abc", 3],
        ["same", "same", 0],
    ])("%s → %s costs %i", (a, b, expected) => {
        expect(answer(EditDistance, { a, b })).toBe(expected);
    });

    it("traces a path from the answer back to the empty prefix", () => {
        const algo = new EditDistance({ ...blank, a: "kitten", b: "sitting" });
        const { traced, table } = finalState(algo);
        expect(traced[0]).toBe(1);
        expect(traced[table.rows * table.cols - 1]).toBe(1);
    });
});

describe("longest common subsequence", () => {
    it.each([
        ["ABCBDAB", "BDCABA", 4],
        ["AGGTAB", "GXTXAYB", 4],
        ["abc", "def", 0],
        ["pixel", "pixel", 5],
    ])("%s and %s share %i", (a, b, expected) => {
        expect(answer(LongestCommonSubsequence, { a, b })).toBe(expected);
    });
});

describe("longest increasing subsequence", () => {
    it.each([
        [[10, 9, 2, 5, 3, 7, 101, 18], 4],
        [[0, 1, 0, 3, 2, 3], 4],
        [[7, 7, 7, 7], 1],
        [[5, 4, 3, 2, 1], 1],
        [[1, 2, 3, 4, 5], 5],
    ])("%j has length %i", (sequence, expected) => {
        expect(answer(LongestIncreasingSubsequence, { sequence })).toBe(
            expected
        );
    });

    it("traces a strictly increasing subsequence of that length", () => {
        const sequence = [3, 10, 2, 1, 20, 4, 6, 7];
        const algo = new LongestIncreasingSubsequence({ ...blank, sequence });
        const picked = sequence.filter((_, i) => finalState(algo).traced[i]);
        expect(picked).toEqual([3, 4, 6, 7]);
    });
});

describe("0/1 knapsack", () => {
    it("picks the best combination, not the greedy one", () => {
        const items = [
            { weight: 1, value: 1 },
            { weight: 3, value: 4 },
            { weight: 4, value: 5 },
            { weight: 5, value: 7 },
        ];
        expect(answer(Knapsack, { items, capacity: 7 })).toBe(9);
    });

    it("returns 0 when nothing fits", () => {
        const items = [{ weight: 5, value: 10 }];
        expect(answer(Knapsack, { items, capacity: 4 })).toBe(0);
    });
});

describe("coin change", () => {
    it.each([
        [[1, 3, 4], 6, 2],
        [[1, 5, 6, 9], 11, 2],
        [[2, 3, 7], 12, 3],
        [[1], 0, 0],
    ])("coins %j make %i with %i coins", (coins, amount, expected) => {
        expect(answer(CoinChange, { coins, amount })).toBe(expected);
    });

    it("reports -1 when the amount cannot be made", () => {
        expect(answer(CoinChange, { coins: [2, 4], amount: 7 })).toBe(-1);
    });
});

describe("dp algorithms on generated inputs", () => {
    const inputs = DP_PRESETS.flatMap((preset) =>
        [1, 2, 3, 4].map((seed) => ({
            name: `${preset} seed ${seed}`,
            input: generateDpInput({ preset, size: 10, seed }),
        }))
    );

    it.each(inputs)("match brute-force answers ($name)", ({ input }) => {
        expect(answer(EditDistance, input)).toBe(
            editDistance(input.a, input.b)
        );
        expect(answer(LongestCommonSubsequence, input)).toBe(
            lcs(input.a, input.b)
        );
        expect(answer(Knapsack, input)).toBe(knapsack(input));
        expect(answer(CoinChange, input)).toBe(coinChange(input));
        expect(answer(LongestIncreasingSubsequence, input)).toBe(
            lis(input.sequence)
        );
    });

    it.each(
        [
            EditDistance,
            LongestCommonSubsequence,
            Knapsack,
            CoinChange,
            LongestIncreasingSubsequence,
        ].map((Class) => [Class.name, Class])
    )("%s fills every cell of its table", (_, Class) => {
        const algo = new (Class as DpClass)(inputs[0].input);
        const { values } = finalState(algo);
        expect(values.every((value) => !Number.isNaN(value))).toBe(true);
    });
});
