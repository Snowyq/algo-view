import styled from "styled-components";
import PlayWindow from "./PlayWindow";
import {
	memo,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { PlayContext, StepContext } from "./PlayContext";

import PlaySpeed from "./PlaySpeed";
import PlayProgressBar from "./PlayProgressBar";
import PlayProgressControls from "./PlayProgressControls";
import ButtonIcon from "../../ui/ButtonIcon";
import { RiNumbersLine } from "react-icons/ri";

const Flex = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

const Group = styled.div`
	position: absolute;
`;

const Center = styled(Group)`
	left: 50%;
	translate: -50% 0;
`;

const Left = styled(Group)`
	left: 0;
`;

const Right = styled(Group)`
	right: 0;
`;

const StyledPlayControls = styled(Flex)`
	flex-direction: column;
	border-top: 3px solid var(--color-grey-300);
	/* background-color: yellow; */
	background-color: var(--color-grey-200);
	padding: 1rem 4rem 2rem 4rem;
	width: 100%;
`;

const Container = styled(Flex)`
	width: 100%;
	max-width: 1200px;
	height: 100%;
	flex-direction: column;
	gap: 2rem;
`;

const Controls = styled(Flex)`
	width: 100%;
	height: 100%;
	justify-content: space-between;
	position: relative;
`;

const Bar = styled(Flex)`
	width: 100%;
	height: 5rem;
`;

function PlayControls() {
	const {
		decreaseGlobalStep,
		globalStep,
		increaseGlobalStep,
		globalStepsLength,
		changeGlobalStep,
	} = useContext(StepContext);
	const { animationSpeeds, activeCategory, metricsToggleAll } =
		useContext(PlayContext);
	const speeds = animationSpeeds[activeCategory];
	const globalStepRef = useRef(globalStep);
	const animationIntervalRef = useRef(null);
	const animationTimeoutRef = useRef(null);
	const wasPlayingRef = useRef(false);

	const [isPlaying, setIsPlaying] = useState(false);
	const [animationIntervalValue, setAnimationIntervalValue] = useState(
		speeds[Math.round(speeds.length / 2)]
	);

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

	const stopAnimation = useCallback(() => {
		clearAnimationInterval();
		wasPlayingRef.current = false;
		setIsPlaying(false);
	}, []);

	const startAnimation = useCallback(
		interval => {
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
		},
		[globalStepsLength, increaseGlobalStep, globalStep, stopAnimation]
	);

	const freezeAnimation = () => {
		if (animationIntervalRef.current !== null) {
			wasPlayingRef.current = true;
		}
		clearAnimationInterval();
	};

	const unFreezeAnimation = () => {
		clearAnimationTimeout();
		if (wasPlayingRef.current) {
			let id = setTimeout(
				() => startAnimation(animationIntervalValue),
				100
			);
			animationTimeoutRef.current = id;
		}
	};

	const changeProgress = value => {
		changeGlobalStep(value);
	};

	const forward = useCallback(
		steps => {
			increaseGlobalStep(steps);
		},
		[increaseGlobalStep]
	);
	const backward = useCallback(
		steps => {
			decreaseGlobalStep(steps);
		},
		[decreaseGlobalStep]
	);

	const start = useCallback(
		() => startAnimation(animationIntervalValue),
		[animationIntervalValue, startAnimation]
	);
	const stop = useCallback(stopAnimation, [stopAnimation]);
	const changeSpeed = useCallback(
		val => {
			if (isPlaying) {
				stopAnimation();
				setAnimationIntervalValue(val);
				startAnimation(val);
			} else {
				setAnimationIntervalValue(val);
			}
		},
		[isPlaying, startAnimation, stopAnimation]
	);

	useEffect(() => {
		return () => clearAnimationInterval();
	}, []);

	useEffect(() => {
		globalStepRef.current = globalStep;
	}, [globalStep]);

	return (
		<StyledPlayControls>
			<Container>
				<Bar>
					<PlayProgressBar
						value={globalStep}
						max={globalStepsLength - 1}
						freeze={freezeAnimation}
						unfreeze={unFreezeAnimation}
						onChange={changeProgress}
					/>
				</Bar>
				<Controls>
					<Left>
						<PlaySpeed
							speed={animationIntervalValue}
							speeds={speeds}
							onChange={changeSpeed}
							freeze={freezeAnimation}
							unfreeze={unFreezeAnimation}
						/>
					</Left>
					<Center>
						<PlayProgressControls
							onBackward={backward}
							onForward={forward}
							onStart={start}
							onStop={stop}
							isPlaying={isPlaying}
						/>
					</Center>
					<Right>
						<ButtonIcon onClick={metricsToggleAll}>
							<RiNumbersLine />
						</ButtonIcon>
					</Right>
				</Controls>
			</Container>
		</StyledPlayControls>
	);
}

export default memo(PlayControls);
