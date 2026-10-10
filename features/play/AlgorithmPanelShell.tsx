import styled from "styled-components";
import { PLAY_LAYOUT_BREAKPOINT } from "../../constants/breakpoints";
const AlgorithmPanelShell = styled.div<{
    $boxShadowColor?: string;
    $backgroundColor?: string;
    /** The panel the sidebar's Code/Info tab is following. */
    $observed?: boolean;
}>`
    --border-color: ${({ $boxShadowColor, $observed }) =>
        $observed ? "var(--swap)" : $boxShadowColor || "var(--ink-700)"};
    --background-color: ${({ $backgroundColor }) =>
        $backgroundColor || "var(--ink-900)"};

    position: relative;
    height: 100%;
    width: 100%;
    min-height: 0;
    background-color: var(--background-color);
    border-bottom: 1px solid var(--border-color);
    /* Second pixel of the outline drawn inside, so layout never shifts. */
    box-shadow: ${({ $observed }) =>
        $observed ? "inset 0 0 0 1px var(--swap)" : "none"};
    cursor: pointer;
    transition:
        border-color var(--dur-fast) var(--ease-out),
        box-shadow var(--dur-fast) var(--ease-out);

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
    }

    @media (hover: hover) {
        &:hover {
            --border-color: ${({ $observed }) =>
                $observed ? "var(--swap)" : "var(--ink-600)"};
        }
    }
`;

export default AlgorithmPanelShell;
