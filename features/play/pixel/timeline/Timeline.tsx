import { JSX } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import type { RootState } from "../../../../store";
import PlaybackTicker from "../../PlaybackTicker";
import { getMaxStep } from "../../playSlice";
import { labelText } from "../primitives/pixel";
import BlockProgress from "./BlockProgress";
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

    @media (max-width: 640px) {
        padding: 0.4rem 1.2rem 1rem;
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
`;

const Hint = styled.p`
    ${labelText};
    font-size: 1rem;
    color: var(--fg-4);

    kbd {
        display: inline-block;
        padding: 0.2rem 0.4rem;
        margin: 0 0.2rem;
        background-color: var(--surface-2);
        color: var(--fg-3);
        font-family: inherit;
    }
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem;
`;

function Timeline(): JSX.Element {
    const maxStep = useSelector<RootState, number>(getMaxStep);
    return (
        <Dock aria-label="Timeline" data-dock>
            <PlaybackTicker />
            <BlockProgress>
                <TimelineRunner />
            </BlockProgress>
            <Controls>
                <Hint>
                    {maxStep > 0 ? (
                        <>
                            <kbd>space</kbd> play <kbd>←</kbd>
                            <kbd>→</kbd> step <kbd>?</kbd> keys
                        </>
                    ) : (
                        "Add an algorithm to start"
                    )}
                </Hint>
                <Transport />
                <Right>
                    <LegendMenu />
                    <SpeedMenu />
                </Right>
            </Controls>
        </Dock>
    );
}

export default Timeline;
