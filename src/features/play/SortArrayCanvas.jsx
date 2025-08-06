import React, { useRef, useEffect } from "react";
import useSortCanvas from "../../hooks/useSortCanvas";
import useRateLimit from "../../hooks/useRateLimit";

function SortArrayCanvas({
	id,
	input,
	stepIndex,
	blockProportion = 0.8,
	parentRect,
	passStepsLength,
	stepTypes,
	// ref: passedRef,
}) {
	const canvasRef = useRef();
	const canvasApi = useSortCanvas(id, input, stepTypes, canvasRef);
	const {
		drawCanvas,
		changeSettings,
		changeSize,
		resetAlgorithm,
		changeStepTypes,
		stepsLength,
	} = canvasApi;

	useEffect(() => {
		drawCanvas(stepIndex);
	}, [drawCanvas, stepIndex]);

	useEffect(() => {
		changeSettings({ blockProportion });
	}, [blockProportion, changeSettings]);

	const resize = () => changeSize(parentRect);
	const rateLimitedChangeSize = useRateLimit(resize, 100);

	useEffect(() => {
		if (parentRect?.width && parentRect?.height) {
			rateLimitedChangeSize(parentRect);
		}
	}, [parentRect, rateLimitedChangeSize]);

	useEffect(() => {
		console.log(stepsLength);
		passStepsLength(stepsLength);
	}, [passStepsLength, stepsLength]);

	useEffect(() => {
		console.log(stepTypes);
		resetAlgorithm(input, { stepTypes });
	}, [stepTypes, resetAlgorithm, input]);

	return (
		<canvas
			ref={canvasRef}
			style={{
				width: "100%",
				height: "100%",
				display: "block",
				position: "absolute",
			}}
		/>
	);
}

export default SortArrayCanvas;
