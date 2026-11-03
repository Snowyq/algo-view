import type { AlgorithmInstructions } from "../types";
import { DIRS } from "../GridAlgorithm";
import { LifeAlgorithm } from "./LifeAlgorithm";

const MOVES_PER_STEP = 40;

/* One ant: on a dead cell turn right, on a live one turn left, flip the
   cell, step forward. Chaos for ~10 000 moves, then a straight highway. */
export class LangtonsAnt extends LifeAlgorithm {
    get settles(): boolean {
        return false;
    }

    protected setup(): void {
        this.marker = this.at(
            Math.floor(this.cols / 2),
            Math.floor(this.rows / 2)
        );
        this.heading = 0;
    }

    protected next(cells: Uint8Array): Uint8Array {
        const out = cells.slice();
        let at = this.marker;
        for (let k = 0; k < MOVES_PER_STEP; k += 1) {
            this.heading = (this.heading + (out[at] ? 3 : 1)) % 4;
            out[at] = out[at] ? 0 : 1;
            const [x, y] = this.xy(at);
            const [dx, dy] = DIRS[this.heading];
            at = this.at(
                (x + dx + this.cols) % this.cols,
                (y + dy + this.rows) % this.rows
            );
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
