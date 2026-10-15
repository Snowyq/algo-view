import styled, { css } from "styled-components";
import { labelText, pixelFrame, pixelRaised } from "./pixel";

type Variant = "frame" | "ghost" | "primary" | "danger";
type Size = "sm" | "md" | "lg";

const heights: Record<Size, string> = {
    sm: "3.2rem",
    md: "4rem",
    lg: "5.6rem",
};

/*
 * Hover runs a 1px glint across in four frames; press drops the button
 * one border and eats its lip (instant, no easing: it is a click).
 */
const PixelButton = styled.button<{
    $variant?: Variant;
    $size?: Size;
    $square?: boolean;
}>`
    --btn-bg: var(--surface-2);
    --btn-fg: var(--fg-2);
    --btn-frame: var(--line-2);

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    flex: 0 0 auto;
    height: ${({ $size = "md" }) => heights[$size]};
    ${({ $square, $size = "md" }) =>
        $square
            ? css`
                  width: ${heights[$size]};
              `
            : css`
                  padding: 0 1.4rem;
              `}
    margin: var(--b);
    border: 0;
    background-color: var(--btn-bg);
    color: var(--btn-fg);
    ${labelText};
    font-size: ${({ $size = "md" }) => ($size === "sm" ? "1.1rem" : "1.2rem")};
    white-space: nowrap;
    overflow: hidden;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    ${pixelRaised("var(--btn-frame)")};

    ${({ $variant }) =>
        $variant === "ghost" &&
        css`
            --btn-bg: transparent;
            --btn-frame: transparent;
            box-shadow: none;
        `}

    ${({ $variant }) =>
        $variant === "primary" &&
        css`
            --btn-bg: var(--accent);
            --btn-fg: var(--accent-ink);
            --btn-frame: var(--accent-2);
        `}

    ${({ $variant }) =>
        $variant === "danger" &&
        css`
            --btn-fg: var(--danger);
        `}

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(
            100deg,
            transparent 0 42%,
            rgba(255, 255, 255, 0.22) 42% 50%,
            transparent 50% 100%
        );
        transform: translateX(-110%);
        pointer-events: none;
    }

    @media (hover: hover) {
        &:hover:not(:disabled) {
            --btn-fg: ${({ $variant }) =>
                $variant === "primary"
                    ? "var(--accent-ink)"
                    : $variant === "danger"
                      ? "var(--danger)"
                      : "var(--fg)"};
            --btn-bg: ${({ $variant }) =>
                $variant === "primary"
                    ? "var(--accent-2)"
                    : "var(--surface-3)"};
            ${({ $variant }) =>
                $variant === "ghost" &&
                css`
                    --btn-frame: var(--line);
                    ${pixelFrame("var(--btn-frame)")};
                `}
        }
        &:hover:not(:disabled)::after {
            animation: px-glint 280ms steps(4) both;
        }
    }

    &:active:not(:disabled) {
        transform: translateY(var(--b));
        ${pixelFrame("var(--btn-frame)")};
    }

    &[aria-pressed="true"],
    &[aria-expanded="true"] {
        --btn-frame: var(--accent);
        --btn-fg: var(--accent);
        ${({ $variant }) =>
            $variant === "ghost" &&
            css`
                ${pixelFrame("var(--btn-frame)")};
            `}
    }

    &:disabled {
        --btn-fg: var(--fg-4);
        --btn-bg: var(--surface);
        --btn-frame: var(--line);
        cursor: not-allowed;
    }

    @keyframes px-glint {
        to {
            transform: translateX(110%);
        }
    }
`;

export default PixelButton;
