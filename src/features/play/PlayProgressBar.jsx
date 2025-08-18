import styled from "styled-components";
import PlaySlider from "./PlaySlider";
import { useDispatch, useSelector } from "react-redux";
import {
	changeStep,
	freezeAnimation,
	getAnimationStatus,
	getIsPlaying,
	getMaxStep,
	getStep,
	startAnimation,
	stopAnimation,
} from "./playSlice";
import { useEffect, useRef, useState } from "react";
import useRateLimit from "../../hooks/useRateLimit";

const Flex = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

const Progress = styled.span`
	font-size: 1.4rem;
	align-self: flex-start;
	visibility: ${({ state }) => state};
`;

const ProgressBar = styled(Flex)`
	width: 100%;
	gap: 0.2rem;
	flex-direction: column;
`;

function PlayProgressBar() {
	const step = useSelector(getStep);
	const max = useSelector(getMaxStep);
	const dispatch = useDispatch();
	const animationStatus = useSelector(getAnimationStatus);

	const handleChange = value => {
		if (animationStatus === "playing") {
			dispatch(freezeAnimation());
		}
		dispatch(changeStep(value));
	};

	// console.log(value);
	const limitedChange = useRateLimit(handleChange, 16);

	const handleMouseUp = () => {
		if (animationStatus === "freezed") {
			dispatch(startAnimation());
		}
	};

	return (
		<ProgressBar>
			<Progress
				state={max > 0 ? "visible" : "hidden"}
			>{`${step}/${max}`}</Progress>
			<PlaySlider
				onChange={limitedChange}
				onMouseUp={handleMouseUp}
				value={step}
				min={0}
				max={max}
			/>
		</ProgressBar>
	);
}

export default PlayProgressBar;
