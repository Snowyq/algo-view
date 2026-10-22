import { createRng } from "../../utils/randoms";
import type { AlgorithmInstructions } from "../types";
import { FindAlgorithm } from "./FindAlgorithm";

/* Points at random indices until one is right. Has no idea when to stop
   if the value is not there, so it eventually gives up. */
export class RandomGuess extends FindAlgorithm {
    search(): void {
        const n = this.values.length;
        const rng = createRng(n * 2654435761 + this.target);
        const patience = n * 3;
        for (let tries = 0; tries < patience; tries += 1) {
            const i = Math.floor(rng() * n);
            if (this.probe(i, { instructionId: ["g1"] }) === 0) {
                return this.found(i, { instructionId: ["g2"] });
            }
        }
        this.giveUp();
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            g0: { line: "while (patience--) {", indent: 0 },
            g1: { line: "const i = randomIndex();", indent: 1 },
            g2: { line: "if (arr[i] === target) return i;", indent: 1 },
            ge0: { line: "}", indent: 0 },
        };
    }
}
