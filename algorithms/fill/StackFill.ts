import type { AlgorithmInstructions } from "../types";
import { DIRS4, FillAlgorithm } from "./FillAlgorithm";

/* The same fill with a stack (what a recursive fill does): paint snakes
   off in one direction first. In long corridors the stack gets deep, the
   reason recursive fills overflow on big images. */
export class StackFill extends FillAlgorithm {
    protected run(): void {
        const stack = [this.start];
        this.push(this.start);
        while (stack.length) {
            this.memory(stack.length);
            const cell = stack.pop()!;
            this.paint(cell);
            const [x, y] = this.xy(cell);
            for (const [dx, dy] of DIRS4) {
                if (!this.open(x + dx, y + dy)) continue;
                const next = this.at(x + dx, y + dy);
                if (this.marks[next] !== 0) continue;
                this.push(next);
                stack.push(next);
            }
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
