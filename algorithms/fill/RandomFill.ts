import { createRng } from "../../utils/randoms";
import type { AlgorithmInstructions } from "../types";
import { DIRS4, FillAlgorithm } from "./FillAlgorithm";

/* Paints a random cell from the frontier each time. Same region, but it
   grows like mould instead of a wave. */
export class RandomFill extends FillAlgorithm {
    protected run(): void {
        const rng = createRng(this.start + 1);
        const bag = [this.start];
        this.push(this.start);
        while (bag.length) {
            this.memory(bag.length);
            // Swap-remove a random cell.
            const pick = Math.floor(rng() * bag.length);
            const cell = bag[pick];
            bag[pick] = bag[bag.length - 1];
            bag.pop();
            this.paint(cell);
            bag.push(...this.pushNeighbours(cell, DIRS4));
            this.emit("fill", cell, { instructionId: ["r1"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            r0: { line: "bag = [start];", indent: 0 },
            r1: { line: "paint a random cell from the bag;", indent: 0 },
        };
    }
}
