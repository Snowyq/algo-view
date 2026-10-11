import styled, { css } from "styled-components";
type ButtonIconVariation = "default" | "alert";

const variations: Record<ButtonIconVariation, ReturnType<typeof css>> = {
    default: css`
        --color: var(--text-muted);
        --background: transparent;
        --hover-background: var(--ink-800);
        --hover-color: var(--text);
    `,
    alert: css`
        --color: var(--danger);
        --background: transparent;
        --hover-background: var(--color-red-100);
        --hover-color: var(--danger);
    `,
};

const ButtonIcon = styled.button<{
    size?: string;
    padding?: string;
    border?: string;
    $borderRadius?: string;
    variation?: ButtonIconVariation;
    background?: string;
}>`
    --size: ${({ size = "2rem" }) => size};
    --padding: ${({ padding = "0.8rem" }) => padding};
    --border: ${({ border = "none" }) => border};
    --border-radius: ${({ $borderRadius = "var(--radius-sm)" }) =>
        $borderRadius};

    ${({ variation = "default" }) => variations[variation]};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: var(--border);
    padding: var(--padding);
    border-radius: var(--border-radius);
    background-color: ${({ background }) => background || "var(--background)"};
    transition:
        background-color var(--dur-fast) var(--ease-out),
        transform var(--dur-fast) var(--ease-out);

    & svg {
        width: var(--size);
        height: var(--size);
        color: var(--color);
        transition: color var(--dur-fast) var(--ease-out);
    }

    @media (hover: hover) and (pointer: fine) {
        &:hover {
            background-color: var(--hover-background);
            svg {
                color: var(--hover-color);
            }
        }
    }

    &:active {
        transform: scale(0.94);
    }

    @media (prefers-reduced-motion: reduce) {
        &:active {
            transform: none;
        }
    }
`;

export default ButtonIcon;
