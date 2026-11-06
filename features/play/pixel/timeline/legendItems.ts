import { useSelector } from "react-redux";
import styled from "styled-components";
import type { RootState } from "../../../../store";
import { categoryOf } from "../../categories";
import { getActiveCategory } from "../../playSlice";
import { STEP_LEGEND } from "../../stepLegend";

export type LegendItem = { type: string; label: string; colorVar: string };

/** Legend entries of the active category, in display order. */
export function useLegendItems(): LegendItem[] {
    const category = useSelector<RootState, string>(getActiveCategory);
    return categoryOf(category).legend.map((type) => ({
        type,
        ...STEP_LEGEND[type],
    }));
}

/* A block of the color the canvas draws, with a lit top edge. */
export const Swatch = styled.span<{ $colorVar: string }>`
    flex: 0 0 auto;
    width: 1rem;
    height: 1.2rem;
    background-color: ${({ $colorVar }) => `var(${$colorVar})`};
    box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.28);
`;
