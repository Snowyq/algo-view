import styled from "styled-components";
import Slider from "../../ui/Slider";

const Flex = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

const SliderContainer = styled(Flex)`
	width: 100%;
	gap: 1.5rem;
`;
const SliderOutput = styled.div`
	width: 100%;
	height: 6px;
`;

function PlaySlider({
	handleSliderChange,
	progress,
	display,
	handleSliderMouseUp,
}) {
	return (
		<SliderContainer>
			<SliderOutput>
				<Slider
					onMouseUp={handleSliderMouseUp}
					onChange={handleSliderChange}
					display={display}
					progress={progress}
				/>
			</SliderOutput>
		</SliderContainer>
	);
}

export default PlaySlider;
