import { MinHeap } from "../../utils/minHeap";
import type { AlgorithmInstructions } from "../types";
import { PathAlgorithm } from "./PathAlgorithm";

/* Always expands the cheapest known cell, so the route is the cheapest
   one, mud included. */
export class Dijkstra extends PathAlgorithm {
    search(): void {
        const { start, end } = this.grid;
        const cameFrom = this.emptyCameFrom();
        const dist = new Float64Array(this.size).fill(Infinity);
        const done = new Uint8Array(this.size);
        const heap = new MinHeap();
        let order = 0;
        dist[start] = 0;
        heap.push(0, start, order++);
        this.frontier([start], 1, { instructionId: ["j0"] });
        while (heap.size > 0) {
            const cell = heap.pop()!;
            if (done[cell]) continue;
            done[cell] = 1;
            this.visit(cell, { instructionId: ["j2"] });
            if (cell === end) {
                this.tracePath(cameFrom, cell, { instructionId: ["j3"] });
                return;
            }
            const added: number[] = [];
            for (const next of this.neighbors(cell)) {
                const cost = dist[cell] + this.costOf(next);
                if (cost >= dist[next]) continue;
                dist[next] = cost;
                cameFrom[next] = cell;
                heap.push(cost, next, order++);
                added.push(next);
            }
            this.frontier(added, heap.size, { instructionId: ["j6", "j7"] });
        }
        this.noPath();
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            j0: { line: "dist[start] = 0; heap.push(start, 0);", indent: 0 },
            j1: { line: "while (heap.size > 0) {", indent: 0 },
            j2: { line: "const cell = heap.popCheapest();", indent: 1 },
            j3: { line: "if (cell === end) return trace(cell);", indent: 1 },
            j4: { line: "for (const next of neighbors(cell)) {", indent: 1 },
            j5: { line: "const cost = dist[cell] + weight(next);", indent: 2 },
            j6: { line: "if (cost < dist[next]) {", indent: 2 },
            j7: {
                line: "dist[next] = cost; heap.push(next, cost);",
                indent: 3,
            },
            je6: { line: "}", indent: 2 },
            je4: { line: "}", indent: 1 },
            je1: { line: "}", indent: 0 },
        };
    }
}
