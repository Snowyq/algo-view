import type { AlgorithmInstructions } from "../types";
import { PathAlgorithm } from "./PathAlgorithm";

/* Ring by ring from the start: the first time it reaches the end is the
   fewest-steps route (it ignores mud). */
export class BreadthFirstSearch extends PathAlgorithm {
    search(): void {
        const { start, end } = this.grid;
        const cameFrom = new Int32Array(this.size).fill(-1);
        const seen = new Uint8Array(this.size);
        const queue: number[] = [start];
        let head = 0;
        seen[start] = 1;
        this.frontier([start], 1, { instructionId: ["b0"] });
        while (head < queue.length) {
            const cell = queue[head++];
            this.visit(cell, { instructionId: ["b2"] });
            if (cell === end) {
                this.tracePath(cameFrom, cell, { instructionId: ["b3"] });
                return;
            }
            const added: number[] = [];
            for (const next of this.neighbors(cell)) {
                if (seen[next]) continue;
                seen[next] = 1;
                cameFrom[next] = cell;
                queue.push(next);
                added.push(next);
            }
            this.frontier(added, queue.length - head, { instructionId: ["b6", "b7"] });
        }
        this.noPath();
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            b0: { line: "const queue = [start];", indent: 0 },
            b1: { line: "while (queue.length > 0) {", indent: 0 },
            b2: { line: "const cell = queue.shift();", indent: 1 },
            b3: { line: "if (cell === end) return trace(cell);", indent: 1 },
            b4: { line: "for (const next of neighbors(cell)) {", indent: 1 },
            b5: { line: "if (seen.has(next)) continue;", indent: 2 },
            b6: { line: "seen.add(next); from[next] = cell;", indent: 2 },
            b7: { line: "queue.push(next);", indent: 2 },
            be4: { line: "}", indent: 1 },
            be1: { line: "}", indent: 0 },
        };
    }
}
