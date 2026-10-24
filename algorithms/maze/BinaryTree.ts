import type { AlgorithmInstructions } from "../types";
import { MazeAlgorithm } from "./MazeAlgorithm";

/* Each room opens either north or east, coin flip. The simplest maze
   there is: two open edges and a visible diagonal bias. */
export class BinaryTree extends MazeAlgorithm {
    generate(): void {
        for (const room of this.rooms()) {
            this.visit(room, { instructionId: ["t1"] });
            const [x, y] = this.xy(room);
            const options: number[] = [];
            if (y > 1) options.push(room - this.cols);
            if (x < this.cols - 2) options.push(room + 1);
            const cells = [room];
            if (options.length) cells.push(this.pick(options));
            this.carve(cells, { instructionId: ["t2"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            t0: { line: "for (const room of rooms) {", indent: 0 },
            t1: {
                line: "const options = [north, east].filter(inside);",
                indent: 1,
            },
            t2: { line: "carve(room, random(options));", indent: 1 },
            te0: { line: "}", indent: 0 },
        };
    }
}
