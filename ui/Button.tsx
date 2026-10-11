import styled, { css } from "styled-components";
type ButtonSize = "small" | "medium" | "large" | "xlarge";
type ButtonVariation = "primary" | "secondary" | "danger";
const sizes: Record<ButtonSize, ReturnType<typeof css>> = {
    small: css`
        height: 3.2rem;
        padding: 0 1.2rem;
        font-size: var(--text-xs);
        font-family: var(--font-mono-stack);
        letter-spacing: 0.06em;
        text-transform: uppercase;
    `,
    medium: css`
        height: 4rem;
        padding: 0 1.6rem;
        font-size: var(--text-sm);
    `,
    large: css`
        height: 4.8rem;
        padding: 0 2.4rem;
        font-size: var(--text-base);
    `,
    xlarge: css`
        height: 5.6rem;
        padding: 0 3.2rem;
        font-size: var(--text-md);
    `,
};

const variations: Record<ButtonVariation, ReturnType<typeof css>> = {
    primary: css`
        color: var(--ink-950);
        background-color: var(--swap);

        @media (hover: hover) {
            &:hover:not(:disabled) {
                background-color: var(--swap-strong);
            }
        }
    `,
    secondary: css`
        color: var(--text);
        background-color: transparent;
        box-shadow: inset 0 0 0 1px var(--ink-600);

        @media (hover: hover) {
            &:hover:not(:disabled) {
                background-color: var(--ink-800);
            }
        }
    `,
    danger: css`
        color: var(--ink-950);
        background-color: var(--danger);

        @media (hover: hover) {
            &:hover:not(:disabled) {
                background-color: #ffb0b0;
            }
        }
    `,
};

const Button = styled.button<{
    size?: ButtonSize;
    variation?: ButtonVariation;
}>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    width: fit-content;
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    transition:
        background-color var(--dur-fast) var(--ease-out),
        transform var(--dur-fast) var(--ease-out);

    ${({ size = "medium" }) => sizes[size]}
    ${({ variation = "primary" }) => variations[variation]}

    &:active:not(:disabled) {
        transform: scale(0.97);
    }

    &:disabled {
        color: var(--text-faint);
        background-color: var(--ink-800);
        box-shadow: none;
    }

    @media (prefers-reduced-motion: reduce) {
        &:active:not(:disabled) {
            transform: none;
        }
    }
`;

export default Button;
