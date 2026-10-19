import type { AlgorithmInstructions } from "../types";
import { PathAlgorithm } from "./PathAlgorithm";

/* Two breadth-first searches, one from each end, taking turns. They meet
   in the middle having explored about half as much. */
export class BidirectionalBFS extends PathAlgorithm {
    search(): void {
        const { start, end } = this.grid;
        const from = [
            new Int32Array(this.size).fill(-1),
            new Int32Array(this.size).fill(-1),
        ];
        const side = new Int8Array(this.size).fill(-1);
        const queues: number[][] = [[start], [end]];
        const heads = [0, 0];
        side[start] = 0;
        side[end] = 1;
        this.frontier([start, end], 2, { instructionId: ["x0"] });
        let turn = 0;
        while (heads[0] < queues[0].length && heads[1] < queues[1].length) {
            const q = queues[turn];
            const cell = q[heads[turn]++];
            this.visit(cell, { instructionId: ["x2"] });
            const added: number[] = [];
            for (const next of this.neighbors(cell)) {
                if (side[next] === 1 - turn) {
                    // The two searches touched: stitch both halves together.
                    const a = turn === 0 ? cell : next;
                    const b = turn === 0 ? next : cell;
                    const left: number[] = [];
                    for (let c = a; c !== -1; c = from[0][c]) left.push(c);
                    const right: number[] = [];
                    for (let c = b; c !== -1; c = from[1][c]) right.push(c);
                    this.markPath([...left.reverse(), ...right], {
                        instructionId: ["x4"],
                    });
                    return;
                }
                if (side[next] !== -1) continue;
                side[next] = turn;
                from[turn][next] = cell;
                q.push(next);
                added.push(next);
            }
            const open =
                queues[0].length - heads[0] + queues[1].length - heads[1];
            this.frontier(added, open, { instructionId: ["x6"] });
            turn = 1 - turn;
        }
        this.noPath();
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            x0: {
                line: "const fromStart = [start], fromEnd = [end];",
                indent: 0,
            },
            x1: {
                line: "while (fromStart.length && fromEnd.length) {",
                indent: 0,
            },
            x2: { line: "const cell = next(turn).shift();", indent: 1 },
            x3: { line: "for (const n of neighbors(cell)) {", indent: 1 },
            x4: {
                line: "if (otherSide.has(n)) return stitch(cell, n);",
                indent: 2,
            },
            x5: { line: "if (seen.has(n)) continue;", indent: 2 },
            x6: { line: "seen.add(n); next(turn).push(n);", indent: 2 },
            xe3: { line: "}", indent: 1 },
            x7: { line: "turn = other(turn);", indent: 1 },
            xe1: { line: "}", indent: 0 },
        };
    }
}
