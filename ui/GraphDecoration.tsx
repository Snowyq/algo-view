import { JSX } from "react";
import styled from "styled-components";
const StyledGraphDecoration = styled.div`
    background-color: yellow;
    width: 100%;
    height: 100%;
`;

function Graph(): JSX.Element {
    return <StyledGraphDecoration>Graph</StyledGraphDecoration>;
}

export default Graph;
