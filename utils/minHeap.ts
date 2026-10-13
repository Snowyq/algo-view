/* Binary min-heap of (priority, value, tie) entries for path finding. */
export class MinHeap {
    private items: Array<[number, number, number]> = [];

    get size(): number {
        return this.items.length;
    }

    push(priority: number, value: number, tie = 0): void {
        const items = this.items;
        items.push([priority, value, tie]);
        let i = items.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (!this.less(i, parent)) break;
            [items[i], items[parent]] = [items[parent], items[i]];
            i = parent;
        }
    }

    pop(): number | undefined {
        const items = this.items;
        if (items.length === 0) return undefined;
        const top = items[0][1];
        const last = items.pop()!;
        if (items.length > 0) {
            items[0] = last;
            let i = 0;
            for (;;) {
                const l = i * 2 + 1;
                const r = l + 1;
                let m = i;
                if (l < items.length && this.less(l, m)) m = l;
                if (r < items.length && this.less(r, m)) m = r;
                if (m === i) break;
                [items[i], items[m]] = [items[m], items[i]];
                i = m;
            }
        }
        return top;
    }

    private less(a: number, b: number): boolean {
        const x = this.items[a];
        const y = this.items[b];
        return x[0] < y[0] || (x[0] === y[0] && x[2] < y[2]);
    }
}
