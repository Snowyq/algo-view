/** Union-find with path compression. */
export class DisjointSet {
    private parent: number[];

    constructor(size: number) {
        this.parent = Array.from({ length: size }, (_, i) => i);
    }

    find(i: number): number {
        const parent = this.parent;
        return parent[i] === i ? i : (parent[i] = this.find(parent[i]));
    }

    /** Joins the sets of a and b; false if they were already one set. */
    union(a: number, b: number): boolean {
        const ra = this.find(a);
        const rb = this.find(b);
        if (ra === rb) return false;
        this.parent[ra] = rb;
        return true;
    }
}
