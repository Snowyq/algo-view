import { createRng } from "../../utils/randoms";
import type { AlgorithmInstructions } from "../types";
import { PathAlgorithm } from "./PathAlgorithm";

/* Stumbles to a random neighbour, forever, until it trips over the end
   or runs out of patience. */
export class RandomWalk extends PathAlgorithm {
    search(): void {
        const { start, end } = this.grid;
        const rng = createRng(start * 7919 + end * 104729 + this.size);
        const cameFrom = new Int32Array(this.size).fill(-1);
        const seen = new Uint8Array(this.size);
        const patience = this.size * 2;
        let cell = start;
        seen[start] = 1;
        for (let step = 0; step < patience; step += 1) {
            this.visit(cell, { instructionId: ["r1"] });
            if (cell === end) {
                this.tracePath(cameFrom, cell, { instructionId: ["r2"] });
                return;
            }
            const options = this.neighbors(cell);
            if (options.length === 0) break;
            const next = options[Math.floor(rng() * options.length)];
            if (!seen[next]) {
                seen[next] = 1;
                cameFrom[next] = cell;
            }
            cell = next;
        }
        this.giveUp();
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            r0: {
                line: "for (let tries = 0; tries < patience; tries++) {",
                indent: 0,
            },
            r1: { line: "cell = randomNeighbor(cell);", indent: 1 },
            r2: { line: "if (cell === end) return trace(cell);", indent: 1 },
            re0: { line: "}", indent: 0 },
            r3: { line: "giveUp();", indent: 0 },
        };
    }
}
