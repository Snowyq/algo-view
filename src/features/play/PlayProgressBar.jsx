import styled from "styled-components";
import PlaySlider from "./PlaySlider";
import { useDispatch, useSelector } from "react-redux";
import {
	changeStep,
	freezeAnimation,
	getActiveAlgorithms,
	getAnimationStatus,
	getMaxStep,
	getStep,
	startAnimation,
} from "./playSlice";
import useRateLimit from "../../hooks/useRateLimit";
import { memo, useMemo, useRef } from "react";
import AnimatedText from "../../ui/AnimatedText";

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

const PointHint = styled.div`
	z-index: -1;
	translate: 0 -100%;
	pointer-events: none;
	/* background-color: yellow; */
	/* height: 100px; */
	/* width: 100px; */
	/* opacity: ${({ show }) => (show === "show" ? 1 : 0)}; */
	opacity: 1;
	transition: opacity 0.1s;
`;

const PointHintLabel = styled.span`
	display: block;
	transform-origin: 0 50%;
	/* rotate: 270deg; */
	rotate: 300deg;
	/* background-color: green; */
	pointer-events: none;
`;

const Container = styled.div`
	width: calc(100%);
	padding: 1rem 0;
`;

const MemoSlider = memo(PlaySlider);

function PlayProgressBar({ max, showStep = true, showHint }) {
	const dispatch = useDispatch();
	const { value: step } = useSelector(getStep);
	const globalMaxStep = useSelector(getMaxStep);
	const animationStatus = useSelector(getAnimationStatus);
	const activeAlgorithms = useSelector(getActiveAlgorithms);

	const maxStep = max || globalMaxStep;

	const points = useMemo(() => {
		return activeAlgorithms.map(algo => {
			const { steps, info } = algo;
			if (!steps) return;
			return {
				value: steps.length - 1,
				Component: (
					<PointHint>
						{/* <PointHintNum>{index + 1}</PointHintNum> */}
						<PointHintLabel>
							<AnimatedText show={showHint}>
								{info.name}
							</AnimatedText>
						</PointHintLabel>
					</PointHint>
				),
			};
		});
	}, [activeAlgorithms, showHint]);

	const timeoutRef = useRef(null);

	const handleChange = value => {
		console.log("mouseChange");
		if (animationStatus === "playing") {
			dispatch(freezeAnimation());
		}
		dispatch(changeStep({ value }));
	};

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
			{showStep && (
				<Progress
					state={maxStep > 0 ? "visible" : "hidden"}
				>{`${step}/${maxStep}`}</Progress>
			)}
			<Container>
				<MemoSlider
					onChange={limitedChange}
					onMouseUp={handleMouseUp}
					value={step}
					min={0}
					max={maxStep}
					points={points}
				/>
			</Container>
		</ProgressBar>
	);
}

export default PlayProgressBar;
