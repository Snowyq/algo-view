import type { RefObject } from "react";
import useSizeFlag from "../../hooks/useSizeFlag";

/*
 * Code is shown inside a panel only next to the chart, and only when both
 * fit. Otherwise the panel's code button opens the sidebar's Code tab.
 */

const SIDE_MIN_WIDTH = 620;
const SIDE_MIN_HEIGHT = 200;

export function sideCodeFits(width: number, height: number): boolean {
    return width >= SIDE_MIN_WIDTH && height >= SIDE_MIN_HEIGHT;
}

function useSideCodeFits(ref: RefObject<HTMLElement | null>): boolean {
    return useSizeFlag(ref, sideCodeFits);
}

export default useSideCodeFits;
