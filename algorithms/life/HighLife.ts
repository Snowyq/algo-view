import { LifeLikeRule } from "./LifeAlgorithm";

/* Life plus births with six neighbours, which allows a replicator.
   B36/S23. */
export class HighLife extends LifeLikeRule {
    static born = [3, 6];
    static survive = [2, 3];
}
