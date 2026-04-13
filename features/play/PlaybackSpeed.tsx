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
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;

    &:hover {
        background-color: var(--color-grey-100);
    }
`;

const Wrapper = styled.div`
    background-color: var(--color-grey-50);
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 0 15px 0px var(--color-grey-400);
`;

const StyledPlaybackSpeed = styled.div`
    position: relative;
    height: 100%;
`;

const SpeedButton = styled.button`
    display: flex;
    flex-direction: column;
    padding: 0.2rem;
    align-items: center;
    justify-content: center;
    height: auto;
    width: 3.5rem;
    background-color: var(--color-grey-100);
    border-radius: 5px;
    border: none;
`;

const SpeedButtonValue = styled.span<{ $isWarning: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    width: auto;
    line-height: 1.2rem;
    font-size: 1.2rem;
    border-radius: 2.5px;
    color: ${({ $isWarning }) =>
        $isWarning ? "var(--color-red-600)" : "inherit"};

    height: fit-content;
`;

const WarningIcon = styled(BsExclamationTriangle)`
    color: var(--color-red-600);
    font-size: 1.1rem;
    flex: 0 0 auto;
`;

const WarningText = styled.span`
    color: var(--color-red-600);
    font-size: 1.1rem;
    line-height: 1.1;
`;

const WarningRow = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
`;

const Icon = styled.span`
    font-size: 2rem;
`;

const SelectorContainer = styled.div<{ state: "hidden" | "visible" }>`
    display: ${({ state }) => (state === "hidden" ? "none" : "block")};
    position: absolute;
    z-index: 2000;

    bottom: 0;
    right: -0.5rem;
    translate: 100% 0%;
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
            <SpeedButton onClick={handleClick}>
                <Icon>
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
