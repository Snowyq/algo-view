import type { DpInput } from "../../utils/dpInput";
import type { AlgorithmInstructions } from "../types";
import { DpAlgorithm, type DpTable } from "./DpAlgorithm";

/* 0/1 knapsack: best total value within a weight limit. Each cell
   decides one item: skip it, or take it and look up the rest. */
export class Knapsack extends DpAlgorithm {
    protected setup({ items, capacity }: DpInput): DpTable {
        return {
            rows: items.length + 1,
            cols: capacity + 1,
            rowLabels: ["–", ...items.map((it) => `${it.weight}/${it.value}`)],
            colLabels: Array.from({ length: capacity + 1 }, (_, w) =>
                String(w)
            ),
            corner: "w/v",
        };
    }

    protected solve({ items, capacity }: DpInput): void {
        for (let w = 0; w <= capacity; w += 1) {
            this.fill(0, w, 0, [], { instructionId: ["n0"] });
        }
        items.forEach(({ weight, value }, k) => {
            const i = k + 1;
            for (let w = 0; w <= capacity; w += 1) {
                const skip = this.get(i - 1, w);
                if (weight > w) {
                    this.fill(i, w, skip, [[i - 1, w]], {
                        instructionId: ["n2"],
                    });
                    continue;
                }
                const take = this.get(i - 1, w - weight) + value;
                this.fill(
                    i,
                    w,
                    Math.max(skip, take),
                    [
                        [i - 1, w],
                        [i - 1, w - weight],
                    ],
                    { instructionId: ["n3"] }
                );
            }
        });
        this.answer(this.get(items.length, capacity));
        // Items taken are the rows where the value changed.
        let w = capacity;
        for (let i = items.length; i > 0; i -= 1) {
            if (this.get(i, w) !== this.get(i - 1, w)) {
                this.trace(i, w, { instructionId: ["n4"] });
                w -= items[i - 1].weight;
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            n0: { line: "best[0][w] = 0;", indent: 0 },
            n1: { line: "for (item…) for (w = 0; w <= cap; w++) {", indent: 0 },
            n2: {
                line: "if (item.weight > w) best[i][w] = best[i-1][w];",
                indent: 1,
            },
            n3: {
                line: "else best[i][w] = max(skip, best[i-1][w-wt] + val);",
                indent: 1,
            },
            ne1: { line: "}", indent: 0 },
            n4: {
                line: "rows where the value changed hold the items taken;",
                indent: 0,
            },
        };
    }
}
