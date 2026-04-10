import styled, { css } from "styled-components";

const sizes = {
    small: css`
        font-size: 1.4rem;
        padding: 0.4rem 0.8rem;
        border-radius: 3rem;
        text-transform: uppercase;
        font-weight: 600;
        text-align: center;
    `,
    medium: css`
        font-size: 1.6rem;
        padding: 0.6rem 1.6rem;
        border-radius: 3rem;
        font-weight: 500;
    `,
    large: css`
        font-size: 1.8rem;
        padding: 0.6rem 2.4rem;
        border-radius: 3rem;
        font-weight: 500;
    `,
    xlarge: css`
        font-size: 2rem;
        border-radius: 3rem;
        padding: 0.6rem 2.8rem;
        font-weight: 500;
    `,
};

const shapes = {
    rect: css`
        border-radius: var(--border-radius-sm);
    `,
    circle: css`
        border-radius: 50%;
    `,
};

const variations = {
    primary: css`
        color: var(--color-brand-50);
        background-color: var(--color-brand-600);

        &:hover {
            background-color: var(--color-brand-700);
        }
    `,
    secondary: css`
        color: var(--color-grey-600);
        background: var(--color-grey-0);
        border: 1px solid var(--color-grey-200);

        &:hover {
            background-color: var(--color-grey-50);
        }
    `,
    danger: css`
        color: var(--color-red-100);
        background-color: var(--color-red-700);

        &:hover {
            background-color: var(--color-red-800);
        }
    `,
};

const Button = styled.button`
    border: none;
    box-shadow: var(--shadow-sm);
    width: fit-content;

    ${({ size = "medium" }) => sizes[size]}
    ${({ variation = "primary" }) => variations[variation]} /* ${({
        shape = "rect",
    }) => shapes[shape]} */

	&:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        box-shadow: none;
    }
`;

export default Button;
