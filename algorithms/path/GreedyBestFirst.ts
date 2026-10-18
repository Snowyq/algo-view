import { MinHeap } from "../../utils/minHeap";
import type { AlgorithmInstructions } from "../types";
import { PathAlgorithm } from "./PathAlgorithm";

/* Only looks at how close a cell is to the goal. Fast and confident,
   easily fooled by a wall in the way. */
export class GreedyBestFirst extends PathAlgorithm {
    search(): void {
        const { start, end } = this.grid;
        const cameFrom = new Int32Array(this.size).fill(-1);
        const seen = new Uint8Array(this.size);
        const heap = new MinHeap();
        let order = 0;
        seen[start] = 1;
        heap.push(this.heuristic(start), start, order++);
        this.frontier([start], 1, { instructionId: ["g0"] });
        while (heap.size > 0) {
            const cell = heap.pop()!;
            this.visit(cell, { instructionId: ["g2"] });
            if (cell === end) {
                this.tracePath(cameFrom, cell, { instructionId: ["g3"] });
                return;
            }
            const added: number[] = [];
            for (const next of this.neighbors(cell)) {
                if (seen[next]) continue;
                seen[next] = 1;
                cameFrom[next] = cell;
                heap.push(this.heuristic(next), next, order++);
                added.push(next);
            }
            this.frontier(added, heap.size, { instructionId: ["g5", "g6"] });
        }
        this.noPath();
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            g0: { line: "heap.push(start, h(start));", indent: 0 },
            g1: { line: "while (heap.size > 0) {", indent: 0 },
            g2: { line: "const cell = heap.popClosestToEnd();", indent: 1 },
            g3: { line: "if (cell === end) return trace(cell);", indent: 1 },
            g4: { line: "for (const next of neighbors(cell)) {", indent: 1 },
            g5: { line: "if (seen.has(next)) continue;", indent: 2 },
            g6: { line: "from[next] = cell; heap.push(next, h(next));", indent: 2 },
            ge4: { line: "}", indent: 1 },
            ge1: { line: "}", indent: 0 },
        };
    }
}
