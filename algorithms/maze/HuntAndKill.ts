import type { AlgorithmInstructions } from "../types";
import { MazeAlgorithm } from "./MazeAlgorithm";

/* Backtracker variant: at a dead end, scan row by row for an unvisited
   room next to the maze and continue from there. */
export class HuntAndKill extends MazeAlgorithm {
    generate(): void {
        const rooms = this.rooms();
        let cur = this.pick(rooms);
        this.carve([cur], { instructionId: ["h0"] });
        for (;;) {
            this.visit(cur, { instructionId: ["h1"] });
            const options = this.roomNeighbors(cur).filter(
                (n) => !this.isOpen(n.room)
            );
            if (options.length > 0) {
                const next = this.pick(options);
                this.carve([next.wall, next.room], { instructionId: ["h2"] });
                cur = next.room;
                continue;
            }
            // Hunt: the first unvisited room touching the maze.
            let found = -1;
            for (const room of rooms) {
                if (this.isOpen(room)) continue;
                this.visit(room, { instructionId: ["h3"] });
                const links = this.roomNeighbors(room).filter((n) =>
                    this.isOpen(n.room)
                );
                if (links.length > 0) {
                    const link = this.pick(links);
                    this.carve([link.wall, room], { instructionId: ["h4"] });
                    found = room;
                    break;
                }
            }
            if (found < 0) return;
            cur = found;
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            h0: { line: "let room = randomRoom();", indent: 0 },
            h1: { line: "while (true) {", indent: 0 },
            h2: {
                line: "if (unvisitedNeighbors(room)) walk to one;",
                indent: 1,
            },
            h3: {
                line: "else hunt row by row for a room next to the maze;",
                indent: 1,
            },
            h4: { line: "carve it in and continue from there;", indent: 1 },
            he1: { line: "}", indent: 0 },
        };
    }
}
