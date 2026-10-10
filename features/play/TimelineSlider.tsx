import type { ComponentType, ReactNode } from "react";
import { JSX, memo, useMemo } from "react";
import styled from "styled-components";
import Slider from "../../ui/Slider";

const Flex = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const SliderContainer = styled(Flex)`
    width: 100%;
    height: 4px;
    background-color: var(--ink-700);
    border-radius: var(--radius-pill);

    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;

    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
`;
const SliderOutput = styled.div`
    position: relative;
    width: 100%;
    height: 2.8rem;

    @media screen and (min-width: 640px) {
        height: 1.6rem;
    }
`;

const Dot = styled.div`
    position: absolute;
    top: 50%;
    height: 1.4rem;
    aspect-ratio: 1/1;
    translate: -50% -50%;
    border-radius: 50%;
    background-color: var(--text);
    box-shadow:
        0 0 0 4px var(--ink-900),
        var(--shadow-1);
    transition: scale var(--dur-fast) var(--ease-out);

    /* Grab affordance: the thumb grows when the track is under the pointer. */
    @media (hover: hover) {
        ${SliderOutput}:hover & {
            scale: 1.25;
        }
    }
`;

const Tooltip = styled.div`
    position: absolute;
    translate: -50% calc(-100% - 0.8rem);
    padding: 0.3rem 0.6rem;
    border-radius: var(--radius-xs);
    background-color: var(--ink-800);
    color: var(--text);
    font-family: var(--font-mono-stack);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    pointer-events: none;
`;

const Fill = styled.div`
    width: 100%;
    height: 4px;
    position: absolute;
    top: 50%;
    translate: 0 -50%;
    background-color: var(--swap);
    border-radius: var(--radius-pill);
`;

const Hover = styled.div`
    width: 2px;
    height: 100%;
    background-color: var(--text-muted);
    border-radius: 2px;
`;

const Point = styled.div<{ left: string }>`
    position: absolute;
    top: 50%;
    left: ${({ left }) => left};
    translate: -50% -50%;
    height: 1.2rem;
    width: 2px;
    border-radius: 2px;
    background-color: var(--finish);
    pointer-events: none;
    display: none;

    @media screen and (min-width: 640px) {
        display: block;
    }
`;

const PointContent = styled.div`
    position: absolute;
    translate: 0 0;
    pointer-events: none;
`;

export type TimelinePoint = {
    value?: number;
    progress?: number;
    Component?: ReactNode;
};

type TimelineSliderProps = {
    max: number;
    min: number;
    value: number;
    onChange?: (value: number) => void;
    onMouseUp?: () => void;
    DotComponent?: ComponentType | null;
    points?: TimelinePoint[];
};

const MemoMain = memo(Main);

function TimelineSlider({
    max,
    min,
    onChange,
    value,
    onMouseUp,
    DotComponent = null,
    points = [],
}: TimelineSliderProps): JSX.Element {
    return (
        <SliderContainer>
            <SliderOutput>
                <MemoMain
                    max={max}
                    min={min}
                    value={value}
                    onChange={onChange}
                    onMouseUp={onMouseUp}
                    DotComponent={DotComponent}
                />
                <Points points={points} max={max} min={min} />
            </SliderOutput>
        </SliderContainer>
    );
}

type MainProps = {
    max: number;
    min: number;
    value: number;
    onChange?: (value: number) => void;
    onMouseUp?: () => void;
    DotComponent?: ComponentType | null;
};

function Main({
    max,
    min,
    value,
    onChange,
    onMouseUp,
    DotComponent,
}: MainProps): JSX.Element {
    return (
        <>
            <Slider
                maxValue={max}
                minValue={min}
                value={value}
                onChange={onChange}
                onMouseUp={onMouseUp}
            >
                <Slider.Dot>
                    {DotComponent ? <DotComponent /> : <Dot />}
                </Slider.Dot>
                <Slider.Tooltip>
                    <Tooltip />
                </Slider.Tooltip>
                <Slider.ProgressFill>
                    <Fill />
                </Slider.ProgressFill>
                <Slider.HoverDot>
                    <Hover />
                </Slider.HoverDot>
            </Slider>
        </>
    );
}

type PointsProps = {
    points: TimelinePoint[];
    min: number;
    max: number;
};

function Points({ points, min, max }: PointsProps): JSX.Element {
    const pointComponents = useMemo<ReactNode[]>(() => {
        if (max <= min) return [];
        return points.map((point, index) => {
            if (!point) return null;
            const { value, Component, progress } = point;

            let left = 0;
            if (progress != null) {
                left = progress;
            } else if (value != null) {
                left = (value - min) / max;
            } else {
                return null;
            }

            left *= 100;

            return (
                <Point key={index} left={left + "%"}>
                    <PointContent>{Component ? Component : null}</PointContent>
                </Point>
            );
        });
    }, [points, min, max]);

    return <>{pointComponents}</>;
}

export default TimelineSlider;
