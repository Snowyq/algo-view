import type { AlgorithmInstructions } from "../types";
import { HullAlgorithm, POINT_HULL, POINT_INSIDE } from "./HullAlgorithm";

/* Andrew's algorithm: sort by x, build the lower hull left to right and
   the upper hull right to left with the same right-turn rule. */
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
                while (chain.length >= 2) {
                    const turn = this.test(
                        chain[chain.length - 2],
                        chain[chain.length - 1],
                        i,
                        {
                            instructionId: ["m2"],
                        }
                    );
                    if (turn > 0) break;
                    const dropped = chain.pop()!;
                    if (!done.includes(dropped))
                        this.mark(dropped, POINT_INSIDE);
                    this.setChain([...done, ...chain]);
                    this.emit("pop", dropped, -1, i, false, {
                        instructionId: ["m3"],
                    });
                }
                chain.push(i);
                this.mark(i, POINT_HULL);
                this.setChain([...done, ...chain]);
                this.emit("push", i, -1, -1, true, { instructionId: ["m1"] });
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
