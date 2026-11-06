import { LifeLikeRule } from "./LifeAlgorithm";

/* Symmetric under inversion: live and dead patterns behave the same.
   B3678/S34678. */
export class DayAndNight extends LifeLikeRule {
    static born = [3, 6, 7, 8];
    static survive = [3, 4, 6, 7, 8];
}
