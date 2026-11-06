import { css } from "styled-components";

/*
 * Appear / disappear through a 4x4 Bayer dither in 4px cells, as mask
 * frames. Usage: `animation: px-dither-in 200ms both;` (or px-dither-out).
 */

const BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
];
const CELL = 4;

/** 16x16 tile with cells below `threshold` (0-16) opaque. */
function tile(threshold: number): string {
    let rects = "";
    BAYER.forEach((row, y) =>
        row.forEach((value, x) => {
            if (value < threshold) {
                rects += `<rect x='${x * CELL}' y='${y * CELL}' width='${CELL}' height='${CELL}'/>`;
            }
        })
    );
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' shape-rendering='crispEdges'>${rects}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const FRAMES = [0, 4, 8, 12].map(tile);

const frame = (index: number): string => `
    -webkit-mask-image: ${FRAMES[index]};
    mask-image: ${FRAMES[index]};
    -webkit-mask-size: 16px 16px;
    mask-size: 16px 16px;
`;

const none = `
    -webkit-mask-image: none;
    mask-image: none;
`;

export const ditherKeyframes = css`
    @keyframes px-dither-in {
        0% {
            ${frame(0)}
        }
        20% {
            ${frame(1)}
        }
        45% {
            ${frame(2)}
        }
        70% {
            ${frame(3)}
        }
        100% {
            ${none}
        }
    }
    @keyframes px-dither-out {
        0% {
            ${none}
        }
        30% {
            ${frame(3)}
        }
        55% {
            ${frame(2)}
        }
        80% {
            ${frame(1)}
        }
        100% {
            ${frame(0)}
        }
    }
`;
