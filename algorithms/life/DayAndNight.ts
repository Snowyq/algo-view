import type { AlgorithmInstructions } from "../types";
import { LifeLikeRule } from "./LifeAlgorithm";

/* Symmetric under inversion: live and dead patterns behave the same. B3678/S34678. */
export class DayAndNight extends LifeLikeRule {
    get born(): number[] {
        return [3, 6, 7, 8];
    }

    get survive(): number[] {
        return [3, 4, 6, 7, 8];
    }

    static getInstructions(): AlgorithmInstructions {
        return LifeLikeRule.ruleInstructions([3, 6, 7, 8], [3, 4, 6, 7, 8]);
    }
}
