import styled from "styled-components";

const Input = styled.input`
    appearance: none;
    -webkit-appearance: none;
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0 1rem;
    border: 1px solid var(--ink-700);
    border-radius: var(--radius-sm);
    background-color: var(--ink-950);
    color: var(--text);
    font-family: var(--font-mono-stack);
    font-size: var(--text-sm);
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
    transition: border-color var(--dur-fast) var(--ease-out);

    @media (hover: hover) {
        &:hover:not(:disabled) {
            border-color: var(--ink-600);
        }
    }

    &:focus-visible {
        border-color: var(--swap);
        outline: 2px solid rgba(var(--swap-rgb), 0.35);
        outline-offset: 0;
    }
`;

export default Input;
