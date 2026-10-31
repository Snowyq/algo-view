import type { AlgorithmInstructions } from "../types";
import { HullAlgorithm, POINT_HULL } from "./HullAlgorithm";

// Gift wrapping: from the leftmost point, step to the point all others lie
// left of. O(n*h), so slow when most points are on the hull.
export class JarvisMarch extends HullAlgorithm {
    protected run(): number[] {
        const p = this.points;
        const n = p.length;
        let start = 0;
        for (let i = 1; i < n; i += 1) if (p[i].x < p[start].x) start = i;
        const hull: number[] = [];
        let current = start;
        do {
            hull.push(current);
            this.mark(current, POINT_HULL);
            this.setChain(hull);
            this.emit("push", current, -1, -1, true, { instructionId: ["j0"] });
            let candidate = (current + 1) % n;
            for (let j = 0; j < n; j += 1) {
                if (j === current || j === candidate) continue;
                const turn = this.test(current, candidate, j, {
                    instructionId: ["j1"],
                });
                if (
                    turn < 0 ||
                    (turn === 0 &&
                        this.dist2(current, j) > this.dist2(current, candidate))
                ) {
                    candidate = j;
                    this.emit("edge", current, candidate, -1, true, {
                        instructionId: ["j2"],
                    });
                }
            }
            current = candidate;
        } while (current !== start && hull.length <= n);
        return hull;
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            j0: { line: "add p; candidate = any other point;", indent: 0 },
            j1: { line: "for (q of points)", indent: 1 },
            j2: {
                line: "if (q is right of p → candidate) candidate = q;",
                indent: 2,
            },
        };
    }
}
