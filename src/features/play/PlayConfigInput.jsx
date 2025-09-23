import styled from "styled-components";
import Slider from "../../ui/Slider";
import { useState } from "react";
import Button from "../../ui/Button";

const Container = styled.div``;

const SliderOutput = styled.div`
	background-color: var(--color-grey-400);
	height: 5px;
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

const Config = styled.div`
	gap: 1.5rem;
	padding: 1rem 1rem;
	border-radius: 15px;
	background-color: var(--color-grey-200);
`;

const Item = styled.div``;

function PlayConfigInput() {
	const [length, setLength] = useState(100);

	const changeLength = val => {
		console.log(val);
		setLength(val);
	};

	return (
		<Container>
			<p>Input</p>
			<Config>
				<Item>
					<p>Values number</p>
					<LengthSlider value={length} onChange={changeLength} />
				</Item>
				<Item>
					<p>Values range</p>
					<div>
						<span>min</span>
						<input type="number" placeholder="1" />
					</div>
					<div>
						<span>max</span>
						<input type="number" placeholder="30" />
					</div>
				</Item>

				<Button>
					<span>Apply</span>
				</Button>
			</Config>
		</Container>
	);
}

function LengthSlider({ value, onChange }) {
	return (
		<>
			<SliderOutput>
				<Slider
					maxValue={1000}
					minValue={10}
					value={value}
					onChange={onChange}
				>
					<Slider.Dot>
						<Dot />
					</Slider.Dot>
					<Slider.Tooltip>{<></>}</Slider.Tooltip>
					<Slider.ProgressFill>{/* <Fill /> */}</Slider.ProgressFill>
					<Slider.HoverDot>{/* <Hover /> */}</Slider.HoverDot>
				</Slider>
			</SliderOutput>
		</>
	);
}

export default PlayConfigInput;
