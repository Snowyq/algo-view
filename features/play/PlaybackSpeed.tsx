import type { Key, ReactNode } from "react";
import { JSX, memo, useCallback, useState } from "react";
import { BsExclamationTriangle, BsSpeedometer2 } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import type { AppDispatch, RootState } from "../../store";
import Selector from "../../ui/Selector";
import {
    changeSpeed,
    freezeAnimation,
    getAnimationStatus,
    getCurrentSpeed,
    getSpeeds,
    startAnimation,
} from "./playSlice";

const Option = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
    min-width: 9rem;
    padding: 0.8rem 1.2rem;
    border-radius: var(--radius-xs);
    font-family: var(--font-mono-stack);
    font-size: var(--text-sm);
    font-variant-numeric: tabular-nums;
    color: var(--text-soft);
    cursor: pointer;

    &:hover {
        color: var(--text);
        background-color: var(--ink-800);
    }
`;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0.4rem;
    border: 1px solid var(--ink-700);
    border-radius: var(--radius-md);
    background-color: var(--ink-850);
    box-shadow: var(--shadow-2);
    overflow: hidden;
`;

const StyledPlaybackSpeed = styled.div`
    position: relative;
    height: 100%;
`;

const SpeedButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    height: 4.2rem;
    padding: 0 1.2rem;
    border: 1px solid var(--ink-700);
    border-radius: var(--radius-sm);
    background-color: transparent;
    color: var(--text-soft);
    transition:
        border-color var(--dur-fast) var(--ease-out),
        color var(--dur-fast) var(--ease-out);

    @media (hover: hover) {
        &:hover {
            border-color: var(--ink-600);
            color: var(--text);
        }
    }
`;

const SpeedButtonValue = styled.span<{ $isWarning: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-family: var(--font-mono-stack);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: ${({ $isWarning }) => ($isWarning ? "var(--danger)" : "inherit")};
`;

const WarningIcon = styled(BsExclamationTriangle)`
    color: var(--danger);
    font-size: 1.1rem;
    flex: 0 0 auto;
`;

const WarningText = styled.span`
    color: var(--danger);
    font-size: var(--text-xs);
    line-height: 1.1;
`;

const WarningRow = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
`;

const Icon = styled.span`
    display: inline-flex;
    font-size: 1.6rem;
`;

const SelectorContainer = styled.div<{ state: "hidden" | "visible" }>`
    display: ${({ state }) => (state === "hidden" ? "none" : "block")};
    position: absolute;
    z-index: 2000;
    bottom: 0;
    right: -0.8rem;
    translate: 100% 0%;

    /* Grows out of the speed button (its left edge). */
    & > * {
        transform-origin: 0 100%;
        animation: speed-in 180ms var(--ease-out);
    }

    @keyframes speed-in {
        from {
            opacity: 0;
            transform: translateX(-4px) scale(0.97);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        & > * {
            animation-name: speed-fade;
        }

        @keyframes speed-fade {
            from {
                opacity: 0;
            }
        }
    }
`;

type AnimationStatus = "stopped" | "playing" | "freezed";

function PlaybackSpeed(): JSX.Element {
    const [isHidden, setIsHidden] = useState<boolean>(true);
    const dispatch = useDispatch<AppDispatch>();
    const speeds = useSelector<RootState, number[]>(getSpeeds);
    const speed = useSelector<RootState, number>(getCurrentSpeed);
    const animationStatus = useSelector<RootState, AnimationStatus>(
        getAnimationStatus
    );

    const handleOnChange = (option: Key): void => {
        if (typeof option !== "number") return;
        dispatch(changeSpeed(option));
        setIsHidden(true);
        if (animationStatus === "freezed") {
            dispatch(startAnimation());
        }
    };

    const handleClick = (): void => {
        if (animationStatus === "playing") {
            dispatch(freezeAnimation());
        } else if (animationStatus === "freezed") {
            dispatch(startAnimation());
        }
        setIsHidden((isHid) => {
            return !isHid;
        });
    };

    const displaySeconds = (ms: number): string => {
        const sec = ms / 1000;
        const value = ms % 1000 === 0 ? sec : sec.toFixed(1);
        return value + "s";
    };

    const display = useCallback((timeMs: number): string => {
        return timeMs >= 100 ? displaySeconds(timeMs) : timeMs + "ms";
    }, []);

    const isUnstableSpeed = (timeMs: number): boolean =>
        timeMs === 1 || timeMs === 5;

    const renderOptions = (option: Key): ReactNode => {
        if (typeof option !== "number") return null;
        return (
            <Option>
                <span>{display(option)}</span>
                {isUnstableSpeed(option) && (
                    <WarningRow>
                        <WarningIcon aria-hidden="true" />
                        <WarningText>unstable</WarningText>
                    </WarningRow>
                )}
            </Option>
        );
    };

    return (
        <StyledPlaybackSpeed>
            <SpeedButton
                onClick={handleClick}
                aria-label={`Playback speed ${display(speed)}`}
                aria-expanded={!isHidden}
            >
                <Icon aria-hidden="true">
                    <BsSpeedometer2 />
                </Icon>
                <SpeedButtonValue $isWarning={isUnstableSpeed(speed)}>
                    {display(speed)}
                </SpeedButtonValue>
            </SpeedButton>
            <SelectorContainer state={isHidden ? "hidden" : "visible"}>
                {!isHidden && (
                    <Selector
                        Wrapper={(props) => <Wrapper {...props} />}
                        onChange={handleOnChange}
                        options={speeds}
                        render={renderOptions}
                    />
                )}
            </SelectorContainer>
        </StyledPlaybackSpeed>
    );
}

export default memo(PlaybackSpeed);
