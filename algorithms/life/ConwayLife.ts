import type { AlgorithmInstructions } from "../types";
import { LifeLikeRule } from "./LifeAlgorithm";

/* Conway's Game of Life: lonely or crowded cells die, three neighbours make a birth. B3/S23. */
export class ConwayLife extends LifeLikeRule {
    get born(): number[] {
        return [3];
    }

    get survive(): number[] {
        return [2, 3];
    }

    static getInstructions(): AlgorithmInstructions {
        return LifeLikeRule.ruleInstructions([3], [2, 3]);
    }
}
