import { css } from "styled-components";

/*
 * Pixel frame: four hard shadows leave the corners notched, the classic
 * bitmap border. Drawn outside the box, so layout never shifts.
 */
export const pixelFrame = (color = "var(--line)", width = "var(--b)") => css`
    box-shadow:
        0 calc(${width} * -1) 0 0 ${color},
        0 ${width} 0 0 ${color},
        calc(${width} * -1) 0 0 0 ${color},
        ${width} 0 0 0 ${color};
`;

/* Frame plus a darker bottom lip, so a control reads as pressable. */
export const pixelRaised = (color = "var(--line-2)") => css`
    box-shadow:
        0 calc(var(--b) * -1) 0 0 ${color},
        0 var(--b) 0 0 ${color},
        calc(var(--b) * -1) 0 0 0 ${color},
        var(--b) 0 0 0 ${color},
        inset 0 calc(var(--b) * -2) 0 0 rgba(0, 0, 0, 0.32);
`;

export const labelText = css`
    font-family: var(--f-label);
    font-size: 1.1rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1;
`;

export const displayText = css`
    font-family: var(--f-display);
    font-weight: 400;
    line-height: 0.9;
    letter-spacing: 0.01em;
`;

/* Row of square blocks with a 2px gap, used by tracks and meters. */
export const blockPattern = (color: string, block = 6, gap = 2) => css`
    background-image: repeating-linear-gradient(
        90deg,
        ${color} 0 ${block}px,
        transparent ${block}px ${block + gap}px
    );
`;

/* Snap a pixel length down to whole blocks (block + gap). */
export function snapToBlocks(length: number, block = 6, gap = 2): number {
    const unit = block + gap;
    return Math.round(length / unit) * unit;
}

/*
 * Hover: four pixel corner brackets dither in around the element instead
 * of it jumping up. Needs `position: relative` on the host and a free
 * ::after; `active` is the selector that shows them.
 */
export const pixelCorners = (
    color = "var(--accent)",
    active = "&:hover, &:focus-visible",
    size = "1.2rem"
) => {
    const bar = (position: string, w: string, h: string): string =>
        `linear-gradient(${color}, ${color}) ${position} / ${w} ${h} no-repeat`;
    const t = "var(--b)";
    return css`
        &::after {
            content: "";
            position: absolute;
            inset: calc(var(--b) * -3);
            pointer-events: none;
            opacity: 0;
            background:
                ${bar("top left", size, t)}, ${bar("top left", t, size)},
                ${bar("top right", size, t)}, ${bar("top right", t, size)},
                ${bar("bottom left", size, t)}, ${bar("bottom left", t, size)},
                ${bar("bottom right", size, t)}, ${bar("bottom right", t, size)};
        }
        @media (hover: hover) {
            ${active} {
                &::after {
                    opacity: 1;
                    animation: px-dither-in 160ms both;
                }
            }
        }
    `;
};
