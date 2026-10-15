/*
 * A tiny bitmap canvas for building sprite frames out of shapes.
 * Cells hold one palette character ("." = empty). Shapes are sampled at
 * cell centers, so the same rig gives crisp, stable pixels every frame.
 */
export class Raster {
    readonly w: number;
    readonly h: number;
    private cells: string[];

    constructor(w: number, h: number) {
        this.w = w;
        this.h = h;
        this.cells = new Array<string>(w * h).fill(".");
    }

    set(x: number, y: number, c: string): void {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        if (ix < 0 || iy < 0 || ix >= this.w || iy >= this.h) return;
        this.cells[iy * this.w + ix] = c;
    }

    get(x: number, y: number): string {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        if (ix < 0 || iy < 0 || ix >= this.w || iy >= this.h) return ".";
        return this.cells[iy * this.w + ix];
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

    ellipse(cx: number, cy: number, rx: number, ry: number, c: string): void {
        if (rx <= 0 || ry <= 0) return;
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
            for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
                const dx = (x + 0.5 - cx) / rx;
                const dy = (y + 0.5 - cy) / ry;
                if (dx * dx + dy * dy <= 1) this.set(x, y, c);
            }
        }
    }

    /* Thick line: a square brush stamped along the segment. */
    line(
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        c: string,
        thick = 1
    ): void {
        const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2));
        const off = (thick - 1) / 2;
        for (let i = 0; i <= steps; i += 1) {
            const t = i / steps;
            const x = x0 + (x1 - x0) * t;
            const y = y0 + (y1 - y0) * t;
            for (let by = 0; by < thick; by += 1) {
                for (let bx = 0; bx < thick; bx += 1) {
                    this.set(x - off + bx, y - off + by, c);
                }
            }
        }
    }

    /* Only paints cells that already hold `onto` (for markings on a body). */
    paintOver(x: number, y: number, c: string, onto = "o"): void {
        if (this.get(x, y) === onto) this.set(x, y, c);
    }

    toGrid(): string[] {
        const rows: string[] = [];
        for (let y = 0; y < this.h; y += 1) {
            rows.push(this.cells.slice(y * this.w, (y + 1) * this.w).join(""));
        }
        return rows;
    }
}
