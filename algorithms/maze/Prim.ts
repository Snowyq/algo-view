import type { AlgorithmInstructions } from "../types";
import { MARK_FRONTIER, MazeAlgorithm } from "./MazeAlgorithm";

/* Grows from one room by adding a random frontier room each time.
   Short dead ends everywhere, a branching, coral-like texture. */
export class Prim extends MazeAlgorithm {
    generate(): void {
        const start = this.pick(this.rooms());
        this.carve([start], { instructionId: ["p0"] });
        const frontier: number[] = [];
        const inFrontier = new Uint8Array(this.size);
        const grow = (room: number): void => {
            const added = this.roomNeighbors(room)
                .map((n) => n.room)
                .filter((r) => !this.isOpen(r) && !inFrontier[r]);
            added.forEach((r) => {
                inFrontier[r] = 1;
                frontier.push(r);
            });
            if (added.length) {
                this.markCells("frontier", added, MARK_FRONTIER, {
                    instructionId: ["p1"],
                });
            }
        };
        grow(start);
        while (frontier.length > 0) {
            const index = Math.floor(this.rng() * frontier.length);
            const room = frontier[index];
            frontier[index] = frontier[frontier.length - 1];
            frontier.pop();
            this.visit(room, { instructionId: ["p3"] });
            const link = this.pick(
                this.roomNeighbors(room).filter((n) => this.isOpen(n.room))
            );
            this.carve([link.wall, room], { instructionId: ["p4"] });
            grow(room);
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            p0: { line: "inMaze.add(randomRoom());", indent: 0 },
            p1: { line: "frontier.add(neighborsOutside(room));", indent: 0 },
            p2: { line: "while (frontier.size) {", indent: 0 },
            p3: { line: "const room = frontier.popRandom();", indent: 1 },
            p4: {
                line: "carve(room, random(neighborsInMaze(room)));",
                indent: 1,
            },
            p5: { line: "frontier.add(neighborsOutside(room));", indent: 1 },
            pe2: { line: "}", indent: 0 },
        };
    }
}
