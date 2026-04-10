import { useSelector } from "react-redux";
import styled from "styled-components";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import { PLAY_LAYOUT_BREAKPOINT } from "../../constants/breakpoints";
import useWindowSize from "../../hooks/useWindowSize";
import AlgorithmPanel from "./AlgorithmPanel";
import { getActiveAlgorithms, getActiveCategory } from "./playSlice";

const StyledPlayViewArea = styled.div`
    height: 100%;
    width: 100%;
    background-color: var(--color-grey-400);
    position: relative;

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        --dot-bg: var(--color-grey-100);
        --dot-color: var(--color-grey-300);
        --dot-size: 2px;
        --dot-space: 0.5rem;

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
    }
`;

const Grid = styled.div`
    display: grid;
    gap: 0.5rem;
    grid-template-columns: 1fr;

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        gap: 2rem;
        padding: 5rem;
    }
    height: 100%;
    width: 100%;

    &.grid-two-columns {
        @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
            grid-template-columns: repeat(2, 1fr);
        }
    }
`;

function AlgorithmGrid() {
    const activeAlgorithms = useSelector(getActiveAlgorithms);
    const activeCategory = useSelector(getActiveCategory);
    const { size } = useWindowSize();
    const breakpointValue = Number.parseInt(PLAY_LAYOUT_BREAKPOINT, 10);
    const isMobile =
        Number.isFinite(breakpointValue) && size.width < breakpointValue;
    const visibleAlgorithms = isMobile
        ? activeAlgorithms.slice(0, 3)
        : activeAlgorithms;
    const isTwoColumns = visibleAlgorithms.length > 2;

    return (
        <StyledPlayViewArea>
            <Grid className={isTwoColumns ? "grid-two-columns" : ""}>
                {visibleAlgorithms.map((algo) => {
                    const registry = registryApi.getAlgorithmRegistry(
                        activeCategory,
                        algo.id
                    );
                    if (!registry) return <></>;
                    return (
                        <AlgorithmPanel
                            key={algo.id}
                            registry={registry}
                            category={activeCategory}
                        />
                    );
                })}
            </Grid>
        </StyledPlayViewArea>
    );
}

export default AlgorithmGrid;
