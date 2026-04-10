import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useSelector } from "react-redux";
import styled from "styled-components";
import PlaybackTimeline from "./PlaybackTimeline";
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

function PlayWindowControls({ registry }) {
    const activeAlgorithms = useSelector(getActiveAlgorithms);
    const algorithm = activeAlgorithms.find((algo) => algo.id === registry.id);

    if (!algorithm || !algorithm.stepsLength) return <></>;
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
