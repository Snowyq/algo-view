import { useContext, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import useAlgorithm from "../../hooks/useAlgorithm";
import { PlayContext } from "./PlayContext";
import { useRect } from "../../hooks/useRect";
import { FaPlay } from "react-icons/fa6";
import ButtonIcon from "../../ui/ButtonIcon";
import AlgorithmControls from "./AlgorithmControls";

const variations = {
	swap: css`
		background-color: var(--color-blue-400);
		box-shadow: 3px 3px 0px 1px var(--color-blue-700);
		color: var(--color-blue-800);
	`,
	select: css`
		background-color: var(--color-grey-400);
		box-shadow: 3px 3px 0px 1px var(--color-grey-700);
		color: var(--color-grey-800);
	`,
	check: css`
		background-color: var(--color-yellow-400);
		box-shadow: 3px 3px 0px 1px var(--color-yellow-700);
		color: var(--color-yellow-800);
	`,
	finish: css`
		background-color: var(--color-cyan-400);
		box-shadow: 3px 3px 0px 1px var(--color-cyan-700);
		color: var(--color-cyan-800);
	`,
	"check-false": css`
		background-color: var(--color-red-400);
		box-shadow: 3px 3px 0px 1px var(--color-red-700);
		color: var(--color-red-800);
	`,
	"check-true": css`
		background-color: var(--color-green-400);
		box-shadow: 3px 3px 0px 1px var(--color-green-700);
		color: var(--color-green-800);
	`,
};
const Block = styled.div`
	grid-column: span 1;
	grid-row: span ${({ val }) => val} / -1;
	background-color: var(--color-grey-300);
	border-radius: 0.8rem;
	color: white;
	display: flex;
	justify-content: center;
	align-items: end;
	font-weight: 600;
	box-shadow: 3px 3px 0px 1px var(--color-grey-400);
	${({ type }) => variations[type]};
`;

const BlockArea = styled.div`
	display: grid;
	width: 100%;
	height: 100%;
	grid-template-rows: ${({ $blockWidth, $maxValue }) =>
		`repeat(${$maxValue}, ${$blockWidth})`};
	grid-template-columns: ${({ $blockWidth, $arrayLength }) =>
		`repeat(${$arrayLength}, ${$blockWidth})`};
	grid-gap: 0 ${({ $gapWidth }) => `${$gapWidth}`};
`;

const Container = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 5rem;
`;

const Background = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: fit-content;
	height: 100%;
	max-height: 500px;
	background-color: var(--color-grey-50);
	box-shadow: 0.5rem 0.5rem 0px 2px var(--color-grey-300);
	/* padding: 0 2rem; */
	border-radius: 15px;
	padding: 2rem;
	gap: 1rem;
`;

const Scale = styled.div`
	background-color: var(--color-grey-500);
	width: 5px;
	height: 100%;
`;

const Controls = styled.div`
	height: 100%;
	max-height: 5rem;
	/* background-color: yellow; */
	border-radius: 15px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;

function SortAlgorithmVisualizer({ algorithm }) {
	const { algorithmInput } = useContext(PlayContext);
	const { Algorithm } = useAlgorithm(
		algorithm.category,
		algorithm.id,
		algorithmInput
	);
	const stepsLength = Algorithm.getStepsLength();
	const [currentStepIndex, setCurrentStepIndex] = useState(stepsLength - 1);
	const displayedState = Algorithm.getStateByStepsIndex(currentStepIndex);
	const currentStep = Algorithm.getStepByIndex(currentStepIndex);
	const arrayLength = Algorithm.getArrayLength();
	const { min: arrayMin, max: arrayMax } = Algorithm.getArrayMinMax();
	const progress = (currentStepIndex / (stepsLength - 1)) * 100;
	const blockWidth = (100 / arrayLength) * 0.7;
	const gapWidth = (100 / (arrayLength - 1)) * 0.3;

	console.log(Algorithm.withSteps().get());

	function updateProgress(newProgress) {
		const newStepIndex = Math.round(
			(newProgress / 100) * (stepsLength - 1)
		);
		setCurrentStepIndex(newStepIndex);
	}

	return (
		<Container>
			<Background>
				{/* <Scale /> */}
				<BlockArea
					$gapWidth={gapWidth + "%"}
					$arrayLength={arrayLength}
					$blockWidth={blockWidth + "%"}
				>
					{displayedState.map((val, index) => {
						const isActive =
							currentStep.activeItems.includes(index);
						const type = isActive ? currentStep.type : "default";
						return (
							<Block
								$blockWidth={"3px"}
								$minValue={arrayMin}
								$maxValue={arrayMax}
								type={type}
								index={index}
								key={index}
								val={val}
							>
								{/* <p>{val}</p> */}
							</Block>
						);
					})}
				</BlockArea>
			</Background>
			<AlgorithmControls
				progress={progress}
				updateProgress={updateProgress}
			/>
			<button onClick={() => setCurrentStepIndex(i => i - 1)}>
				wstecz
			</button>
			<button onClick={() => setCurrentStepIndex(i => i + 1)}>
				dalej
			</button>
		</Container>
	);
}

export default SortAlgorithmVisualizer;

// algorithm.createSteps();

// const { steps, operations } = algorithm.use();
// const [displayState, setDisplayState] = useState(algorithm.getArray());
// const [activeStepIndex, setActiveStepIndex] = useState(0);
// const step = steps[activeStepIndex] || {};
// const stepType = step.type;
// const stepActiveItems = step?.activeItems || [];

// useEffect(() => {
// 	const interval = setInterval(() => {
// 		setActiveStepIndex(prev => {
// 			const next = prev + 1;
// 			if (next < steps.length) {
// 				const newState = algorithm.getStateByStepsIndex(next);
// 				setDisplayState(newState);
// 				return next;
// 			} else {
// 				clearInterval(interval);
// 				return prev;
// 			}
// 		});
// 	}, 150);

// 	return () => clearInterval(interval);
// }, [algorithm, steps.length]);
