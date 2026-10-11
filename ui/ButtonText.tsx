import styled from "styled-components";
const ButtonText = styled.button`
    color: var(--swap);
    font-weight: 600;
    text-align: center;
    background: none;
    border: none;
    border-radius: var(--radius-xs);
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 0.3em;
    transition:
        color var(--dur-fast) var(--ease-out),
        text-decoration-color var(--dur-fast) var(--ease-out);

    &:hover,
    &:active {
        color: var(--swap-strong);
        text-decoration-color: currentColor;
    }
`;

export default ButtonText;
