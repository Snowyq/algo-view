import { JSX } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { PLAY_LAYOUT_BREAKPOINT } from "../../../../constants/breakpoints";
import type { RootState } from "../../../../store";
import { getMaxStep } from "../../playSlice";
import { NARROW, SHORT, TINY } from "../media";
import PlaybackTicker from "../../PlaybackTicker";
import BlockProgress from "./BlockProgress";
import Legend from "./Legend";
import StepCounter from "./StepCounter";
import LegendMenu from "./LegendMenu";
import SpeedMenu from "./SpeedMenu";
import TimelineRunner from "./TimelineRunner";
import Transport from "./Transport";

const Dock = styled.section`
    position: relative;
    z-index: 30;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.4rem;
    padding: 0.4rem 2.4rem 1.2rem;
    background-color: var(--bg-2);
    border-top: var(--b) solid var(--line);

    @media ${NARROW} {
        padding: 0.4rem 1.2rem 1rem;
    }
    @media ${SHORT} {
        gap: 0;
        padding: 0 1.6rem 0.6rem;
    }

    /* Nothing to play: no disabled transport, no 0 / 0 counter; the empty
       stage's "Try…" button is the one thing to do. */
    &[data-empty="true"] {
        display: none;
    }
`;

const Controls = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 1.2rem;

    @media (max-width: 760px) {
        grid-template-columns: auto 1fr;

        & > :first-child {
            display: none;
        }
    }
    @media ${TINY} {
        gap: 0.4rem;
    }
`;

/* Inline legend where it fits on one or two lines; a button elsewhere. */
const LegendCell = styled.div`
    min-width: 0;

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        & > * {
            display: none;
        }
    }
`;

const NarrowOnly = styled.span`
    display: none;

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        display: contents;
    }
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem;
`;

function Timeline(): JSX.Element {
    const empty = useSelector<RootState, number>(getMaxStep) <= 0;
    return (
        <Dock aria-label="Timeline" data-dock data-empty={empty}>
            <PlaybackTicker />
            <BlockProgress lead={<StepCounter />}>
                <TimelineRunner />
            </BlockProgress>
            <Controls>
                <LegendCell>
                    <Legend />
                </LegendCell>
                <Transport />
                <Right>
                    <NarrowOnly>
                        <LegendMenu />
                    </NarrowOnly>
                    <SpeedMenu />
                </Right>
            </Controls>
        </Dock>
    );
}

export default Timeline;
