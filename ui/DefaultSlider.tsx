import styled from "styled-components";
import Slider from "./Slider";

const Flex = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const SliderContainer = styled(Flex)`
    width: 100%;
    height: 8px;
    gap: 1.5rem;
    background-color: var(--color-grey-400);
    border-radius: 15px;

    -webkit-user-select: none; /* iOS Safari */
    -ms-user-select: none; /* IE 10+ */
    user-select: none; /* Modern browsers */

    -webkit-touch-callout: none; /* iOS Safari long press menu */
    -webkit-tap-highlight-color: transparent; /* remove highlight on tap */
`;

const SliderOutput = styled.div`
    position: relative;
    width: 100%;
    height: 25px;

    padding: 0 0.5rem;

    @media screen and (min-width: 640px) {
        height: 12px;
    }
`;

const Dot = styled.div`
    background-color: var(--color-grey-600);
    border-radius: 50%;
    height: 100%;
    /* height: 5px; */
    aspect-ratio: 1/1;
    box-shadow: 1px 1px 0px 1px var(--color-grey-400);
`;

const Fill = styled.div`
    width: 100%;
    height: 8px;
    position: absolute;
    top: 50%;
    translate: 0 -50%;
    background-color: var(--color-grey-200);
    border-radius: 15px;
`;

const Hover = styled.div`
    width: 3px;
    height: 100%;
    background-color: var(--color-grey-500);
    border-radius: 15px;
`;

function DefaultSlider({
    min = 0,
    max,
    value,
    onChange,
    onMouseUp = undefined,
    showFill = false,
}) {
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
