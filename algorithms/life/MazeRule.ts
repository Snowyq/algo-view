import { LifeLikeRule } from "./LifeAlgorithm";

/* Cells almost never die, so growth leaves maze-like corridors.
   B3/S12345. */
export class MazeRule extends LifeLikeRule {
    static born = [3];
    static survive = [1, 2, 3, 4, 5];
}
