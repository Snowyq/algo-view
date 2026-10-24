import type { AlgorithmInstructions } from "../types";
import { LifeAlgorithm } from "./LifeAlgorithm";

const DYING = 2;

/* Three states: on → dying → off. An off cell turns on with exactly two
   on neighbours. Dying cells block rebirth, so everything travels:
   the grid fills with gliding "spaceships". */
export class BriansBrain extends LifeAlgorithm {
    protected next(cells: Uint8Array): Uint8Array {
        const out = new Uint8Array(cells.length);
        for (let y = 0; y < this.rows; y += 1) {
            for (let x = 0; x < this.cols; x += 1) {
                const i = y * this.cols + x;
                if (cells[i] === 1) out[i] = DYING;
                else if (cells[i] === DYING) out[i] = 0;
                else out[i] = this.neighbours(cells, x, y) === 2 ? 1 : 0;
            }
        }
        return out;
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            g: { line: "on → dying → off;", indent: 0 },
            b: { line: "off with exactly 2 on neighbours → on;", indent: 1 },
        };
    }
}
