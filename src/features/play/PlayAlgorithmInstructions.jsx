import { useMemo } from "react";
import styled, { css } from "styled-components";

const Instructions = styled.div`
	width: 100%;
`;

const instructionStates = {
	"active-start": css`
		/* background-color: var(--background-color);
		box-shadow: 3px 3px 0px 1px var(--box-shadow-color); */
		color: var(--color);
		/* margin: 0.5rem 0; */
	`,
	"active-end": css`
		/* background-color: var(--background-color-hover);
		box-shadow: 3px 3px 0px 1px var(--background-color); */
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
const Instruction = styled.div`
	position: relative;
	${({ $stepType }) => instructionVariations[$stepType]}
	white-space: pre-wrap;
	text-wrap: nowrap;
	font-weight: 600;
	line-height: 1;
	color: var(--color-grey-500);
	border-radius: 15px;
	z-index: 1;

	display: flex;
	align-content: center;
	justify-content: start;
	/* font-size: ${({ type }) => (type === "end" ? "1.4rem" : "1.4rem")};
	font-size: 1rem; */
	${({ status, type }) => {
		return (
			instructionStates[`${status}-${type}`] ||
			instructionStates["default"]
		);
	}};

	&::before {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		scale: 1.1;
		/* background-color: ${({ $isActive }) =>
			$isActive ? "var(--background-color)" : "transparent"}; */
	}
`;

const Line = styled.p`
	line-height: 1.1;
	scale: ${({ $isActive }) => ($isActive ? "1" : "0.8")};
`;

const LineNum = styled.span`
	display: flex;
	align-items: center;
	z-index: 1;
`;

function isActiveInstruction(stepInstructionId, registryInstructionId) {
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

function createIndent(indentLength) {
	return Array.from({ length: indentLength }).map((_, index) => (
		<span key={index}> </span>
	));
}

function generateInstructions(instructions, step, indentLevel, baseLevel) {
	return Object.keys(instructions).map((instructionId, index) => {
		const { line, indent } = instructions[instructionId];
		const isActive = isActiveInstruction(step.instructionId, instructionId);
		const status = isActive ? "active" : "default";
		const type = instructionId.includes("e") ? "end" : "start";

		return (
			<Instruction
				key={index}
				$isActive={isActive}
				status={status}
				type={type}
				$stepType={step.type}
			>
				<LineNum>{index}: </LineNum>
				{createIndent(baseLevel + indent * indentLevel)}
				<Line $isActive={isActive} type={type}>
					{line}
				</Line>
			</Instruction>
		);
	});
}

function PlayAlgorithmInstructions({
	instructions,
	step,
	indentLevel = 4,
	baseLevel = 0,
}) {
	const renderedInstructions = useMemo(() => {
		return generateInstructions(instructions, step, indentLevel, baseLevel);
	}, [instructions, step, indentLevel, baseLevel]);

	return <Instructions>{renderedInstructions}</Instructions>;
}

export default PlayAlgorithmInstructions;
