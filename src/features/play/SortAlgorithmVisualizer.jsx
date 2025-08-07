import { useContext, useEffect, useRef, useState } from "react";

import styled from "styled-components";

import SortArrayCanvas from "../../assets/SortArrayCanvas";
import { useRect } from "../../hooks/useRect";
import { PlayContext, StepContext } from "./PlayContext";
import useSortCanvas from "../../hooks/useSortCanvas";
import useRateLimit from "../../hooks/useRateLimit";

const AlgorithmContainer = styled.div`
	width: 100%;
	height: 100%;
	padding: 2rem;
	display: flex;
	gap: 2rem;
	background-color: var(--color-grey-50);
	box-shadow: 0.2rem 0.2rem 0px 2px var(--color-grey-300);
	border-radius: 15px;
`;

const Sizer = styled.div`
	width: 100%;
	height: 100%;
	position: relative;
	overflow: hidden;
`;

function SortAlgorithmVisualizer({ registry }) {
	const { algorithmInput: input } = useContext(PlayContext);
	const {
		globalStep: stepIndex,
		stepTypes,
		passStepsLength,
	} = useContext(StepContext);

	const canvasRef = useRef();
	const canvasApi = useSortCanvas(registry.id, input, stepTypes, canvasRef);
	const { drawCanvas, changeSize, resetAlgorithm, stepsLength } = canvasApi;

	const [localStepIndex, setCurrStepIndex] = useState(stepIndex);
	const { ref, rect } = useRect();

	useEffect(() => {
		drawCanvas(stepIndex);
	}, [drawCanvas, stepIndex]);

	const resize = () => changeSize(rect);
	const rateLimitedChangeSize = useRateLimit(resize, 100);

	useEffect(() => {
		if (rect?.width && rect?.height) {
			rateLimitedChangeSize(rect);
		}
	}, [rect, rateLimitedChangeSize]);

	useEffect(() => {
		passStepsLength(stepsLength, registry.id);
	}, [passStepsLength, stepsLength, registry.id]);

	useEffect(() => {
		resetAlgorithm(input, { stepTypes });
	}, [stepTypes, resetAlgorithm, input]);

	return (
		<AlgorithmContainer>
			<Sizer ref={ref}>
				<canvas
					ref={canvasRef}
					style={{
						width: "100%",
						height: "100%",
						display: "block",
						position: "absolute",
					}}
				/>
			</Sizer>
		</AlgorithmContainer>
	);
}

export default SortAlgorithmVisualizer;
