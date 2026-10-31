import type { AlgorithmInstructions } from "../types";
import { HullAlgorithm } from "./HullAlgorithm";

// Andrew's algorithm: sort by x, build the lower hull left to right and
// the upper hull right to left with the same right-turn rule.
export class MonotoneChain extends HullAlgorithm {
    protected run(): number[] {
        const p = this.points;
        const order = [...p.keys()].sort(
            (i, j) => p[i].x - p[j].x || p[j].y - p[i].y
        );
        this.emit("sort", -1, -1, -1, false, { instructionId: ["m0"] });
        const build = (sequence: number[], done: number[]): number[] => {
            const chain: number[] = [];
            for (const i of sequence) {
                this.pushTurningLeft(chain, i, done, ["m2", "m3", "m1"]);
            }
            return chain;
        };
        const lower = build(order, []);
        const upper = build([...order].reverse(), lower.slice(0, -1));
        return [...lower.slice(0, -1), ...upper.slice(0, -1)];
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            m0: { line: "sort points by x;", indent: 0 },
            m1: {
                line: "lower: left → right, upper: right → left;",
                indent: 0,
            },
            m2: { line: "while (turn(a, b, p) is not left)", indent: 1 },
            m3: { line: "chain.pop();", indent: 2 },
        };
    }
}
