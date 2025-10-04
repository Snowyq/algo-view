import React, { useRef, useEffect } from "react";
import useSortCanvas from "../hooks/useSortCanvas";
import useRateLimit from "../hooks/useRateLimit";

function SortArrayCanvas({
	id,
	input,
	stepIndex,
	blockProportion = 0.8,
	parentRect,
	passStepsLength,
	stepTypes,
}) {
	const canvasRef = useRef();
	const canvasApi = useSortCanvas(id, input, stepTypes, canvasRef);
	const {
		drawCanvas,
		changeSettings,
		changeSize,
		resetAlgorithm,
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
		passStepsLength(stepsLength);
	}, [passStepsLength, stepsLength]);

	useEffect(() => {
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
{
	/* <SortArrayCanvas
					input={input}
					id={registry.id}
					stepIndex={stepIndex}
					parentRect={rect}
					stepTypes={stepTypes}
					passStepsLength={handlePassStepsLength}
				/> */
}
