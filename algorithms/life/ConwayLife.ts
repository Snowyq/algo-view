import { LifeLikeRule } from "./LifeAlgorithm";

/* Conway's Game of Life: lonely or crowded cells die, three neighbours
   make a birth. B3/S23. */
export class ConwayLife extends LifeLikeRule {
    static born = [3];
    static survive = [2, 3];
}
