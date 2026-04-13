import { JSX } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useSelector } from "react-redux";
import styled from "styled-components";
import type { AlgorithmRegistryItem } from "../../algorithms/types";
import type { RootState } from "../../store";
import PlaybackTimeline from "./PlaybackTimeline";
import type { ActiveAlgorithm } from "./playSlice";
import { getActiveAlgorithms } from "./playSlice";

const Controls = styled.div`
    display: flex;
    padding: 0 1rem;
    align-items: center;
    gap: 1rem;
`;

const ControlsButtons = styled.div`
    display: flex;
    gap: 0.2rem;
`;

type PlayWindowControlsProps = {
    registry: AlgorithmRegistryItem;
};

function PlayWindowControls({
    registry,
}: PlayWindowControlsProps): JSX.Element | null {
    const activeAlgorithms = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const algorithm: ActiveAlgorithm | undefined = activeAlgorithms.find(
        (algo) => algo.id === registry.id
    );

    if (!algorithm || !algorithm.stepsLength) return null;
    const maxStep = algorithm.stepsLength - 1;

    return (
        <Controls>
            <PlaybackTimeline max={maxStep} showStep={false} />
            <ControlsButtons>
                <IoIosArrowBack />
                <IoIosArrowForward />
            </ControlsButtons>
        </Controls>
    );
}

export default PlayWindowControls;
