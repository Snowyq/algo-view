import { JSX, memo, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import styled, { keyframes } from "styled-components";
import type { AppDispatch, RootState } from "../../../../store";
import {
    changeStep,
    decreaseStep,
    getAnimationStatus,
    getMaxStep,
    increaseStep,
    startAnimation,
    stopAnimation,
} from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import { TINY } from "../media";
import PixelIcon from "../primitives/PixelIcon";
import PixelTooltip from "../primitives/PixelTooltip";
import type { IconName } from "../primitives/icons";

const Row = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

/* Two frames of after-image trailing the arrow, like a fast sprite. */
const smearFwd = keyframes`
    0% { filter: drop-shadow(-4px 0 0 rgba(232, 130, 92, 0.7)) drop-shadow(-8px 0 0 rgba(232, 130, 92, 0.35)); }
    100% { filter: none; }
`;
const smearBack = keyframes`
    0% { filter: drop-shadow(4px 0 0 rgba(232, 130, 92, 0.7)) drop-shadow(8px 0 0 rgba(232, 130, 92, 0.35)); }
    100% { filter: none; }
`;

const StepButton = styled(PixelButton)`
    &[data-smear="fwd"] svg {
        animation: ${smearFwd} 160ms steps(2) both;
    }
    &[data-smear="back"] svg {
        animation: ${smearBack} 160ms steps(2) both;
    }

    @media (max-width: 479px) {
        &[data-optional] {
            display: none;
        }
    }
`;

const PlayButton = styled(PixelButton)`
    width: 7.2rem;
    margin: var(--b) 0.6rem;

    @media ${TINY} {
        width: 5.6rem;
        margin: var(--b) 0.2rem;
    }
`;

/* play → half → pause, one frame each: the icon rebuilds pixel by pixel. */
function MorphIcon({ playing }: { playing: boolean }): JSX.Element {
    const [shown, setShown] = useState<IconName>(playing ? "pause" : "play");
    const first = useRef<boolean>(true);

    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        const target: IconName = playing ? "pause" : "play";
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShown("playPause");
        const id = setTimeout(() => setShown(target), 70);
        return () => clearTimeout(id);
    }, [playing]);

    return <PixelIcon name={shown} scale={3} />;
}

type JumpProps = {
    icon: IconName;
    label: string;
    direction: "fwd" | "back";
    onPress: () => void;
    disabled: boolean;
    optional?: boolean;
};

function Jump({
    icon,
    label,
    direction,
    onPress,
    disabled,
    optional,
}: JumpProps): JSX.Element {
    const [smear, setSmear] = useState<boolean>(false);
    const handle = (): void => {
        onPress();
        setSmear(false);
        requestAnimationFrame(() => setSmear(true));
    };
    return (
        <PixelTooltip label={label}>
            <StepButton
                type="button"
                $square
                $variant="ghost"
                aria-label={label}
                onClick={handle}
                disabled={disabled}
                data-smear={smear ? direction : undefined}
                data-optional={optional || undefined}
                onAnimationEnd={() => setSmear(false)}
            >
                <PixelIcon name={icon} scale={2} />
            </StepButton>
        </PixelTooltip>
    );
}

function Transport(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();
    const status = useSelector<RootState, string>(getAnimationStatus);
    const maxStep = useSelector<RootState, number>(getMaxStep);
    const playing = status === "playing";
    // Boolean, so the button re-renders only when it flips, not per step.
    const atEnd = useSelector<RootState, boolean>(
        (state) =>
            state.play.animation.maxStep > 0 &&
            state.play.animation.step.value >= state.play.animation.maxStep
    );
    const empty = maxStep <= 0;

    const toggle = (): void => {
        if (playing) {
            dispatch(stopAnimation());
            return;
        }
        // At the end, play means replay.
        const { step } = store.getState().play.animation;
        if (step.value >= maxStep) dispatch(changeStep({ value: 0 }));
        dispatch(startAnimation());
    };

    return (
        <Row role="group" aria-label="Playback">
            <Jump
                icon="toStart"
                label="To start"
                direction="back"
                optional
                disabled={empty}
                onPress={() => dispatch(changeStep({ value: 0 }))}
            />
            <Jump
                icon="jumpBack"
                label="Back 10"
                direction="back"
                optional
                disabled={empty}
                onPress={() => dispatch(decreaseStep({ value: 10 }))}
            />
            <Jump
                icon="stepBack"
                label="Back 1"
                direction="back"
                disabled={empty}
                onPress={() => dispatch(decreaseStep({ value: 1 }))}
            />
            <PixelTooltip
                label={
                    playing
                        ? "Pause · space"
                        : atEnd
                          ? "Replay from the start · space"
                          : "Play · space"
                }
            >
                <PlayButton
                    type="button"
                    $variant="primary"
                    $size="lg"
                    onClick={toggle}
                    disabled={empty}
                    aria-label={playing ? "Pause" : atEnd ? "Replay" : "Play"}
                >
                    {atEnd && !playing ? (
                        <PixelIcon name="replay" scale={3} />
                    ) : (
                        <MorphIcon playing={playing} />
                    )}
                </PlayButton>
            </PixelTooltip>
            <Jump
                icon="stepFwd"
                label="Forward 1"
                direction="fwd"
                disabled={empty}
                onPress={() => dispatch(increaseStep({ value: 1 }))}
            />
            <Jump
                icon="jumpFwd"
                label="Forward 10"
                direction="fwd"
                optional
                disabled={empty}
                onPress={() => dispatch(increaseStep({ value: 10 }))}
            />
            <Jump
                icon="toEnd"
                label="To end"
                direction="fwd"
                optional
                disabled={empty}
                onPress={() => dispatch(changeStep({ value: maxStep }))}
            />
        </Row>
    );
}

export default memo(Transport);
