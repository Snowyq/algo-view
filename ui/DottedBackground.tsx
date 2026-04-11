import styled from "styled-components";

export const DottedBackground = styled.div`
    --dot-bg: ${({ bg }) => bg || "white"};
    --dot-color: ${({ color }) => color || "black"};
    --dot-size: ${({ size }) => size || "1px"};
    --dot-space: ${({ space }) => space || "2.5rem"};
    background:
        linear-gradient(
                90deg,
                var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
                transparent 1%
            )
            center / var(--dot-space) var(--dot-space),
        linear-gradient(
                var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
                transparent 1%
            )
            center / var(--dot-space) var(--dot-space),
        var(--dot-color);

    height: 100%;
    width: 100%;
    position: absolute;
    display: none;

    @media screen and (min-width: 640px) {
        display: block;
    }

    left: 0;
    top: 0;
`;
