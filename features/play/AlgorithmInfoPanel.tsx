import { JSX } from "react";
import styled from "styled-components";
const StyledAlgorithmInfoPanel = styled.div`
    --sidebar-border-width: 3px;
    position: relative;
    transition: width 0.3s;
    height: 100%;
    background-color: var(--color-grey-100);
    border-right: var(--sidebar-border-width) solid var(--color-grey-300);

    width: 25rem;
    width: 35rem;
`;

function AlgorithmInfoPanel(): JSX.Element {
    return <StyledAlgorithmInfoPanel></StyledAlgorithmInfoPanel>;
}

export default AlgorithmInfoPanel;
