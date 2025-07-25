import React, { useRef, useEffect } from "react";
import useSortCanvas from "../../hooks/useSortCanvas";
import useRateLimit from "../../hooks/useRateLimit";

function SortArrayCanvas({
	input,
	id,
	stepIndex,
	blockProportion = 0.8,
	parentRect,
}) {
	const ref = useRef();
	const { drawCanvas, changeSize, changeSettings, isLoading, error } =
		useSortCanvas(id, input, ref);

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

	return (
		<canvas
			ref={ref}
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
