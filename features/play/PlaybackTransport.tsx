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
    align-items: center;
    gap: var(--space-1);

    @media (min-width: 480px) {
        gap: var(--space-2);
    }

    @media (max-width: 479px) {
        button {
            --padding: 0.9rem;
        }
    }
`;

/* ±10 jumps are a power-user shortcut; the timeline covers them on phones. */
const Jump = styled.span`
    display: contents;

    @media (max-width: 479px) {
        display: none;
    }
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
            <Jump>
                <ControlIconButton
                    icon={<TbRewindBackward10 />}
                    label="Back 10 steps"
                    onClick={() => backward(10)}
                />
            </Jump>
            <ControlIconButton
                icon={<FaBackward />}
                label="Back 1 step"
                onClick={() => backward(1)}
            />
            <PlayStopButton
                onStart={start}
                onStop={stop}
                isStopped={animationStatus === "stopped"}
            />
            <ControlIconButton
                icon={<FaForward />}
                label="Forward 1 step"
                onClick={() => forward(1)}
            />
            <Jump>
                <ControlIconButton
                    icon={<TbRewindForward10 />}
                    label="Forward 10 steps"
                    onClick={() => forward(10)}
                />
            </Jump>
        </Container>
    );
}

export default memo(PlaybackTransport);
