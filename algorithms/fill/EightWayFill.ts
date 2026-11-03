import type { AlgorithmInstructions } from "../types";
import { DIRS8, FillAlgorithm } from "./FillAlgorithm";

/* Queue fill that also steps diagonally. Spreads as a square and slips
   through diagonal gaps, so it can leak where a 4-way fill can't. */
export class EightWayFill extends FillAlgorithm {
    protected run(): void {
        const queue = [this.start];
        this.push(this.start);
        for (let head = 0; head < queue.length; head += 1) {
            this.memory(queue.length - head);
            const cell = queue[head];
            this.paint(cell);
            queue.push(...this.pushNeighbours(cell, DIRS8));
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
