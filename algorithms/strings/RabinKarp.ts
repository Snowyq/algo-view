import type { AlgorithmInstructions } from "../types";
import { StringAlgorithm } from "./StringAlgorithm";

const BASE = 31;
const MOD = 101;

/* Compares a rolling hash of each window with the pattern's hash, and
   only checks letters when the hashes agree. A small modulus here makes
   the occasional false alarm visible. */
export class RabinKarp extends StringAlgorithm {
    tableOn = "text" as const;

    search(): void {
        const t = this.text;
        const p = this.pattern;
        const n = t.length;
        const m = p.length;
        const code = (c: string): number => c.charCodeAt(0) % MOD;
        let high = 1;
        for (let k = 0; k < m - 1; k += 1) high = (high * BASE) % MOD;
        let hp = 0;
        let ht = 0;
        for (let k = 0; k < m; k += 1) {
            hp = (hp * BASE + code(p[k])) % MOD;
            ht = (ht * BASE + code(t[k])) % MOD;
        }
        this.tableLabel = `hash · target ${hp}`;
        for (let s = 0; s <= n - m; s += 1) {
            this.shiftTo(s, { instructionId: ["r1"] });
            this.writeTable(s, ht, { instructionId: ["r2"] });
            if (ht === hp) {
                let j = 0;
                while (
                    j < m &&
                    this.compareChars(s + j, j, { instructionId: ["r3"] })
                )
                    j += 1;
                if (j === m) this.matchAt(s, { instructionId: ["r4"] });
            }
            if (s < n - m) {
                ht = (ht - ((code(t[s]) * high) % MOD) + MOD) % MOD;
                ht = (ht * BASE + code(t[s + m])) % MOD;
            }
        }
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            r0: { line: "const target = hash(pat);", indent: 0 },
            r1: { line: "for (let s = 0; s <= n - m; s++) {", indent: 0 },
            r2: { line: "if (windowHash === target)", indent: 1 },
            r3: { line: "check letter by letter;", indent: 2 },
            r4: { line: "if (all match) found(s);", indent: 2 },
            r5: { line: "roll the hash one letter right;", indent: 1 },
            re1: { line: "}", indent: 0 },
        };
    }
}
