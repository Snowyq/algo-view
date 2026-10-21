import type { AlgorithmInstructions } from "../types";
import { MazeAlgorithm } from "./MazeAlgorithm";

/* A drunk random walk that carves whenever it reaches a new room. Fair,
   and painfully slow to finish the last few rooms. */
export class AldousBroder extends MazeAlgorithm {
    generate(): void {
        const rooms = this.rooms();
        let cur = this.pick(rooms);
        this.carve([cur], { instructionId: ["a0"] });
        let remaining = rooms.length - 1;
        const patience = this.size * 60;
        for (let step = 0; remaining > 0 && step < patience; step += 1) {
            const { room, wall } = this.pick(this.roomNeighbors(cur));
            this.visit(room, { instructionId: ["a2"] });
            if (!this.isOpen(room)) {
                this.carve([wall, room], { instructionId: ["a3"] });
                remaining -= 1;
            }
            cur = room;
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            a0: { line: "let room = randomRoom();", indent: 0 },
            a1: { line: "while (roomsLeft()) {", indent: 0 },
            a2: { line: "const next = randomNeighbor(room);", indent: 1 },
            a3: { line: "if (!visited(next)) carve(room, next);", indent: 1 },
            a4: { line: "room = next;", indent: 1 },
            ae1: { line: "}", indent: 0 },
        };
    }
}
