import type { AlgorithmInstructions } from "../types";
import { HullAlgorithm, POINT_HULL } from "./HullAlgorithm";

// Sort by angle around the lowest point, then walk them with a stack,
// popping any point that makes a right turn. O(n log n).
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
            this.pushTurningLeft(stack, i, [], ["g2", "g3", "g1"]);
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
