import { createRng } from "../../utils/randoms";
import type { AlgorithmInstructions } from "../types";
import { DIRS4, FillAlgorithm } from "./FillAlgorithm";

/* Picks a random cell from the frontier each time. Still fills exactly
   the same region — order does not matter for correctness — but grows
   like mould instead of a wave. */
export class RandomFill extends FillAlgorithm {
    protected run(): void {
        const rng = createRng(this.start + 1);
        const bag = [this.start];
        this.push(this.start);
        while (bag.length) {
            this.memory(bag.length);
            const pick = Math.floor(rng() * bag.length);
            const cell = bag[pick];
            bag[pick] = bag[bag.length - 1];
            bag.pop();
            this.paint(cell);
            const [x, y] = this.xy(cell);
            for (const [dx, dy] of DIRS4) {
                if (!this.open(x + dx, y + dy)) continue;
                const next = this.at(x + dx, y + dy);
                if (this.marks[next] !== 0) continue;
                this.push(next);
                bag.push(next);
            }
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
