import Link from "next/link";
import { JSX } from "react";
import styled from "styled-components";

const LogoLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--text);
    font-family: var(--font-display-stack);
    font-weight: 800;
    font-size: 2.4rem;
    line-height: 1;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    font-variation-settings: "opsz" 72;

    svg rect {
        transition: transform var(--dur-base) var(--ease-out);
        transform-box: fill-box;
        transform-origin: bottom;
    }

    @media (hover: hover) and (prefers-reduced-motion: no-preference) {
        &:hover svg rect:nth-child(1) {
            transform: scaleY(1.6);
        }
        &:hover svg rect:nth-child(3) {
            transform: scaleY(0.6);
        }
    }
`;

/* Four bars mid-sort: the last one has already reached "finish". */
function LogoMark(): JSX.Element {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <rect
                x="0"
                y="11"
                width="3.5"
                height="9"
                rx="1"
                style={{ fill: "var(--color-step-default)" }}
            />
            <rect
                x="5.5"
                y="6"
                width="3.5"
                height="14"
                rx="1"
                style={{ fill: "var(--swap)" }}
            />
            <rect
                x="11"
                y="14"
                width="3.5"
                height="6"
                rx="1"
                style={{ fill: "var(--swap)" }}
            />
            <rect
                x="16.5"
                y="0"
                width="3.5"
                height="20"
                rx="1"
                style={{ fill: "var(--finish)" }}
            />
        </svg>
    );
}

function Logo(): JSX.Element {
    return (
        <LogoLink href="/">
            <LogoMark />
            FunAlgorithms
        </LogoLink>
    );
}
export default Logo;
