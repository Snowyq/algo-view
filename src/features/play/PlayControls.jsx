import styled from "styled-components";
import ControlBar from "../../ui/ControlBar";
import PlayWindow from "./PlayWindow";
import AlgorithmControls from "./AlgorithmControls";
import { useContext, useEffect, useRef, useState } from "react";
import { PlayContext, StepContext } from "./PlayContext";
import {
	RiForward15Fill,
	RiForward30Fill,
	RiForward5Fill,
	RiReplay15Fill,
	RiReplay30Fill,
	RiReplay5Fill,
} from "react-icons/ri";
import {
	FaBackward,
	FaForward,
	FaMarsStrokeUp,
	FaPlay,
	FaStop,
} from "react-icons/fa6";

import PlaySlider from "./PlaySlider";
import PlayControlsButton from "./PlayControlsButton";
import PlayStopButton from "../../ui/PlayStopButton";
import Slider from "../../ui/Slider";
import PlaySpeed from "./PlaySpeed";

const Flex = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

const Group = styled.div``;

const StyledPlayControls = styled(Flex)`
	flex-direction: column;
	height: 100%;
	width: 100%;
`;

const Progress = styled.span`
	font-size: 1.4rem;
	align-self: flex-start;
`;

const ProgressBar = styled(Flex)`
	width: 100%;
	gap: 0.2rem;
	flex-direction: column;
`;

const Container = styled(Flex)`
	width: 80%;
	flex-direction: column;
	gap: 1rem;
`;

const Controls = styled(Flex)`
	width: 100%;
	height: 100%;
	justify-content: space-between;
`;

function PlayControls() {
	const {
		decreaseGlobalStep,
		globalStep,
		increaseGlobalStep,
		globalStepsLength,
		changeGlobalStep,
	} = useContext(StepContext);
	const { animationSpeeds, activeCategory } = useContext(PlayContext);
	const speeds = animationSpeeds[activeCategory];
	const globalStepRef = useRef(globalStep);
	const animationIntervalRef = useRef(null);
	const animationTimeoutRef = useRef(null);
	const wasPlayingRef = useRef(false);

	const [isPlaying, setIsPlaying] = useState(false);
	const [animationIntervalValue, setAnimationIntervalValue] = useState(
		speeds[Math.round(speeds.length / 2)]
	);

	const progressString = `${globalStep} / ${globalStepsLength - 1}`;

	const clearAnimationTimeout = () => {
		if (animationTimeoutRef.current) {
			clearTimeout(animationTimeoutRef.current);
			animationTimeoutRef.current = null;
		}
	};

	const clearAnimationInterval = () => {
		if (animationIntervalRef.current) {
			clearInterval(animationIntervalRef.current);
			animationIntervalRef.current = null;
		}
	};

	const startAnimation = interval => {
		if (globalStep >= globalStepsLength - 1) return;
		clearAnimationTimeout();
		if (animationIntervalRef.current) return;
		const id = setInterval(() => {
			const currentStep = globalStepRef.current;
			if (currentStep >= globalStepsLength - 1) {
				stopAnimation();
			} else {
				increaseGlobalStep(1);
			}
		}, interval);
		animationIntervalRef.current = id;
		setIsPlaying(true);
	};

	const stopAnimation = () => {
		clearAnimationInterval();
		wasPlayingRef.current = false;
		setIsPlaying(false);
	};

	const handleSliderChange = value => {
		if (animationIntervalRef.current !== null) {
			wasPlayingRef.current = true;
		}
		clearAnimationInterval();
		changeGlobalStep(value);
	};

	const handleSliderMouseUp = () => {
		clearAnimationTimeout();
		if (wasPlayingRef.current) {
			let id = setTimeout(
				() => startAnimation(animationIntervalValue),
				100
			);
			animationTimeoutRef.current = id;
		}
	};

	const forward = steps => {
		increaseGlobalStep(steps);
	};
	const backward = steps => {
		decreaseGlobalStep(steps);
	};

	const changeSpeed = val => {
		stopAnimation();
		setAnimationIntervalValue(val);
		startAnimation(val);
	};

	useEffect(() => {
		return () => clearAnimationInterval();
	}, []);

	useEffect(() => {
		globalStepRef.current = globalStep;
	}, [globalStep]);

	return (
		<PlayWindow>
			<StyledPlayControls>
				<Container>
					<ProgressBar>
						<Progress>{progressString}</Progress>
						<PlaySlider
							onChange={handleSliderChange}
							onMouseUp={handleSliderMouseUp}
							value={globalStep}
							min={0}
							max={globalStepsLength - 1}
						/>
					</ProgressBar>
					<Controls>
						<Group>
							<PlaySpeed
								speed={animationIntervalValue}
								speeds={speeds}
								onChange={changeSpeed}
							/>
						</Group>
						<Group>
							<PlayControlsButton
								icon={<FaBackward />}
								onClick={() => backward(1)}
							/>
							<PlayStopButton
								onStart={() =>
									startAnimation(animationIntervalValue)
								}
								onStop={stopAnimation}
								isStopped={!isPlaying}
							/>
							<PlayControlsButton
								icon={<FaForward />}
								onClick={() => forward(1)}
							/>
						</Group>
						<Group>
							<PlayControlsButton
								icon={<FaBackward />}
								onClick={() => backward(1)}
							/>
						</Group>
					</Controls>
				</Container>
			</StyledPlayControls>
		</PlayWindow>
	);
}

export default PlayControls;
