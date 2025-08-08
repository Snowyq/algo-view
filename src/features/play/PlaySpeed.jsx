import styled from "styled-components";
import PlayControlsButton from "./PlayControlsButton";
import { BsSpeedometer } from "react-icons/bs";
import { useState } from "react";
import Slider from "../../ui/Slider";
const SliderContainer = styled.div``;
const SliderOutput = styled.div`
	width: 10rem;
	height: 5px;
	background-color: var(--color-grey-300);
	border-radius: 5px;
	transition: height 0.3s;

	&:hover {
		height: 8px;
	}
`;

const HoverDot = styled.div`
	height: 100%;
	width: 5px;
	background-color: var(--color-grey-400);
`;

const SliderFill = styled.div`
	width: 100%;
	height: 100%;
	background-color: var(--color-grey-400);
	border-radius: 5px;
`;

const Tooltip = styled.div`
	line-height: 1;
	padding: 0.1rem 0.25rem;
	background-color: var(--color-grey-100);
`;

const StyledPlaySpeed = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
`;

function PlaySpeed({ speed, onChange, speeds }) {
	const [isHidden, setIsHidden] = useState();
	const sliderState = isHidden ? "hidden" : "visible";
	const maxValue = speeds.length - 1;
	const value = speeds.findIndex(el => el === speed);

	const handleOnChange = index => {
		onChange(speeds[index]);
	};

	return (
		<StyledPlaySpeed>
			<PlayControlsButton icon={<BsSpeedometer />} />
			<SliderContainer state={sliderState}>
				<SliderOutput state={sliderState}>
					<Slider
						maxValue={maxValue}
						value={value}
						onChange={handleOnChange}
					>
						<Slider.HoverDot>
							<HoverDot />
						</Slider.HoverDot>
						<Slider.ProgressFill transition={0.2}>
							<SliderFill />
						</Slider.ProgressFill>
						<Slider.Tooltip modifyValue={val => speeds[val] + "ms"}>
							<Tooltip />
						</Slider.Tooltip>
					</Slider>
				</SliderOutput>
			</SliderContainer>
			<span>{speed}ms</span>
		</StyledPlaySpeed>
	);
}

export default PlaySpeed;
