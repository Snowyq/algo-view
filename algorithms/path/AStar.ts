import { MinHeap } from "../../utils/minHeap";
import type { AlgorithmInstructions } from "../types";
import { PathAlgorithm } from "./PathAlgorithm";

/* Dijkstra plus a Manhattan estimate of the distance still to go. */
export class AStar extends PathAlgorithm {
    search(): void {
        const { start, end } = this.grid;
        const cameFrom = this.emptyCameFrom();
        const g = new Float64Array(this.size).fill(Infinity);
        const done = new Uint8Array(this.size);
        const heap = new MinHeap();
        g[start] = 0;
        heap.push(this.heuristic(start), start, this.heuristic(start));
        this.frontier([start], 1, { instructionId: ["a0"] });
        while (heap.size > 0) {
            const cell = heap.pop()!;
            if (done[cell]) continue;
            done[cell] = 1;
            this.visit(cell, { instructionId: ["a2"] });
            if (cell === end) {
                this.tracePath(cameFrom, cell, { instructionId: ["a3"] });
                return;
            }
            const added: number[] = [];
            for (const next of this.neighbors(cell)) {
                const cost = g[cell] + this.costOf(next);
                if (cost >= g[next]) continue;
                g[next] = cost;
                cameFrom[next] = cell;
                const h = this.heuristic(next);
                // Ties go to whoever is closer to the goal.
                heap.push(cost + h, next, h);
                added.push(next);
            }
            this.frontier(added, heap.size, { instructionId: ["a6", "a7"] });
        }
        this.noPath();
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            a0: {
                line: "g[start] = 0; heap.push(start, h(start));",
                indent: 0,
            },
            a1: { line: "while (heap.size > 0) {", indent: 0 },
            a2: { line: "const cell = heap.popLowestF();", indent: 1 },
            a3: { line: "if (cell === end) return trace(cell);", indent: 1 },
            a4: { line: "for (const next of neighbors(cell)) {", indent: 1 },
            a5: { line: "const cost = g[cell] + weight(next);", indent: 2 },
            a6: { line: "if (cost < g[next]) {", indent: 2 },
            a7: {
                line: "g[next] = cost; heap.push(next, cost + h(next));",
                indent: 3,
            },
            ae6: { line: "}", indent: 2 },
            ae4: { line: "}", indent: 1 },
            ae1: { line: "}", indent: 0 },
        };
    }
}
