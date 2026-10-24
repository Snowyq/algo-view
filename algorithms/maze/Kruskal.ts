import type { AlgorithmInstructions } from "../types";
import { MazeAlgorithm } from "./MazeAlgorithm";

/* Every room starts as its own island; walls are knocked down in random
   order whenever they separate two different islands (union-find). */
export class Kruskal extends MazeAlgorithm {
    generate(): void {
        const rooms = this.rooms();
        const parent = new Int32Array(this.size).fill(-1);
        rooms.forEach((room) => (parent[room] = room));
        const find = (a: number): number => {
            while (parent[a] !== a) {
                parent[a] = parent[parent[a]];
                a = parent[a];
            }
            return a;
        };
        this.carve(rooms, { instructionId: ["u0"] });
        const edges: Array<{ a: number; b: number; wall: number }> = [];
        rooms.forEach((room) =>
            this.roomNeighbors(room).forEach(({ room: other, wall }) => {
                if (other > room) edges.push({ a: room, b: other, wall });
            })
        );
        for (const { a, b, wall } of this.shuffle(edges)) {
            this.visit(wall, { instructionId: ["u2"] });
            const ra = find(a);
            const rb = find(b);
            if (ra === rb) continue;
            parent[ra] = rb;
            this.carve([wall], { instructionId: ["u3"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            u0: { line: "every room is its own set;", indent: 0 },
            u1: { line: "for (const wall of shuffle(walls)) {", indent: 0 },
            u2: { line: "const [a, b] = roomsBeside(wall);", indent: 1 },
            u3: {
                line: "if (find(a) !== find(b)) { union(a, b); carve(wall); }",
                indent: 1,
            },
            ue1: { line: "}", indent: 0 },
        };
    }
}
