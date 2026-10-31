import type { AlgorithmInstructions } from "../types";
import { MARK_IN_MAZE, MARK_WALK, MazeAlgorithm } from "./MazeAlgorithm";

/* Walks into unvisited rooms, backs up at dead ends. The open stack is
   marked as a walk. Long, winding corridors. */
export class RecursiveBacktracker extends MazeAlgorithm {
    generate(): void {
        const start = this.pick(this.rooms());
        this.carve([start], { instructionId: ["k0"] });
        this.markCells("walk", [start], MARK_WALK);
        const stack: Array<{ room: number; wall: number }> = [
            { room: start, wall: -1 },
        ];
        while (stack.length > 0) {
            const { room, wall } = stack[stack.length - 1];
            this.visit(room, { instructionId: ["k2"] });
            const options = this.roomNeighbors(room).filter(
                (n) => !this.isOpen(n.room)
            );
            if (options.length === 0) {
                stack.pop();
                const done = wall >= 0 ? [room, wall] : [room];
                this.markCells("visit", done, MARK_IN_MAZE, {
                    instructionId: ["k3"],
                });
                continue;
            }
            const next = this.pick(options);
            this.carve([next.wall, next.room], { instructionId: ["k5"] });
            this.markCells("walk", [next.wall, next.room], MARK_WALK);
            stack.push(next);
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            k0: { line: "stack.push(randomRoom());", indent: 0 },
            k1: { line: "while (stack.length) {", indent: 0 },
            k2: { line: "const room = stack.at(-1);", indent: 1 },
            k3: {
                line: "if (!unvisitedNeighbors(room)) { stack.pop(); continue; }",
                indent: 1,
            },
            k4: {
                line: "const next = random(unvisitedNeighbors(room));",
                indent: 1,
            },
            k5: { line: "carve(room, next); stack.push(next);", indent: 1 },
            ke1: { line: "}", indent: 0 },
        };
    }
}
