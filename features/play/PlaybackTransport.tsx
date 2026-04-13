import { JSX, memo, useCallback } from "react";
import { FaBackward, FaForward } from "react-icons/fa6";
import { TbRewindBackward10, TbRewindForward10 } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import type { AppDispatch, RootState } from "../../store";
import PlayStopButton from "../../ui/PlayStopButton";
import ControlIconButton from "./ControlIconButton";
import {
    decreaseStep,
    getAnimationStatus,
    increaseStep,
    startAnimation,
    stopAnimation,
} from "./playSlice";

const Container = styled.div`
    display: flex;
    gap: 0.5rem;
`;

function PlaybackTransport(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();

    const forward = useCallback(
        (steps: number) => dispatch(increaseStep({ value: steps })),
        [dispatch]
    );
    const backward = useCallback(
        (steps: number) => dispatch(decreaseStep({ value: steps })),
        [dispatch]
    );

    const start = (): void => {
        dispatch(startAnimation());
    };
    const stop = (): void => {
        dispatch(stopAnimation());
    };
    const animationStatus = useSelector<RootState, string>(getAnimationStatus);

    return (
        <Container>
            <ControlIconButton
                icon={<TbRewindBackward10 />}
                onClick={() => backward(10)}
            />
            <ControlIconButton
                icon={<FaBackward />}
                onClick={() => backward(1)}
            />
            <PlayStopButton
                onStart={start}
                onStop={stop}
                isStopped={animationStatus === "stopped"}
            />
            <ControlIconButton
                icon={<FaForward />}
                onClick={() => forward(1)}
            />
            <ControlIconButton
                icon={<TbRewindForward10 />}
                onClick={() => forward(10)}
            />
        </Container>
    );
}

export default memo(PlaybackTransport);
