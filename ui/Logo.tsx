import Link from "next/link";
import { JSX } from "react";
import styled from "styled-components";

const LogoLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    font-family: var(--font-display), var(--font-sans), "Open Sans", sans-serif;
    font-weight: 700;
    font-size: 2rem;
    letter-spacing: -0.02em;
`;

function Logo(): JSX.Element {
    return <LogoLink href="/">FunAlgorithms</LogoLink>;
}
export default Logo;
