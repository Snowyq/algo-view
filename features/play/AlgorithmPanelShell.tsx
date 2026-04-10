import styled from "styled-components";
import { PLAY_LAYOUT_BREAKPOINT } from "../../constants/breakpoints";

const AlgorithmPanelShell = styled.div`
    --box-shadow-color: ${({ $boxShadowColor }) =>
        $boxShadowColor || "var(--color-grey-300)"};
    --background-color: ${({ $backgroundColor }) =>
        $backgroundColor || "var(--color-grey-200)"};

    position: relative;
    height: 100%;
    width: 100%;
    background-color: var(--color-grey-300);
    /* border: 3px solid var(--color-grey-400); */

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        border: none;
        border-radius: 2.5rem;
        background-color: var(--background-color);
        box-shadow: 0.3rem 0.3rem 0px 3px var(--box-shadow-color);
    }
`;

export default AlgorithmPanelShell;
