import type { AlgorithmInstructions } from "../types";
import { PathAlgorithm } from "./PathAlgorithm";

/* Keeps one hand on the left wall. Solves any maze whose walls all
   connect; circles forever around a free-standing one. */
export class WallFollower extends PathAlgorithm {
    search(): void {
        const { start, end, cols, rows } = this.grid;
        const cameFrom = new Int32Array(this.size).fill(-1);
        const seen = new Uint8Array(this.size);
        // 0 up, 1 right, 2 down, 3 left
        const dx = [0, 1, 0, -1];
        const dy = [-1, 0, 1, 0];
        const open = (cell: number, dir: number): number => {
            const x = (cell % cols) + dx[dir];
            const y = Math.floor(cell / cols) + dy[dir];
            if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
            const next = y * cols + x;
            return this.isWall(next) ? -1 : next;
        };
        let cell = start;
        let dir = 1;
        seen[start] = 1;
        const patience = this.size * 4;
        for (let step = 0; step < patience; step += 1) {
            this.visit(cell, { instructionId: ["w1"] });
            if (cell === end) {
                this.tracePath(cameFrom, cell, { instructionId: ["w5"] });
                return;
            }
            // Left first, then straight, right, and finally back.
            let moved = false;
            for (const turn of [3, 0, 1, 2]) {
                const d = (dir + turn) % 4;
                const next = open(cell, d);
                if (next === -1) continue;
                if (!seen[next]) {
                    seen[next] = 1;
                    cameFrom[next] = cell;
                }
                dir = d;
                cell = next;
                moved = true;
                break;
            }
            if (!moved) break;
        }
        this.giveUp();
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            w0: { line: "while (true) {", indent: 0 },
            w1: { line: "if (canGo(left)) turn(left);", indent: 1 },
            w2: { line: "else if (canGo(ahead)) keepGoing();", indent: 1 },
            w3: { line: "else if (canGo(right)) turn(right);", indent: 1 },
            w4: { line: "else turnAround();", indent: 1 },
            w5: { line: "if (cell === end) return trace(cell);", indent: 1 },
            we0: { line: "}", indent: 0 },
        };
    }
}
