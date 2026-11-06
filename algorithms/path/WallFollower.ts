import type { AlgorithmInstructions } from "../types";
import { DIRS } from "../GridAlgorithm";
import { PathAlgorithm } from "./PathAlgorithm";

/* Left-hand rule. Works when all walls connect; circles forever around
   a free-standing one. */
export class WallFollower extends PathAlgorithm {
    search(): void {
        const { start, end } = this.grid;
        const cameFrom = this.emptyCameFrom();
        const seen = new Uint8Array(this.size);
        // Neighbour in direction `dir` (index into DIRS), or -1 if blocked.
        const open = (cell: number, dir: number): number => {
            const [x, y] = this.xy(cell);
            const nx = x + DIRS[dir][0];
            const ny = y + DIRS[dir][1];
            if (!this.inside(nx, ny)) return -1;
            const next = this.at(nx, ny);
            return this.isWall(next) ? -1 : next;
        };
        let cell = start;
        let dir = 1; // facing right
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
