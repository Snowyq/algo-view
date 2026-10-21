import type { AlgorithmInstructions } from "../types";
import { LifeLikeRule } from "./LifeAlgorithm";

/* Every live cell dies at once; two neighbours give birth. Almost every start explodes. B2/S. */
export class Seeds extends LifeLikeRule {
    get born(): number[] {
        return [2];
    }

    get survive(): number[] {
        return [];
    }

    static getInstructions(): AlgorithmInstructions {
        return LifeLikeRule.ruleInstructions([2], []);
    }
}
