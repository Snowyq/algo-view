import { css } from "styled-components";

/* Notched pixel border from four hard shadows; outside the box, no layout shift. */
export const frameShadows = (color: string, width = "var(--b)"): string => `
    0 calc(${width} * -1) 0 0 ${color},
    0 ${width} 0 0 ${color},
    calc(${width} * -1) 0 0 0 ${color},
    ${width} 0 0 0 ${color}`;

export const pixelFrame = (color = "var(--line)", width = "var(--b)") => css`
    box-shadow: ${frameShadows(color, width)};
`;

/* Frame plus a darker bottom lip, so a control reads as pressable. */
export const pixelRaised = (color = "var(--line-2)") => css`
    box-shadow:
        ${frameShadows(color)},
        inset 0 calc(var(--b) * -2) 0 0 rgba(0, 0, 0, 0.32);
`;

export const labelText = css`
    font-family: var(--f-label);
    font-size: 1.1rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1;
`;

/* Vertical scroller with a reserved gutter, so content never shifts. */
export const scrollY = css`
    overflow-y: auto;
    scrollbar-gutter: stable;
    overscroll-behavior: contain;
`;

/* Row of square blocks with a gap, used by tracks, meters and dotted rules. */
export const blockPattern = (
    color: string,
    block = 6,
    gap = 2,
    angle = "90deg"
) => css`
    background-image: repeating-linear-gradient(
        ${angle},
        ${color} 0 ${block}px,
        transparent ${block}px ${block + gap}px
    );
`;

/*
 * Hover: pixel corner brackets dither in around the element.
 * Needs `position: relative` and a free ::after on the host.
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
