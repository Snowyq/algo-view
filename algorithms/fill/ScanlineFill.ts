import type { AlgorithmInstructions } from "../types";
import { FillAlgorithm } from "./FillAlgorithm";

/* Paints whole horizontal runs at once, then seeds only one cell per run
   in the rows above and below. Far fewer pushes and a tiny stack: the
   way paint programs actually do it. */
export class ScanlineFill extends FillAlgorithm {
    protected run(): void {
        const stack = [this.start];
        this.push(this.start);
        while (stack.length) {
            this.memory(stack.length);
            const seed = stack.pop()!;
            if (this.marks[seed] > 0) continue;
            const [x0, y] = this.xy(seed);
            let left = x0;
            let right = left;
            while (
                this.open(left - 1, y) &&
                this.marks[this.at(left - 1, y)] <= 0
            )
                left -= 1;
            while (
                this.open(right + 1, y) &&
                this.marks[this.at(right + 1, y)] <= 0
            )
                right += 1;
            for (let x = left; x <= right; x += 1) this.paint(this.at(x, y));
            for (const ny of [y - 1, y + 1]) {
                let inRun = false;
                for (let x = left; x <= right; x += 1) {
                    const free =
                        this.open(x, ny) && this.marks[this.at(x, ny)] === 0;
                    if (free && !inRun) {
                        this.push(this.at(x, ny));
                        stack.push(this.at(x, ny));
                    }
                    inRun = free;
                }
            }
            this.emit("span", seed, { instructionId: ["l1"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            l0: { line: "stack = [start];", indent: 0 },
            l1: { line: "paint the whole run left ↔ right;", indent: 0 },
            l2: { line: "push one seed per run above and below;", indent: 1 },
        };
    }
}
