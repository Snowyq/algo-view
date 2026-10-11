import { JSX } from "react";
import styled from "styled-components";
import Slider from "./Slider";
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
    height: 2.4rem;
`;

const Dot = styled.div`
    height: 1.6rem;
    aspect-ratio: 1/1;
    margin-top: 0.4rem;
    border-radius: 50%;
    background-color: var(--text);
    box-shadow:
        0 0 0 4px var(--ink-900),
        var(--shadow-1);
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
    height: 1.2rem;
    margin-top: 0.6rem;
    background-color: var(--text-muted);
    border-radius: 2px;
`;

type DefaultSliderProps = {
    min?: number;
    max: number;
    value: number;
    onChange?: (value: number) => void;
    onMouseUp?: () => void;
    showFill?: boolean;
};

function DefaultSlider({
    min = 0,
    max,
    value,
    onChange,
    onMouseUp,
    showFill = false,
}: DefaultSliderProps): JSX.Element {
    return (
        <SliderContainer>
            <SliderOutput>
                <Slider
                    maxValue={max}
                    minValue={min}
                    value={value}
                    onChange={onChange}
                    onMouseUp={onMouseUp}
                >
                    <Slider.Dot>
                        <Dot />
                    </Slider.Dot>
                    <Slider.Tooltip>{<></>}</Slider.Tooltip>
                    {showFill && (
                        <Slider.ProgressFill>
                            <Fill />
                        </Slider.ProgressFill>
                    )}
                    <Slider.HoverDot>
                        <Hover />
                    </Slider.HoverDot>
                </Slider>
            </SliderOutput>
        </SliderContainer>
    );
}

export default DefaultSlider;
