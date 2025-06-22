import { useContext, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import useAlgorithm from "../../hooks/useAlgorithm";
import { PlayContext } from "./PlayContext";

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
	padding: 0.5rem 0;
	font-weight: 600;
	box-shadow: 3px 3px 0px 1px var(--color-grey-400);
	${({ type }) => variations[type]};
`;

const BlockArea = styled.div`
	display: grid;
	height: 100%;
	width: 100%;
	padding: 5rem;

	grid-template-rows: repeat(20, 1fr);
	grid-template-columns: repeat(50, 1fr);
	grid-gap: 0 1rem;
`;

const Container = styled.div`
	height: 100%;
	display: flex;
	flex-direction: column;
	align-content: center;
	justify-content: center;
`;

const Background = styled.div`
	background-color: var(--color-grey-50);
	box-shadow: 0.5rem 0.5rem 0px 2px var(--color-grey-300);
	padding: 0 2rem;
	border-radius: 15px;
	height: 100%;
`;

function SortAlgorithmVisualizer({ algorithm }) {
	const { algorithmInput } = useContext(PlayContext);
	const { category, id } = algorithm;
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const { Algorithm } = useAlgorithm(category, id, algorithmInput);

	const displayedState = Algorithm.getStateByStepsIndex(currentStepIndex);
	const currentStep = Algorithm.getStepByIndex(currentStepIndex);

	return (
		<Container>
			<Background>
				<BlockArea>
					{displayedState.map((val, index) => {
						const isActive =
							currentStep.activeItems.includes(index);
						const type = isActive ? currentStep.type : "default";
						return (
							<Block
								type={type}
								index={index}
								key={index}
								val={val}
							>
								<p>{val}</p>
							</Block>
						);
					})}
				</BlockArea>
			</Background>
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
