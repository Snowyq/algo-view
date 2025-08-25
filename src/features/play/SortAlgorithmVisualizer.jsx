import { useEffect, useMemo, useRef, useState } from "react";

import styled from "styled-components";

import useSortCanvas from "../../hooks/useSortCanvas";
import Loader from "../../ui/Loader";
import useOnResize from "../../hooks/useOnResize";
import { useDispatch, useSelector } from "react-redux";
import {
	getDefaultStepTypes,
	getInput,
	getStep,
	passAlgorithmInfo,
} from "./playSlice";

const AlgorithmContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	gap: 2rem;
	padding: 1rem;
	background-color: var(--color-grey-50);
	border-radius: 15px;
	@media screen and (min-width: 640px) {
		padding: 5rem;
		box-shadow: 0.2rem 0.2rem 0px 2px var(--color-grey-300);
	}
`;

const Sizer = styled.div`
	width: 100%;
	height: 100%;
	position: relative;
	overflow: hidden;
`;

function SortAlgorithmVisualizer({ registry, onStepUpdate }) {
	//
	/* -------------------------------- Contexts -------------------------------- */

	const dispatch = useDispatch();
	const stepIndex = useSelector(getStep);
	const stepTypes = useSelector(getDefaultStepTypes);
	const input = useSelector(getInput);

	/* ---------------------------------- Refs ---------------------------------- */

	const canvasRef = useRef();
	const sizerRef = useRef();

	/* --------------------------------- States --------------------------------- */

	const [isLoading, setIsLoading] = useState(true);

	/* -------------------------------- CanvasApi ------------------------------- */

	const algoOptions = useMemo(() => {
		return { stepTypes };
	}, [stepTypes]);

	const canvasApi = useSortCanvas(canvasRef, registry.id, input, algoOptions);
	const { drawCanvas, changeSize, renderAlgorithm, onStatusType } = canvasApi;

	const onResize = ref => {
		if (!ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		changeSize(rect);
	};
	useOnResize(onResize, sizerRef);

	useEffect(() => {
		setIsLoading(true);
		if (!sizerRef.current) return;
		const rect = sizerRef.current.getBoundingClientRect();
		renderAlgorithm(input, algoOptions, rect);
	}, [algoOptions, renderAlgorithm, input]);

	useEffect(() => {
		onStatusType("render-done", payload => {
			const { steps, metrics } = payload;
			if (steps && metrics) {
				dispatch(
					passAlgorithmInfo({ id: registry.id, steps, metrics })
				);
			}
			setIsLoading(false);
		});
	}, [onStatusType, onStepUpdate, registry, dispatch]);

	useEffect(() => {
		drawCanvas(stepIndex);
	}, [drawCanvas, stepIndex]);

	return (
		<AlgorithmContainer>
			<Sizer ref={sizerRef}>
				{isLoading && <Loader />}
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
