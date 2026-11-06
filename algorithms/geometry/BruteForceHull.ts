import type { AlgorithmInstructions } from "../types";
import { HullAlgorithm, POINT_HULL, POINT_INSIDE } from "./HullAlgorithm";

// A pair a -> b is a hull edge when every other point lies on its left. O(n^3).
export class BruteForceHull extends HullAlgorithm {
    protected run(): number[] {
        const n = this.points.length;
        const next = new Array<number>(n).fill(-1);
        const pairs: number[] = [];
        for (let a = 0; a < n; a += 1) {
            for (let b = 0; b < n; b += 1) {
                if (a === b) continue;
                let edge = true;
                for (let c = 0; c < n && edge; c += 1) {
                    if (c === a || c === b) continue;
                    if (this.test(a, b, c, { instructionId: ["b1"] }) <= 0)
                        edge = false;
                }
                if (edge) {
                    next[a] = b;
                    pairs.push(a, b);
                    this.mark(a, POINT_HULL);
                    this.mark(b, POINT_HULL);
                    this.setSegments(pairs);
                    this.emit("edge", a, b, -1, true, {
                        instructionId: ["b2"],
                    });
                }
            }
        }
        const start = next.findIndex((v) => v >= 0);
        const hull: number[] = [];
        for (let i = start; i >= 0 && hull.length < n; i = next[i]) {
            if (hull.includes(i)) break;
            hull.push(i);
        }
        for (let i = 0; i < n; i += 1)
            if (next[i] < 0 && !hull.includes(i)) this.mark(i, POINT_INSIDE);
        return hull;
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            b0: { line: "for (a of points) for (b of points)", indent: 0 },
            b1: { line: "all others left of a → b?", indent: 1 },
            b2: { line: "yes → a → b is a hull edge;", indent: 1 },
        };
    }
}
