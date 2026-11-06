import type { AlgorithmInstructions } from "../types";
import { DIRS4, FillAlgorithm } from "./FillAlgorithm";

/* The same fill with a stack, like a recursive fill: paint snakes off in
   one direction and the stack gets deep in long corridors. */
export class StackFill extends FillAlgorithm {
    protected run(): void {
        const stack = [this.start];
        this.push(this.start);
        while (stack.length) {
            this.memory(stack.length);
            const cell = stack.pop()!;
            this.paint(cell);
            stack.push(...this.pushNeighbours(cell, DIRS4));
            this.emit("fill", cell, { instructionId: ["s1"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            s0: { line: "stack = [start];", indent: 0 },
            s1: {
                line: "paint(stack.pop()); push its open neighbours;",
                indent: 0,
            },
        };
    }
}
