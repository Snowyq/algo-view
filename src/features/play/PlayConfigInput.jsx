import styled from "styled-components";
import Slider from "../../ui/Slider";
import { useState } from "react";
import Button from "../../ui/Button";
import DefaultSlider from "../../ui/DefaultSlider";
import { useDispatch, useSelector } from "react-redux";
import { changeInput, getActiveCategory } from "./playSlice";
import { MAX_INPUT_LENGTH, MIN_INPUT_LENGTH } from "../../constants/constants";
import Input from "../../ui/Input";
import {
	SORT_MAX_INPUT_LENGTH,
	SORT_MIN_INPUT_LENGTH,
} from "../../constants/sort";
import {
	DEFAULT_SORT_INPUT_LENGTH,
	DEFAULT_SORT_INPUT_VALUE_RANGE,
} from "../../config/sort";

const Container = styled.div``;

const Item = styled.div``;

const LengthContainer = styled.div`
	display: flex;
	gap: 1rem;
	width: 100%;
`;

const RangeContainer = styled.div`
	display: flex;
	width: 100%;
`;

function PlayConfigSortInput() {
	const dispatch = useDispatch();
	const [length, setLength] = useState(DEFAULT_SORT_INPUT_LENGTH);
	const [minValue, setMinValue] = useState(DEFAULT_SORT_INPUT_VALUE_RANGE[0]);
	const [maxValue, setMaxValue] = useState(DEFAULT_SORT_INPUT_VALUE_RANGE[1]);

	const handleLengthChangeBySlider = val => {
		changeLength(val);
	};

	const changeLength = val => {
		setLength(val);
	};

	const handleMinValueChange = e => {
		const value = Number(e.target.value);
	};

	const handleInputLengthChange = e => {
		const value = Number(e.target.value);
		changeLength(value);
	};

	const handleChangeInput = e => {
		dispatch(changeInput({ length, min: minValue, max: maxValue }));
	};
	const handleRandomInput = e => {};

	return (
		<Container>
			<Item>
				<p>Values number</p>
				<LengthContainer>
					<PlaySidebarInput
						type="number"
						value={length}
						min={SORT_MIN_INPUT_LENGTH}
						max={SORT_MAX_INPUT_LENGTH}
						onChange={handleInputLengthChange}
					/>
					<DefaultSlider
						min={SORT_MIN_INPUT_LENGTH}
						max={SORT_MAX_INPUT_LENGTH}
						value={length}
						onChange={handleLengthChangeBySlider}
					/>
				</LengthContainer>
			</Item>
			<Item>
				<p>Values range</p>

				<RangeContainer>
					<div>
						<span>min</span>
						<PlaySidebarInput
							type="number"
							placeholder="1"
							onChange={handleMinValueChange}
						/>
					</div>
					<div>
						<span>max</span>
						<PlaySidebarInput type="number" placeholder="30" />
					</div>
				</RangeContainer>
			</Item>

			<Button onClick={handleChangeInput}>
				<span>Apply</span>
			</Button>
			<Button>
				<span>Random</span>
			</Button>
		</Container>
	);
}

const InputContainer = styled.div`
	margin: 0.2rem 0;
	height: 3rem;
	width: 10rem;
`;

function PlaySidebarInput({ ...props }) {
	return (
		<InputContainer>
			<Input {...props} />
		</InputContainer>
	);
}

export default PlayConfigSortInput;
