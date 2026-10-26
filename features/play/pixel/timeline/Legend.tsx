import { JSX } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import type { RootState } from "../../../../store";
import { categoryOf } from "../../categories";
import { getActiveCategory } from "../../playSlice";
import { STEP_LEGEND } from "../../stepLegend";
import { labelText } from "../primitives/pixel";

/*
 * What the colours mean, always on screen next to the transport. Swatches
 * are the same blocks the canvas draws. Narrow screens hide it and keep
 * the LegendMenu button instead.
 */

const List = styled.ul`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem 1.4rem;
    min-width: 0;
    list-style: none;
`;

const Item = styled.li`
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    ${labelText};
    font-size: 1rem;
    color: var(--fg-3);
    white-space: nowrap;
`;

const Swatch = styled.span<{ $colorVar: string }>`
    flex: 0 0 auto;
    width: 1rem;
    height: 1.2rem;
    background-color: ${({ $colorVar }) => `var(${$colorVar})`};
    box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.28);
`;

function Legend(): JSX.Element {
    const category = useSelector<RootState, string>(getActiveCategory);
    const items = categoryOf(category).legend.map((type) => ({
        type,
        ...STEP_LEGEND[type],
    }));
    return (
        <List aria-label="What the colours mean">
            {items.map((item) => (
                <Item key={item.type}>
                    <Swatch $colorVar={item.colorVar} aria-hidden="true" />
                    {item.label}
                </Item>
            ))}
        </List>
    );
}

export default Legend;
