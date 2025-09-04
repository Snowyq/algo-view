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

	@media screen and (min-width: 640px) {
		height: 12px;
	}

	transition: height 0.3s;
`;

const Dot = styled.div`
	position: absolute;
	background-color: var(--color-grey-50);
	border-radius: 50%;
	height: 12px;
	aspect-ratio: 1/1;

	@media screen and (min-width: 640px) {
		height: 100%;
	}

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
	height: 8px;
	position: absolute;
	top: 50%;
	translate: 0 -50%;
	background-color: var(--color-grey-500);
	border-radius: 15px;
`;

const Hover = styled.div`
	width: 5px;
	height: 100%;
	background-color: var(--color-grey-600);
	border-radius: 15px;
`;

function PlaySlider({ max, min, onChange, value, onMouseUp, DotComponent }) {
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
			</SliderOutput>
		</SliderContainer>
	);
}

export default PlaySlider;
