import styled, { css } from "styled-components";
type CircleButtonSize = "small" | "medium" | "large" | "xlarge";
type CircleButtonVariation = "primary" | "secondary" | "danger" | "close";

const sizes: Record<CircleButtonSize, ReturnType<typeof css>> = {
    small: css`
        font-size: 1.4rem;
        padding: 0.8rem 0.8rem;
        text-transform: uppercase;
        font-weight: 600;
        text-align: center;
    `,
    medium: css`
        font-size: 1.6rem;
        padding: 1.6rem 1.6rem;
        font-weight: 500;
    `,
    large: css`
        font-size: 1.8rem;
        padding: 2.4rem 2.4rem;
        font-weight: 500;
    `,
    xlarge: css`
        font-size: 2rem;
        padding: 2.8rem 2.8rem;
        font-weight: 500;
    `,
};

const variations: Record<CircleButtonVariation, ReturnType<typeof css>> = {
    primary: css`
        color: var(--ink-950);
        background-color: var(--swap);

        &:hover {
            background-color: var(--swap-strong);
        }
    `,
    secondary: css`
        color: var(--text);
        background: var(--ink-850);
        border: 1px solid var(--ink-700);

        &:hover {
            background-color: var(--ink-800);
        }
    `,
    danger: css`
        color: var(--ink-950);
        background-color: var(--danger);

        &:hover {
            background-color: #ffb0b0;
        }
    `,
    close: css`
        color: var(--text-muted);
        background-color: var(--ink-800);
        &:hover {
            color: var(--ink-950);
            background-color: var(--danger);
        }
    `,
};

const CircleButton = styled.button<{
    size?: CircleButtonSize;
    variation?: CircleButtonVariation;
}>`
    border: none;
    border-radius: 50%;
    box-shadow: var(--shadow-2);
    transition:
        background-color var(--dur-fast) var(--ease-out),
        color var(--dur-fast) var(--ease-out);

    ${({ size = "medium" }) => sizes[size]}
    ${({ variation = "primary" }) => variations[variation]}
`;

export default CircleButton;
