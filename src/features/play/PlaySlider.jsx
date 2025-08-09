import styled from "styled-components";
import Slider from "../../ui/Slider";

const Flex = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

const SliderContainer = styled(Flex)`
	width: 100%;
	height: 8px;
	gap: 1.5rem;
`;
const SliderOutput = styled.div`
	width: 100%;
	height: 8px;
	background-color: var(--color-grey-400);
	border-radius: 15px;
	transition: height 0.3s;
	&:hover {
		height: 8px;
	}
`;

const Dot = styled.div`
	position: absolute;
	background-color: var(--color-grey-50);
	border-radius: 50%;
	height: 125%;
	aspect-ratio: 1/1;

	top: 50%;
	translate: -50% -50%;
	box-shadow: 1px 1px 0px 1px var(--color-grey-400);

	&::before {
		content: "";
		position: absolute;
		height: 50%;
		width: 50%;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		z-index: -10;
		border-radius: 50%;
		background-color: var(--color-grey-500);
	}
`;

const Tooltip = styled.div`
	position: absolute;
	translate: -50% calc(-100% - 0.75rem);
	background-color: var(--color-grey-100);
	border-radius: 5px;
	line-height: 1;
	padding: 0.1rem 0.2rem;
	pointer-events: none;
`;

const Fill = styled.div`
	width: 100%;
	height: 90%;
	background-color: var(--color-grey-500);
	border-radius: 15px;
`;

const Hover = styled.div`
	width: 5px;
	height: 100%;
	background-color: var(--color-grey-600);
	border-radius: 15px;
`;

function PlaySlider({ max, min, onChange, value, onMouseUp }) {
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
			</SliderOutput>
		</SliderContainer>
	);
}

export default PlaySlider;
