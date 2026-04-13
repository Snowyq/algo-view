import { JSX, memo, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import useRateLimit from "../../hooks/useRateLimit";
import type { AppDispatch, RootState } from "../../store";
import AnimatedText from "../../ui/AnimatedText";
import type { ActiveAlgorithm } from "./playSlice";
import {
    changeStep,
    freezeAnimation,
    getActiveAlgorithms,
    getAnimationStatus,
    getMaxStep,
    getStep,
    startAnimation,
} from "./playSlice";
import TimelineSlider, { type TimelinePoint } from "./TimelineSlider";

const Flex = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Progress = styled.span<{ state: "visible" | "hidden" }>`
    font-size: 1.4rem;
    align-self: flex-start;
    visibility: ${({ state }) => state};
`;

const ProgressBar = styled(Flex)`
    width: 100%;
    gap: 0.2rem;
    flex-direction: column;
`;

const PointHint = styled.div`
    z-index: -1;
    translate: 0 -100%;
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.1s;
`;

const PointHintLabel = styled.span`
    display: block;
    transform-origin: 0 50%;
    rotate: 300deg;
    pointer-events: none;
`;

const Container = styled.div`
    width: calc(100%);
    padding: 1rem 0;
`;

const MemoSlider = memo(TimelineSlider);

type PlaybackTimelineProps = {
    max?: number;
    showStep?: boolean;
    showHint?: boolean;
};

function PlaybackTimeline({
    max = undefined,
    showStep = true,
    showHint = false,
}: PlaybackTimelineProps): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const { value: step } = useSelector<RootState, { value: number }>(getStep);
    const globalMaxStep = useSelector<RootState, number>(getMaxStep);
    const animationStatus = useSelector<RootState, string>(getAnimationStatus);
    const activeAlgorithms = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );

    const maxStep: number = max || globalMaxStep;

    const points = useMemo<TimelinePoint[]>(() => {
        return activeAlgorithms.flatMap((algo: ActiveAlgorithm) => {
            const { stepsLength, info } = algo;
            if (!stepsLength) return [];
            return [
                {
                    value: stepsLength - 1,
                    Component: (
                        <PointHint>
                            <PointHintLabel>
                                <AnimatedText show={showHint}>
                                    {info.name}
                                </AnimatedText>
                            </PointHintLabel>
                        </PointHint>
                    ),
                },
            ];
        });
    }, [activeAlgorithms, showHint]);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = (value: number): void => {
        console.log("mouseChange");
        if (animationStatus === "playing") {
            dispatch(freezeAnimation());
        }
        dispatch(changeStep({ value }));
    };

    const limitedChange = useRateLimit(handleChange, 16);

    const handleMouseUp = (): void => {
        console.log("mouseUp", animationStatus);
        if (animationStatus === "freezed") {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(
                () => dispatch(startAnimation()),
                50
            );
        }
    };

    return (
        <ProgressBar>
            {showStep && (
                <Progress
                    state={maxStep > 0 ? "visible" : "hidden"}
                >{`${step}/${maxStep}`}</Progress>
            )}
            <Container>
                <MemoSlider
                    onChange={limitedChange}
                    onMouseUp={handleMouseUp}
                    value={step}
                    min={0}
                    max={maxStep}
                    points={points}
                />
            </Container>
        </ProgressBar>
    );
}

export default PlaybackTimeline;
