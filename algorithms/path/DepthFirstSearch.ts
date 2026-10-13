import type { AlgorithmInstructions } from "../types";
import { PathAlgorithm } from "./PathAlgorithm";

/* Dives down one corridor until it dead-ends, then backtracks. Finds a
   route, rarely the short one. */
export class DepthFirstSearch extends PathAlgorithm {
    search(): void {
        const { start, end } = this.grid;
        const cameFrom = new Int32Array(this.size).fill(-1);
        const done = new Uint8Array(this.size);
        const stack: number[] = [start];
        this.frontier([start], 1, { instructionId: ["d0"] });
        while (stack.length > 0) {
            const cell = stack.pop()!;
            if (done[cell]) continue;
            done[cell] = 1;
            this.visit(cell, { instructionId: ["d2"] });
            if (cell === end) {
                this.tracePath(cameFrom, cell, { instructionId: ["d4"] });
                return;
            }
            const added: number[] = [];
            // Reversed so "up" is explored first, matching the code order.
            for (const next of this.neighbors(cell).reverse()) {
                if (done[next]) continue;
                cameFrom[next] = cell;
                stack.push(next);
                added.push(next);
            }
            this.frontier(added, stack.length, { instructionId: ["d6", "d7"] });
        }
        this.noPath();
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            d0: { line: "const stack = [start];", indent: 0 },
            d1: { line: "while (stack.length > 0) {", indent: 0 },
            d2: { line: "const cell = stack.pop();", indent: 1 },
            d3: { line: "if (done.has(cell)) continue;", indent: 1 },
            d4: { line: "if (cell === end) return trace(cell);", indent: 1 },
            d5: { line: "for (const next of neighbors(cell)) {", indent: 1 },
            d6: { line: "from[next] = cell;", indent: 2 },
            d7: { line: "stack.push(next);", indent: 2 },
            de5: { line: "}", indent: 1 },
            de1: { line: "}", indent: 0 },
        };
    }
}
