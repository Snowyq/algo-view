/** Focus mode, stacked (narrow stages): the panel keeps this top share. */
export const FOCUS_SHARE = "42%";
/** Focus mode, side by side (wide stages): the panel keeps this left share. */
export const FOCUS_SIDE_SHARE = "46%";
/** Stages at least this wide put the window beside the panel. */
export const FOCUS_SIDE_MIN_WIDTH = 760;

type Box = { minWidth: number; minHeight: number };

/*
 * Column count for n panels. Layouts whose rows reach minHeight win, then
 * the one with the most room relative to the minimum; if none fits, the
 * closest one wins and the panels go compact.
 */
export function panelColumns(
    count: number,
    width: number,
    height: number,
    gap: number,
    { minWidth, minHeight }: Box
): number {
    if (count <= 1 || width <= 0 || height <= 0) return 1;
    let best: { columns: number; score: number; fits: boolean } | null = null;
    for (let columns = 1; columns <= count; columns += 1) {
        const w = (width - (columns - 1) * gap) / columns;
        if (columns > 1 && w < minWidth) break;
        const rows = Math.ceil(count / columns);
        const h = (height - (rows - 1) * gap) / rows;
        const fits = h >= minHeight;
        // Empty cells in the last row waste space: a small penalty.
        const waste = columns * rows - count;
        const score = fits
            ? Math.min(w / minWidth, h / minHeight) * (1 - waste * 0.04)
            : h / minHeight;
        if (
            !best ||
            (fits && !best.fits) ||
            (fits === best.fits && score > best.score)
        ) {
            best = { columns, score, fits };
        }
    }
    return best?.columns ?? 1;
}

/*
 * How many panels fit at all. Compact panels drop their counters, so rows
 * may go well below minHeight, but not below what the drawing needs.
 */
export function panelCapacity(
    width: number,
    height: number,
    gap: number,
    { minWidth, minHeight }: Box
): number {
    if (width <= 0 || height <= 0) return 99;
    const floor = Math.max(120, Math.round(minHeight * 0.55));
    const maxColumns = Math.max(
        1,
        Math.floor((width + gap) / (minWidth + gap))
    );
    const rows = Math.max(1, Math.floor((height + gap) / (floor + gap)));
    return Math.max(1, maxColumns * rows);
}
