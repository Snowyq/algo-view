import { JSX } from "react";
import styled from "styled-components";
import { labelText } from "../primitives/pixel";
import { Swatch, useLegendItems } from "./legendItems";

/* Inline legend beside the transport; narrow screens use LegendMenu. */

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

function Legend(): JSX.Element {
    const items = useLegendItems();
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
