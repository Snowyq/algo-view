/*
 * How many columns for n panels on a stage of a given size. Panels
 * always share the stage height (the stage never scrolls). Every column
 * count whose panels stay at least minWidth wide is tried; layouts where
 * rows reach minHeight win, and among those the one that gives panels
 * the most room relative to their minimum. If none reaches minHeight,
 * the one closest to it wins and the panels go compact.
 */

type Box = { minWidth: number; minHeight: number };

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
 * How many panels fit at all: the most n for which some column count
 * keeps panels at least minWidth wide (one column always allowed) and at
 * least a readable compact height. Compact panels drop their counters,
 * so they can go well below the comfortable minHeight, but not below
 * what the category's drawing needs (graphs more than bars).
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
