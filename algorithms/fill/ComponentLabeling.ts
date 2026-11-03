import type { AlgorithmInstructions } from "../types";
import { FillAlgorithm } from "./FillAlgorithm";

/* Two-pass connected-component labelling with union-find. Labels every
   region, not just the one around the start. */
export class ComponentLabeling extends FillAlgorithm {
    get metricNames(): [string, string, string] {
        return ["Labelled", "Merges", "Regions"];
    }

    get mode(): "order" | "label" {
        return "label";
    }

    protected run(): void {
        const parent: number[] = [0];
        const find = (i: number): number =>
            parent[i] === i ? i : (parent[i] = find(parent[i]));
        const labelAt = (x: number, y: number): number =>
            this.open(x, y) ? this.marks[this.at(x, y)] : 0;
        // First pass: take the left or upper label (or a new one) and
        // remember which labels touch.
        for (let y = 0; y < this.rows; y += 1) {
            for (let x = 0; x < this.cols; x += 1) {
                if (!this.open(x, y)) continue;
                const left = labelAt(x - 1, y);
                const up = labelAt(x, y - 1);
                let label: number;
                if (!left && !up) {
                    label = parent.length;
                    parent.push(label);
                } else if (left && up && find(left) !== find(up)) {
                    const [a, b] = [find(left), find(up)];
                    label = Math.min(a, b);
                    parent[Math.max(a, b)] = label;
                    this.metrics.pushes.count += 1;
                } else {
                    label = left || up;
                }
                this.paint(this.at(x, y), label);
                this.emit("label", this.at(x, y), { instructionId: ["c1"] });
            }
        }
        // Second pass, one row per step: final region ids 1..k.
        const finalId = new Map<number, number>();
        for (let y = 0; y < this.rows; y += 1) {
            let changed = false;
            for (let x = 0; x < this.cols; x += 1) {
                const cell = this.at(x, y);
                if (!this.marks[cell]) continue;
                const root = find(this.marks[cell]);
                if (!finalId.has(root)) finalId.set(root, finalId.size + 1);
                const id = finalId.get(root)!;
                if (id !== this.marks[cell]) {
                    this.setMark(cell, id);
                    changed = true;
                }
            }
            this.metrics.peak.count = finalId.size;
            if (changed)
                this.emit("merge", this.at(0, y), { instructionId: ["c2"] });
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            c1: {
                line: "label = left ?? up ?? new; union(left, up);",
                indent: 0,
            },
            c2: { line: "second pass: label = find(label);", indent: 0 },
        };
    }
}
