import type { AlgorithmInstructions } from "../types";
import { LifeLikeRule } from "./LifeAlgorithm";

/* Like Life, plus births with six neighbours: that one extra rule creates a replicator. B36/S23. */
export class HighLife extends LifeLikeRule {
    get born(): number[] {
        return [3, 6];
    }

    get survive(): number[] {
        return [2, 3];
    }

    static getInstructions(): AlgorithmInstructions {
        return LifeLikeRule.ruleInstructions([3, 6], [2, 3]);
    }
}
