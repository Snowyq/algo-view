import { JSX } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import styled from "styled-components";
const Container = styled.div<{ size?: string }>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    font-size: ${({ size }) => size || "2rem"};
    color: var(--swap);
    animation: spin 1.2s linear infinite;

    /* Progress feedback is essential motion: keep it under reduced motion. */
    @media (prefers-reduced-motion: reduce) {
        animation-duration: 1.2s !important;
        animation-iteration-count: infinite !important;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }
`;

type LoaderProps = {
    size?: string;
};

function Loader({ size = "2rem" }: LoaderProps): JSX.Element {
    return (
        <Container size={size}>
            <LuLoaderCircle />
        </Container>
    );
}

export default Loader;
