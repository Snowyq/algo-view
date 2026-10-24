import type { AlgorithmInstructions } from "../types";
import { LifeAlgorithm } from "./LifeAlgorithm";

const MOVES_PER_STEP = 40;
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

/* Not a neighbourhood rule at all: one ant on the grid. On a dead cell
   turn right, on a live one turn left; flip the cell, step forward. Chaos
   for ~10 000 moves, then it suddenly builds a straight "highway". */
export class LangtonsAnt extends LifeAlgorithm {
    get settles(): boolean {
        return false;
    }

    protected setup(): void {
        this.marker =
            Math.floor(this.rows / 2) * this.cols + Math.floor(this.cols / 2);
        this.heading = 0;
    }

    protected next(cells: Uint8Array): Uint8Array {
        const out = cells.slice();
        let at = this.marker;
        for (let k = 0; k < MOVES_PER_STEP; k += 1) {
            this.heading = (this.heading + (out[at] ? 3 : 1)) % 4;
            out[at] = out[at] ? 0 : 1;
            const x = (at % this.cols) + DX[this.heading];
            const y = Math.floor(at / this.cols) + DY[this.heading];
            at =
                ((y + this.rows) % this.rows) * this.cols +
                ((x + this.cols) % this.cols);
        }
        this.marker = at;
        return out;
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            g: { line: "40 moves per generation:", indent: 0 },
            b: { line: "dead → turn right, live → turn left;", indent: 1 },
            s: { line: "flip the cell, step forward;", indent: 1 },
        };
    }
}
