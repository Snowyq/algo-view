import { JSX, useCallback, useId, useRef, useState } from "react";
import styled from "styled-components";
import useClickOutside from "../../../../hooks/useClickOutside";
import { useEscapeKey } from "../../../../hooks/useEscapeKey";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelTooltip from "../primitives/PixelTooltip";
import { labelText, pixelFrame } from "../primitives/pixel";
import { Swatch, useLegendItems } from "./legendItems";

const Wrap = styled.div`
    position: relative;
`;

const Panel = styled.div`
    position: absolute;
    right: 0;
    bottom: calc(100% + 1.2rem);
    z-index: 70;
    width: 30rem;
    padding: 1.2rem 1.4rem 1.4rem;
    background-color: var(--surface);
    ${pixelFrame("var(--line-2)")};
    animation: px-dither-in 140ms steps(4) both;
`;

const Title = styled.p`
    ${labelText};
    color: var(--fg-3);
    margin-bottom: 1.2rem;
`;

const List = styled.ul`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem 1.6rem;
`;

const Item = styled.li`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.4rem;
    color: var(--fg-2);
`;

const BigSwatch = styled(Swatch)`
    width: 1.2rem;
    height: 1.6rem;
`;

function LegendMenu(): JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    const items = useLegendItems();
    const panelId = useId();
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const close = useCallback(() => setOpen(false), []);
    const { ref } = useClickOutside<HTMLDivElement>(close);

    useEscapeKey(open, () => {
        setOpen(false);
        buttonRef.current?.focus();
    });

    return (
        <Wrap ref={ref}>
            <PixelTooltip label="Step colors" align="end">
                <PixelButton
                    ref={buttonRef}
                    type="button"
                    $square
                    $variant="ghost"
                    aria-expanded={open}
                    aria-controls={panelId}
                    aria-label="Step colors"
                    onClick={() => setOpen((value) => !value)}
                >
                    <PixelIcon name="legend" scale={2} />
                </PixelButton>
            </PixelTooltip>
            {open && (
                <Panel id={panelId} role="dialog" aria-label="Step colors">
                    <Title>What the colors mean</Title>
                    <List>
                        {items.map((item) => (
                            <Item key={item.type}>
                                <BigSwatch $colorVar={item.colorVar} />
                                {item.label}
                            </Item>
                        ))}
                    </List>
                </Panel>
            )}
        </Wrap>
    );
}

export default LegendMenu;
