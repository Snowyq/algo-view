import { useEffect, useState } from "react";
import SortArrayDisplay from "./SortArrayDisplay";
import useSortAlgorithm from "../../hooks/useAlgorithm";
import styled from "styled-components";
import ButtonIcon from "../../ui/ButtonIcon";
import PlayAlgorithmInstructions from "./PlayAlgorithmInstructions";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
`;

const Body = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	gap: 2rem;
`;

const AlgorithmContainer = styled.div`
	width: 100%;
	height: 100%;
	padding: 4rem;
	display: flex;
	gap: 2rem;
	background-color: var(--color-grey-50);
	box-shadow: 0.2rem 0.2rem 0px 2px var(--color-grey-300);
	border-radius: 15px;
`;

const InstructionsContainer = styled.div`
	/* width: 100%; */
	display: flex;
	/* position: absolute; */
	font-weight: 700;
	/* right: 2rem;
	padding: 0 1rem;
	top: 2rem;
	bottom: 2rem; */
	z-index: 100;
	backdrop-filter: blur(2px);
	flex-direction: column;
`;

const Options = styled.div`
	display: flex;
	padding: 0.7rem;
	align-self: end;
`;

const Option = styled(ButtonIcon)`
	background-color: transparent;
`;

function SortAlgorithmVisualizer({
	registry,
	input,
	stepIndex,
	passStepsLength,
}) {
	const [localStepIndex, setCurrStepIndex] = useState(stepIndex);
	const { getState, getStep, getArrayLength, getMaxValue, getStepsLength } =
		useSortAlgorithm(registry.Class, input);

	const step = getStep(localStepIndex);
	const arrayLength = getArrayLength();
	const stepsLength = getStepsLength();
	const state = getState(localStepIndex);
	const maxValue = getMaxValue();

	useEffect(() => {
		passStepsLength(stepsLength);
	}, [stepsLength, passStepsLength]);

	useEffect(() => {
		setCurrStepIndex(() => {
			if (stepIndex >= stepsLength - 1) return stepsLength - 1;
			else if (stepIndex <= 0) return 0;
			else return stepIndex;
		});
	}, [stepIndex, stepsLength]);

	return (
		<Container>
			{/* <Options>
				<Option>
					<IoSettings />
				</Option>
			</Options> */}
			<Body>
				<AlgorithmContainer>
					<SortArrayDisplay
						registry={registry}
						arrayLength={arrayLength}
						step={step}
						state={state}
						maxValue={maxValue}
						blockValueDisplayThreshold={30}
					/>
				</AlgorithmContainer>
				<InstructionsContainer>
					<p>Instructions</p>
					<PlayAlgorithmInstructions
						instructions={registry.instructions}
						step={step}
					/>
				</InstructionsContainer>
			</Body>
		</Container>
	);
}

export default SortAlgorithmVisualizer;
