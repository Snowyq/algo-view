import Link from "next/link";
import { JSX } from "react";
import styled from "styled-components";

const LogoLink = styled(Link)`
    text-decoration: none;
    color: inherit;
`;

function Logo(): JSX.Element {
    return <LogoLink href="/">FunAlgorithms</LogoLink>;
}
export default Logo;
