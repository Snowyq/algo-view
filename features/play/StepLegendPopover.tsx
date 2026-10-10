import { JSX, useCallback, useEffect, useId, useRef, useState } from "react";
import { BsPalette } from "react-icons/bs";
import styled from "styled-components";
import useClickOutside from "../../hooks/useClickOutside";
import { ToolButton } from "../../ui/ToolGroup";
import { LEGEND_ORDER, STEP_LEGEND } from "./stepLegend";

/*
 * Step colors live next to the playback controls, one click from the
 * charts they explain. Opens upward from its button; Esc or outside closes.
 */

const Wrap = styled.div`
    position: relative;
    display: inline-flex;
`;

const Panel = styled.div`
    position: absolute;
    right: -4px;
    bottom: calc(100% + 1rem);
    z-index: 2000;
    width: 26rem;
    padding: var(--space-3) var(--space-4) var(--space-4);
    border: 1px solid var(--ink-700);
    border-radius: var(--radius-md);
    background-color: var(--ink-850);
    box-shadow: var(--shadow-3);
    transform-origin: calc(100% - 2rem) 100%;

    opacity: 0;
    visibility: hidden;
    transform: translateY(4px) scale(0.97);
    transition:
        opacity 120ms ease-in,
        transform 120ms ease-in,
        visibility 0s linear 120ms;

    &[data-open="true"] {
        opacity: 1;
        visibility: visible;
        transform: none;
        transition:
            opacity 180ms var(--ease-out),
            transform 180ms var(--ease-out),
            visibility 0s;
    }

    @media (prefers-reduced-motion: reduce) {
        transform: none;
    }
`;

const Title = styled.h2`
    margin-bottom: var(--space-3);
    font-family: var(--font-mono-stack);
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
`;

const List = styled.ul`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2) var(--space-4);
`;

const Item = styled.li`
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--text-soft);
`;

const Swatch = styled.span<{ $colorVar: string }>`
    flex: 0 0 auto;
    width: 1rem;
    height: 1rem;
    border-radius: 2px;
    background-color: ${({ $colorVar }) => `var(${$colorVar})`};
`;

const items = LEGEND_ORDER.map((type) => STEP_LEGEND[type]);

function StepLegendPopover(): JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    const panelId = useId();
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const close = useCallback(() => setOpen(false), []);
    const { ref } = useClickOutside<HTMLDivElement>(close);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent): void => {
            if (event.key !== "Escape") return;
            setOpen(false);
            buttonRef.current?.focus();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    return (
        <Wrap ref={ref}>
            <ToolButton
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={panelId}
                aria-label="Step colors"
                title="Step colors"
            >
                <BsPalette />
            </ToolButton>
            <Panel
                id={panelId}
                role="dialog"
                aria-label="Step colors"
                data-open={open}
            >
                <Title>Step colors</Title>
                <List>
                    {items.map((item) => (
                        <Item key={item.label}>
                            <Swatch $colorVar={item.colorVar} />
                            <span>{item.label}</span>
                        </Item>
                    ))}
                </List>
            </Panel>
        </Wrap>
    );
}

export default StepLegendPopover;
