import { JSX, useId, type ReactNode } from "react";
import styled from "styled-components";
import { blockPattern, pixelFrame } from "./pixel";

const Row = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 1.2rem;
    cursor: pointer;
    color: var(--fg-2);
    font-size: 1.5rem;
`;

/* The knob hops in two frames; the fill follows it in four. */
const Switch = styled.button`
    position: relative;
    flex: 0 0 auto;
    width: 4rem;
    height: 2rem;
    margin: var(--b);
    padding: 0;
    border: 0;
    background-color: var(--surface);
    ${pixelFrame("var(--line-2)")};

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        ${blockPattern("var(--accent)", 4, 2)};
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 160ms steps(4);
    }

    &::after {
        content: "";
        position: absolute;
        top: 4px;
        left: 4px;
        width: 1.2rem;
        height: 1.2rem;
        background-color: var(--fg-3);
        transition: transform 80ms steps(2);
    }

    &[aria-checked="true"] {
        ${pixelFrame("var(--accent)")};
    }
    &[aria-checked="true"]::before {
        transform: scaleX(1);
    }
    &[aria-checked="true"]::after {
        transform: translateX(2rem);
        background-color: var(--fg);
    }
`;

type PixelToggleProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children?: ReactNode;
};

function PixelToggle({
    checked,
    onChange,
    children,
}: PixelToggleProps): JSX.Element {
    const id = useId();
    return (
        <Row htmlFor={id}>
            <Switch
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
            />
            {children}
        </Row>
    );
}

export default PixelToggle;
