import { JSX, type ReactNode } from "react";
import styled from "styled-components";
import { labelText, pixelFrame } from "./pixel";

type Side = "top" | "bottom";

const Wrap = styled.span`
    position: relative;
    display: inline-flex;

    /* Keyboard focus only: a mouse click must not leave the tip stuck. */
    @media (hover: hover) {
        &:hover > [role="tooltip"] {
            visibility: visible;
        }
        &:hover > [role="tooltip"] > span {
            animation: px-type calc(var(--chars) * 18ms) steps(var(--chars))
                both;
        }
    }
    &:has(:focus-visible) > [role="tooltip"] {
        visibility: visible;
    }
    &:has(:focus-visible) > [role="tooltip"] > span {
        animation: px-type calc(var(--chars) * 18ms) steps(var(--chars)) both;
    }

    @keyframes px-type {
        from {
            clip-path: inset(0 100% 0 0);
        }
        to {
            clip-path: inset(0 0 0 0);
        }
    }
`;

/* Types itself in, one character per frame, with a block cursor. */
const Tip = styled.span<{ $side: Side; $align: "center" | "start" | "end" }>`
    position: absolute;
    ${({ $side }) =>
        $side === "top"
            ? "bottom: calc(100% + 1rem);"
            : "top: calc(100% + 1rem);"}
    ${({ $align }) =>
        $align === "center"
            ? "left: 50%; translate: -50% 0;"
            : $align === "start"
              ? "left: 0;"
              : "right: 0;"}
    z-index: 60;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0.6rem 0.8rem;
    background-color: var(--fg);
    color: var(--bg);
    ${labelText};
    white-space: nowrap;
    pointer-events: none;
    visibility: hidden;
    ${pixelFrame("var(--fg)")};

    &::after {
        content: "";
        width: 0.6rem;
        height: 1rem;
        background-color: var(--accent);
        animation: px-blink 0.8s steps(1) infinite;
    }
`;

type PixelTooltipProps = {
    label: string;
    side?: Side;
    align?: "center" | "start" | "end";
    children: ReactNode;
};

function PixelTooltip({
    label,
    side = "top",
    align = "center",
    children,
}: PixelTooltipProps): JSX.Element {
    return (
        <Wrap>
            {children}
            <Tip
                role="tooltip"
                $side={side}
                $align={align}
                style={{ ["--chars" as string]: Math.max(1, label.length) }}
            >
                <span>{label}</span>
            </Tip>
        </Wrap>
    );
}

export default PixelTooltip;
