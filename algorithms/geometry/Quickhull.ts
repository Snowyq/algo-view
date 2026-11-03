import type { AlgorithmInstructions } from "../types";
import { HullAlgorithm, POINT_HULL, POINT_INSIDE } from "./HullAlgorithm";

// Split by leftmost -> rightmost, take the farthest point on each side,
// drop the triangle and recurse on the two new edges.
export class Quickhull extends HullAlgorithm {
    protected run(): number[] {
        const p = this.points;
        const all = [...p.keys()];
        const left = all.reduce((a, i) => (p[i].x < p[a].x ? i : a), 0);
        const right = all.reduce((a, i) => (p[i].x > p[a].x ? i : a), 0);
        this.mark(left, POINT_HULL);
        this.mark(right, POINT_HULL);
        // Hull kept as an ordered ring, counter-clockwise.
        const ring = [left, right];
        this.setChain(ring, true);
        this.emit("edge", left, right, -1, true, { instructionId: ["q0"] });

        const side = (a: number, b: number, set: number[]): number[] =>
            set.filter((i) => i !== a && i !== b && this.cross(a, b, i) < 0);
        const expand = (a: number, b: number, set: number[]): void => {
            if (!set.length) return;
            let far = -1;
            let best = 0;
            for (const i of set) {
                const d = -this.test(a, b, i, { instructionId: ["q1"] });
                if (d > best) {
                    best = d;
                    far = i;
                }
            }
            if (far < 0) return;
            ring.splice(ring.indexOf(b), 0, far);
            this.mark(far, POINT_HULL);
            const outerA = side(a, far, set);
            const outerB = side(far, b, set);
            set.forEach((i) => {
                if (i !== far && !outerA.includes(i) && !outerB.includes(i))
                    this.mark(i, POINT_INSIDE);
            });
            this.setChain(ring, true);
            this.emit("push", far, a, b, true, { instructionId: ["q2"] });
            expand(a, far, outerA);
            expand(far, b, outerB);
        };
        // Points below left -> right on screen are on its right in math terms.
        expand(left, right, side(left, right, all));
        expand(right, left, side(right, left, all));
        return ring;
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            q0: { line: "split by leftmost → rightmost;", indent: 0 },
            q1: { line: "find the farthest point from the edge;", indent: 1 },
            q2: {
                line: "drop the triangle, recurse on both edges;",
                indent: 1,
            },
        };
    }
}
