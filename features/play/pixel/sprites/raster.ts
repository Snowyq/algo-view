/* Tiny bitmap of palette characters ("." is empty) that sprite rigs draw into. */
export class Raster {
    readonly w: number;
    readonly h: number;
    private cells: string[];

    constructor(w: number, h: number) {
        this.w = w;
        this.h = h;
        this.cells = new Array<string>(w * h).fill(".");
    }

    /* Cell index, or -1 when off the bitmap. */
    private indexOf(x: number, y: number): number {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        if (ix < 0 || iy < 0 || ix >= this.w || iy >= this.h) return -1;
        return iy * this.w + ix;
    }

    set(x: number, y: number, c: string): void {
        const i = this.indexOf(x, y);
        if (i >= 0) this.cells[i] = c;
    }

    get(x: number, y: number): string {
        const i = this.indexOf(x, y);
        return i >= 0 ? this.cells[i] : ".";
    }

    rect(x: number, y: number, w: number, h: number, c: string): void {
        const x0 = Math.round(x);
        const y0 = Math.round(y);
        for (let yy = y0; yy < y0 + Math.round(h); yy += 1) {
            for (let xx = x0; xx < x0 + Math.round(w); xx += 1) {
                this.set(xx, yy, c);
            }
        }
    }

    toGrid(): string[] {
        const rows: string[] = [];
        for (let y = 0; y < this.h; y += 1) {
            rows.push(this.cells.slice(y * this.w, (y + 1) * this.w).join(""));
        }
        return rows;
    }
}
