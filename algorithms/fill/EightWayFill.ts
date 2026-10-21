import type { AlgorithmInstructions } from "../types";
import { FillAlgorithm } from "./FillAlgorithm";

const DIRS8: Array<[number, number]> = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
];

/* Queue fill that also steps diagonally. It spreads as a square instead
   of a diamond — and squeezes through diagonal gaps between walls, so it
   can leak into regions a 4-way fill never reaches. */
export class EightWayFill extends FillAlgorithm {
    protected run(): void {
        const queue = [this.start];
        this.push(this.start);
        for (let head = 0; head < queue.length; head += 1) {
            this.memory(queue.length - head);
            const cell = queue[head];
            this.paint(cell);
            const [x, y] = this.xy(cell);
            for (const [dx, dy] of DIRS8) {
                if (!this.open(x + dx, y + dy)) continue;
                const next = this.at(x + dx, y + dy);
                if (this.marks[next] !== 0) continue;
                this.push(next);
                queue.push(next);
            }
            this.emit("fill", cell, { instructionId: ["e1"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            e0: { line: "queue = [start];", indent: 0 },
            e1: {
                line: "paint; queue all 8 neighbours (diagonals too);",
                indent: 0,
            },
        };
    }
}
