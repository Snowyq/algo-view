import type { AlgorithmInstructions } from "../types";
import { MazeAlgorithm } from "./MazeAlgorithm";

/* Row by row: runs going east, each closed by one opening north. The top
   row is always one long corridor. */
export class Sidewinder extends MazeAlgorithm {
    generate(): void {
        for (let y = 1; y < this.rows - 1; y += 2) {
            let run: number[] = [];
            for (let x = 1; x < this.cols - 1; x += 2) {
                const room = this.at(x, y);
                this.visit(room, { instructionId: ["s1"] });
                this.carve([room]);
                run.push(room);
                const atEast = x + 2 > this.cols - 2;
                const atTop = y === 1;
                const close = atEast || (!atTop && this.rng() < 0.5);
                if (!close) {
                    this.carve([this.at(x + 1, y)], { instructionId: ["s2"] });
                    continue;
                }
                if (!atTop) {
                    const member = this.pick(run);
                    this.carve([member - this.cols], { instructionId: ["s3"] });
                }
                run = [];
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            s0: { line: "for (const row of rows) {", indent: 0 },
            s1: { line: "run.push(room);", indent: 1 },
            s2: { line: "if (keepGoing()) carveEast(room);", indent: 1 },
            s3: {
                line: "else { carveNorth(random(run)); run = []; }",
                indent: 1,
            },
            se0: { line: "}", indent: 0 },
        };
    }
}
