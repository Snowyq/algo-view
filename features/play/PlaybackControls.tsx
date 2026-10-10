import { PLAY_LAYOUT_BREAKPOINT } from "@/constants/breakpoints";
import { JSX, memo, useRef } from "react";
import { BsCodeSlash } from "react-icons/bs";
import { RiNumbersLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import useHovered from "../../hooks/useHovered";
import type { AppDispatch, RootState } from "../../store";
import { ToolButton, ToolGroup } from "../../ui/ToolGroup";
import PlaybackSpeed from "./PlaybackSpeed";
import PlaybackTicker from "./PlaybackTicker";
import PlaybackTimeline from "./PlaybackTimeline";
import PlaybackTransport from "./PlaybackTransport";
import type { ActiveAlgorithm } from "./playSlice";
import {
    getActiveAlgorithms,
    getAllCodeVisible,
    getAllMetricsVisible,
    toggleCode,
    toggleMetrics,
} from "./playSlice";
import StepLegendPopover from "./StepLegendPopover";
const Flex = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Group = styled.div`
    display: flex;
    align-items: center;
`;

const Center = styled.div`
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
`;

const Left = styled(Group)`
    justify-self: start;
`;

const Right = styled(Group)`
    justify-self: end;
    gap: var(--space-1);
`;

const StyledPlaybackControls = styled(Flex)`
    position: relative;
    flex-direction: column;
    border-top: 1px solid var(--ink-700);
    background-color: var(--ink-900);
    padding: var(--space-2) var(--space-4) var(--space-3);
    padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom));
    height: fit-content;
    width: 100%;

    touch-action: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        padding: var(--space-3) var(--space-7) var(--space-4);
    }
`;

/* Nothing to play: dim and make inert; the empty canvas explains why. */
const Container = styled(Flex)`
    width: 100%;
    max-width: 1200px;
    height: fit-content;
    gap: 0rem;
    flex-direction: column;
    transition: opacity var(--dur-base) var(--ease-out);

    &[inert] {
        opacity: 0.35;
    }
`;

const Controls = styled.div`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    min-height: 5rem;
    padding: var(--space-1) 0 0;
    height: fit-content;
    justify-content: space-between;
    position: relative;
`;

const Bar = styled(Flex)`
    width: 100%;
    height: 100%;
`;

function PlaybackControls(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const ref = useRef<HTMLDivElement | null>(null);
    const { isHovered } = useHovered(ref);
    const activeAlgorithms = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const isActive: boolean = activeAlgorithms.length > 0;
    const allCodeVisible = useSelector<RootState, boolean>(getAllCodeVisible);
    const allMetricsVisible = useSelector<RootState, boolean>(
        getAllMetricsVisible
    );

    return (
        <StyledPlaybackControls ref={ref}>
            <Container inert={!isActive}>
                <Bar>
                    <PlaybackTimeline showHint={isHovered} />
                </Bar>
                <Controls>
                    <Left>
                        <PlaybackSpeed />
                    </Left>
                    <Center>
                        <PlaybackTransport />
                    </Center>
                    <Right>
                        <ToolGroup aria-label="View options">
                            <ToolButton
                                type="button"
                                onClick={() => dispatch(toggleCode())}
                                aria-pressed={allCodeVisible}
                                aria-label="Code in all panels"
                                title="Code in all panels"
                            >
                                <BsCodeSlash />
                            </ToolButton>
                            <ToolButton
                                type="button"
                                onClick={() => dispatch(toggleMetrics())}
                                aria-pressed={allMetricsVisible}
                                aria-label="Step metrics"
                                title="Step metrics"
                            >
                                <RiNumbersLine />
                            </ToolButton>
                            <StepLegendPopover />
                        </ToolGroup>
                    </Right>
                </Controls>
            </Container>

            <PlaybackTicker />
        </StyledPlaybackControls>
    );
}

export default memo(PlaybackControls);
