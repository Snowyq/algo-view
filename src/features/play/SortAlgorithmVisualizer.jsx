import { useEffect, useState } from "react";
import SortArrayDisplay from "./SortArrayDisplay";
import { useRect } from "../../hooks/useRect";
import useSortAlgorithm from "../../hooks/useAlgorithm";
import styled, { css } from "styled-components";
import ButtonIcon from "../../ui/ButtonIcon";
import { IoSettings } from "react-icons/io5";

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

const Options = styled.div`
	display: flex;
	padding: 0.7rem;
	align-self: end;
`;

const Option = styled(ButtonIcon)`
	background-color: transparent;
`;

const Instructions = styled.div`
	/* background-color: var(--color-grey-100); */
	/* padding: 1rem; */
	border-radius: 15px;
	font-weight: 600;

	/* box-shadow: 3px 3px 0px 1px var(--color-grey-200); */
`;

const instructionStates = {
	"active-start": css`
		background-color: var(--background-color);
		box-shadow: 3px 3px 0px 1px var(--box-shadow-color);
		color: var(--color);
		/* margin: 0.5rem 0; */
	`,
	"active-end": css`
		background-color: var(--background-color-hover);
		box-shadow: 3px 3px 0px 1px var(--background-color);
		/* margin: 0.2rem 0; */
	`,
	default: css``,
};
const instructionVariations = {
	swap: css`
		--background-color: var(--color-blue-400);
		--background-color-hover: var(--color-blue-300);
		--box-shadow-color: var(--color-blue-500);
		--color: var(--color-blue-800);
		--dot-color: var(--color-blue-500);
	`,
	select: css`
		--background-color: var(--color-pink-400);
		--background-color-hover: var(--color-pink-300);
		--box-shadow-color: var(--color-pink-500);
		--color: var(--color-pink-800);
		--dot-color: var(--color-pink-500);
	`,
	check: css`
		--background-color: var(--color-yellow-400);
		--background-color-hover: var(--color-yellow-300);
		--box-shadow-color: var(--color-yellow-500);
		--color: var(--color-yellow-800);
		--dot-color: var(--color-yellow-500);
	`,
	finish: css`
		--background-color: var(--color-cyan-400);
		--background-color-hover: var(--color-cyan-300);
		--box-shadow-color: var(--color-cyan-500);
		--color: var(--color-cyan-800);
		--dot-color: var(--color-cyan-500);
	`,
	"check-false": css`
		--background-color: var(--color-red-400);
		--background-color-hover: var(--color-red-300);
		--box-shadow-color: var(--color-red-500);
		--color: var(--color-red-800);
		--dot-color: var(--color-red-500);
	`,
	"check-true": css`
		--background-color: var(--color-green-400);
		--background-color-hover: var(--color-green-300);
		--box-shadow-color: var(--color-green-500);
		--color: var(--color-green-800);
		--dot-color: var(--color-green-500);
	`,
};
const Instruction = styled.p`
	${({ $stepType }) => instructionVariations[$stepType]}
	white-space: pre-wrap;
	text-wrap: nowrap;
	font-weight: 400;
	line-height: 1;
	color: var(--color-grey-500);
	border-radius: 15px;
	padding: ${({ type }) =>
		type === "end" ? "0.1rem 0.8rem" : "0.4rem 0.8rem"};
	display: flex;
	align-content: center;
	justify-content: start;
	font-size: ${({ type }) => (type === "end" ? "1.4rem" : "1.4rem")};
	${({ $isActive, type }) =>
		instructionStates[`${$isActive}-${type}`] ||
		instructionStates["default"]};
`;

function isActiveInstruction(stepInstructionId, registryInstructionId) {
	console.log(stepInstructionId, registryInstructionId);
	return (
		stepInstructionId &&
		registryInstructionId &&
		(stepInstructionId.includes(registryInstructionId) ||
			(registryInstructionId.includes("e") &&
				stepInstructionId.includes(
					`i` + registryInstructionId.substring(2)
				)))
	);
}

function SortAlgorithmVisualizer({
	registry,
	input,
	stepIndex,
	passStepsLength,
	Background,
}) {
	const [localStepIndex, setCurrStepIndex] = useState(stepIndex);
	const { getState, getStep, getArrayLength, getMaxValue, getStepsLength } =
		useSortAlgorithm(registry.Class, input);
	const step = getStep(localStepIndex);
	const arrayLength = getArrayLength();
	const stepsLength = getStepsLength();
	const state = getState(localStepIndex);

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

	const indentLevel = 4;

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
						maxValue={getMaxValue()}
						blockValueDisplayThreshold={30}
					/>
				</AlgorithmContainer>
				<Instructions>
					<p>Instructions</p>
					{Object.keys(registry.instructions).map(
						(instruction, index) => {
							const { line, indent, type } =
								registry.instructions[instruction];

							const isActive = isActiveInstruction(
								step.instructionId,
								instruction
							);
							return (
								<Instruction
									$isActive={isActive ? "active" : "default"}
									type={
										instruction.includes("e")
											? "end"
											: "start"
									}
									$stepType={step.type}
								>
									{Array.from({
										length: indent * indentLevel,
									}).map(() => (
										<span> </span>
									))}
									{line}
								</Instruction>
							);
						}
					)}
				</Instructions>
			</Body>
		</Container>
	);
}

export default SortAlgorithmVisualizer;
