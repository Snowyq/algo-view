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

const Flex = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

const Group = styled.div``;

const StyledPlayControls = styled(Flex)`
	flex-direction: column;
`;

const Progress = styled.span`
	font-size: 1.4rem;
	align-self: flex-start;
`;

const ProgressBar = styled(Flex)`
	width: 80%;
	gap: 0.2rem;
	flex-direction: column;
`;

const Container = styled(Flex)``;

const Controls = styled(Flex)`
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	height: 100%;
`;

function PlayControls() {
	const {
		decreaseGlobalStep,
		globalStep,
		increaseGlobalStep,
		globalStepsLength,
		changeGlobalStep,
	} = useContext(StepContext);

	const globalStepRef = useRef(globalStep);
	const animationIntervalRef = useRef(null);
	const animationTimeoutRef = useRef(null);
	const [animationIntervalValue, setAnimationIntervalValue] = useState(5);
	const progress = globalStep / globalStepsLength;
	const progressString = `${globalStep} / ${globalStepsLength - 1}`;
	const [isPlaying, setIsPlaying] = useState();
	const wasPlayingRef = useRef(false);

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

	const startAnimation = () => {
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
		}, animationIntervalValue);
		animationIntervalRef.current = id;
		setIsPlaying(true);
	};

	const stopAnimation = () => {
		clearAnimationInterval();
		wasPlayingRef.current = false;
		setIsPlaying(false);
	};

	const handleSliderChange = progress => {
		const newStep = Math.round(globalStepsLength * progress);
		if (animationIntervalRef.current !== null) {
			wasPlayingRef.current = true;
		}
		clearAnimationInterval();
		changeGlobalStep(newStep);
	};

	const handleSliderMouseUp = () => {
		clearAnimationTimeout();
		if (wasPlayingRef.current) {
			let id = setTimeout(startAnimation, 100);
			animationTimeoutRef.current = id;
		}
	};

	const forward = steps => {
		increaseGlobalStep(steps);
	};
	const backward = steps => {
		decreaseGlobalStep(steps);
	};

	const handleAnimationSpeedChange = progress => {};

	useEffect(() => {
		return () => clearAnimationInterval();
	}, []);

	useEffect(() => {
		globalStepRef.current = globalStep;
	}, [globalStep]);

	return (
		<PlayWindow>
			<PlayWindow.Body>
				<StyledPlayControls>
					<ProgressBar>
						<Progress>{progressString}</Progress>
						<PlaySlider
							display={globalStep}
							handleSliderChange={handleSliderChange}
							handleSliderMouseUp={handleSliderMouseUp}
							progress={progress}
							maxDisplay={globalStepsLength - 1}
						/>
					</ProgressBar>
					<Controls>
						<Group>
							<PlayControlsButton
								icon={<FaBackward />}
								onClick={() => backward(1)}
							/>
							<PlayStopButton
								onStart={startAnimation}
								onStop={stopAnimation}
								isStopped={!isPlaying}
							/>
							<PlayControlsButton
								icon={<FaForward />}
								onClick={() => forward(1)}
							/>
						</Group>
					</Controls>
				</StyledPlayControls>
			</PlayWindow.Body>
		</PlayWindow>
	);
}

export default PlayControls;
