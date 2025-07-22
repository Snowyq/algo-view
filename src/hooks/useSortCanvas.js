import { useCallback, useEffect, useRef, useState } from "react";

function useSortCanvas(id, input, canvasRef) {
	const [worker, setWorker] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	const offscreenRef = useRef(null);

	useEffect(() => {
		const myWorker = new Worker(
			new URL("../workers/sortCanvasWorker.js", import.meta.url),
			{ type: "module" }
		);

		myWorker.onmessage = function (event) {
			const { type, message } = event.data;
			if (type === "ready") {
				setIsLoading(false);
				setError("");
			}
			if (type === "error") setError(message);
		};

		myWorker.postMessage({ type: "mount", payload: { id } });
		myWorker.postMessage({ type: "init", payload: { input } });

		setWorker(myWorker);

		return () => {
			myWorker.terminate();
		};
	}, [id, input, canvasRef]);

	useEffect(() => {
		if (!offscreenRef.current && worker) {
			const canvas = canvasRef.current;
			const offscreen = canvas.transferControlToOffscreen();

			worker.postMessage({ type: "init-canvas", canvas: offscreen }, [
				offscreen,
			]);
			offscreenRef.current = offscreen;
		}
	}, [offscreenRef, canvasRef, worker]);

	const drawCanvas = useCallback(
		stepIndex => {
			if (!worker) return;
			worker.postMessage({ type: "draw-canvas", payload: { stepIndex } });
		},
		[worker]
	);

	const changeSettings = useCallback(
		settings => {
			if (!worker) return;
			worker.postMessage({ type: "settings", payload: settings });
		},
		[worker]
	);

	const changeSize = useCallback(
		parentRect => {
			if (!worker) return;
			const { width, height } = parentRect;

			worker.postMessage({
				type: "resize",
				payload: { width, height },
			});
		},
		[worker]
	);

	return { drawCanvas, changeSettings, changeSize, isLoading, error };
}

export default useSortCanvas;
