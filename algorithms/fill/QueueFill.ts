import type { AlgorithmInstructions } from "../types";
import { DIRS4, FillAlgorithm } from "./FillAlgorithm";

/* Flood fill with a queue: paint spreads in rings (a diamond with 4-way
   moves) and the queue holds the whole wavefront. */
export class QueueFill extends FillAlgorithm {
    protected run(): void {
        const queue = [this.start];
        this.push(this.start);
        for (let head = 0; head < queue.length; head += 1) {
            this.memory(queue.length - head);
            const cell = queue[head];
            this.paint(cell);
            queue.push(...this.pushNeighbours(cell, DIRS4));
            this.emit("fill", cell, { instructionId: ["q1"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            q0: { line: "queue = [start];", indent: 0 },
            q1: {
                line: "paint(queue.shift()); queue its open neighbours;",
                indent: 0,
            },
        };
    }
}
