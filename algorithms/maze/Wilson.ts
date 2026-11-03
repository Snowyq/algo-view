import type { AlgorithmInstructions } from "../types";
import { MARK_NONE, MARK_WALK, MazeAlgorithm } from "./MazeAlgorithm";

/* Loop-erased random walks from new rooms until they hit the maze.
   Unbiased, slow to start. */
export class Wilson extends MazeAlgorithm {
    generate(): void {
        const rooms = this.rooms();
        const inMaze = new Uint8Array(this.size);
        const first = this.pick(rooms);
        inMaze[first] = 1;
        this.carve([first], { instructionId: ["w0"] });
        let remaining = rooms.filter((r) => !inMaze[r]);
        while (remaining.length > 0) {
            const start = this.pick(remaining);
            const path: number[] = [start];
            const walls: number[] = [];
            this.markCells("walk", [start], MARK_WALK, {
                instructionId: ["w2"],
            });
            let cur = start;
            while (!inMaze[cur]) {
                const { room: next, wall } = this.pick(this.roomNeighbors(cur));
                this.visit(next, { instructionId: ["w3"] });
                const loopAt = path.indexOf(next);
                if (loopAt >= 0) {
                    // Erase the loop we just closed.
                    const erased = [
                        ...path.splice(loopAt + 1),
                        ...walls.splice(loopAt),
                    ];
                    this.markCells("walk", erased, MARK_NONE, {
                        instructionId: ["w4"],
                    });
                } else {
                    path.push(next);
                    walls.push(wall);
                    this.markCells("walk", [wall, next], MARK_WALK);
                }
                cur = next;
            }
            // Commit the loop-erased walk to the maze.
            const cells: number[] = [];
            path.forEach((room, i) => {
                inMaze[room] = 1;
                cells.push(room);
                if (i < walls.length) cells.push(walls[i]);
            });
            this.carve(cells, { instructionId: ["w5"] });
            remaining = remaining.filter((r) => !inMaze[r]);
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            w0: { line: "inMaze.add(randomRoom());", indent: 0 },
            w1: { line: "while (roomsLeft()) {", indent: 0 },
            w2: { line: "let walk = [randomRoomOutside()];", indent: 1 },
            w3: { line: "step to a random neighbour;", indent: 1 },
            w4: {
                line: "if (walk.includes(next)) eraseLoop(next);",
                indent: 1,
            },
            w5: { line: "if (inMaze.has(next)) carve(walk);", indent: 1 },
            we1: { line: "}", indent: 0 },
        };
    }
}
