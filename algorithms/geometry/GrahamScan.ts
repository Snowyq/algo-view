import type { AlgorithmInstructions } from "../types";
import { HullAlgorithm, POINT_HULL, POINT_INSIDE } from "./HullAlgorithm";

/* Sort points by angle around the lowest one, then walk them keeping a
   stack; any point that makes a right turn is popped. O(n log n). */
export class GrahamScan extends HullAlgorithm {
    protected run(): number[] {
        const p = this.points;
        const n = p.length;
        let pivot = 0;
        for (let i = 1; i < n; i += 1) {
            if (
                p[i].y > p[pivot].y ||
                (p[i].y === p[pivot].y && p[i].x < p[pivot].x)
            )
                pivot = i;
        }
        const angle = (i: number): number =>
            Math.atan2(-(p[i].y - p[pivot].y), p[i].x - p[pivot].x);
        const order = [...Array(n).keys()]
            .filter((i) => i !== pivot)
            .sort(
                (i, j) =>
                    angle(i) - angle(j) ||
                    this.dist2(pivot, i) - this.dist2(pivot, j)
            );
        this.mark(pivot, POINT_HULL);
        this.setChain([pivot, ...order]);
        this.emit("sort", pivot, -1, -1, false, { instructionId: ["g0"] });

        const stack = [pivot];
        for (const i of order) {
            while (stack.length >= 2) {
                const turn = this.test(
                    stack[stack.length - 2],
                    stack[stack.length - 1],
                    i,
                    {
                        instructionId: ["g2"],
                    }
                );
                if (turn > 0) break;
                const dropped = stack.pop()!;
                this.mark(dropped, POINT_INSIDE);
                this.setChain(stack);
                this.emit("pop", dropped, -1, i, false, {
                    instructionId: ["g3"],
                });
            }
            stack.push(i);
            this.mark(i, POINT_HULL);
            this.setChain(stack);
            this.emit("push", i, -1, -1, true, { instructionId: ["g1"] });
        }
        return stack;
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            g0: { line: "sort by angle around the lowest point;", indent: 0 },
            g1: { line: "for (p of sorted) { stack.push(p);", indent: 0 },
            g2: { line: "while (turn(top2, top, p) is not left)", indent: 1 },
            g3: { line: "stack.pop();", indent: 2 },
        };
    }
}
