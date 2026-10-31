import type { DpInput } from "../../utils/dpInput";
import type { AlgorithmInstructions } from "../types";
import { DpAlgorithm, type DpTable } from "./DpAlgorithm";

// Fewest coins for an amount, coins reusable. Greedy fails on {1, 3, 4}
// for 6; the table does not.
export class CoinChange extends DpAlgorithm {
    protected setup({ coins, amount }: DpInput): DpTable {
        return {
            rows: coins.length + 1,
            cols: amount + 1,
            rowLabels: ["–", ...coins.map(String)],
            colLabels: Array.from({ length: amount + 1 }, (_, a) => String(a)),
            corner: "coin",
        };
    }

    protected solve({ coins, amount }: DpInput): void {
        for (let a = 0; a <= amount; a += 1) {
            this.fill(0, a, a === 0 ? 0 : Infinity, [], {
                instructionId: ["m0"],
            });
        }
        coins.forEach((coin, k) => {
            const i = k + 1;
            for (let a = 0; a <= amount; a += 1) {
                const without = this.get(i - 1, a);
                if (coin > a) {
                    this.fill(i, a, without, [[i - 1, a]], {
                        instructionId: ["m2"],
                    });
                    continue;
                }
                const withCoin = this.get(i, a - coin) + 1;
                this.fill(
                    i,
                    a,
                    Math.min(without, withCoin),
                    [
                        [i - 1, a],
                        [i, a - coin],
                    ],
                    { instructionId: ["m3"] }
                );
            }
        });
        const best = this.get(coins.length, amount);
        this.answer(best);
        if (!Number.isFinite(best)) return;
        let i = coins.length;
        let a = amount;
        while (a > 0 && i > 0) {
            if (this.get(i, a) === this.get(i - 1, a)) {
                i -= 1;
                continue;
            }
            this.trace(i, a, { instructionId: ["m4"] });
            a -= coins[i - 1];
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            m0: {
                line: "fewest[0][0] = 0; fewest[0][a] = Infinity;",
                indent: 0,
            },
            m1: {
                line: "for (coin…) for (a = 0; a <= amount; a++) {",
                indent: 0,
            },
            m2: {
                line: "if (coin > a) fewest[i][a] = fewest[i-1][a];",
                indent: 1,
            },
            m3: {
                line: "else fewest[i][a] = min(without, fewest[i][a-coin] + 1);",
                indent: 1,
            },
            me1: { line: "}", indent: 0 },
            m4: {
                line: "trace the coins used back from the corner;",
                indent: 0,
            },
        };
    }
}
