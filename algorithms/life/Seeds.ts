import { LifeLikeRule } from "./LifeAlgorithm";

/* Every live cell dies at once; two neighbours give birth. Almost every
   start explodes. B2/S. */
export class Seeds extends LifeLikeRule {
    static born = [2];
    static survive: number[] = [];
}
