import { JSX, memo } from "react";
import { ICONS, type IconName } from "./icons";

const pathCache = new Map<string, { d: string; w: number; h: number }>();

/* One path per bitmap: each horizontal run of ink becomes a single rect. */
function bitmapToPath(rows: readonly string[]): {
    d: string;
    w: number;
    h: number;
} {
    const key = rows.join("|");
    const cached = pathCache.get(key);
    if (cached) return cached;
    let d = "";
    let w = 0;
    rows.forEach((row, y) => {
        w = Math.max(w, row.length);
        let x = 0;
        while (x < row.length) {
            if (row[x] !== "#") {
                x += 1;
                continue;
            }
            let run = 1;
            while (row[x + run] === "#") run += 1;
            d += `M${x} ${y}h${run}v1h-${run}z`;
            x += run;
        }
    });
    const result = { d, w, h: rows.length };
    pathCache.set(key, result);
    return result;
}

type PixelIconProps = {
    name: IconName;
    /** Screen pixels per bitmap cell. */
    scale?: number;
    className?: string;
    title?: string;
};

function PixelIcon({
    name,
    scale = 2,
    className,
    title,
}: PixelIconProps): JSX.Element {
    const { d, w, h } = bitmapToPath(ICONS[name]);
    return (
        <svg
            data-pixel
            className={className}
            width={w * scale}
            height={h * scale}
            viewBox={`0 0 ${w} ${h}`}
            fill="currentColor"
            aria-hidden={title ? undefined : true}
            role={title ? "img" : undefined}
            focusable="false"
        >
            {title && <title>{title}</title>}
            <path d={d} />
        </svg>
    );
}

export default memo(PixelIcon);
