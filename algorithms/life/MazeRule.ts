import type { AlgorithmInstructions } from "../types";
import { LifeLikeRule } from "./LifeAlgorithm";

/* Cells almost never die, so growth leaves corridors that look like a maze. B3/S12345. */
export class MazeRule extends LifeLikeRule {
    get born(): number[] {
        return [3];
    }

    get survive(): number[] {
        return [1, 2, 3, 4, 5];
    }

    static getInstructions(): AlgorithmInstructions {
        return LifeLikeRule.ruleInstructions([3], [1, 2, 3, 4, 5]);
    }
}
