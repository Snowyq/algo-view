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
import useRateLimit from "../../hooks/useRateLimit";
import { useRef } from "react";

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
	const { value: step } = useSelector(getStep);
	const max = useSelector(getMaxStep);
	const dispatch = useDispatch();
	const animationStatus = useSelector(getAnimationStatus);

	const timeoutRef = useRef(null);

	const handleChange = value => {
		console.log("mouseChange");
		if (animationStatus === "playing") {
			dispatch(freezeAnimation());
		}
		dispatch(changeStep({ value }));
	};

	// console.log(value);
	const limitedChange = useRateLimit(handleChange, 16);

	const handleMouseUp = () => {
		console.log("mouseUp", animationStatus);
		if (animationStatus === "freezed") {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = setTimeout(
				() => dispatch(startAnimation()),
				50
			);
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
