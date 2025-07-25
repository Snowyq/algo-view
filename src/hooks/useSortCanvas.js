import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useSortCanvas
 *
 * Custom React hook for initializing and managing an OffscreenCanvas via Web Worker
 * for a sorting algorithm visualization.
 *
 * Responsibilities:
 * - Mounts and initializes the algorithm in a Web Worker.
 * - Transfers control of a canvas element to OffscreenCanvas.
 * - Sends draw, resize, and settings events to the worker.
 * - Tracks loading and error states.
 *
 * @param {string} id - Identifier for the sorting algorithm
 * @param {number[]} input - Input array to be sorted
 * @param {object} canvasRef - Ref to the target <canvas> element
 *
 * @returns {{
 *   drawCanvas: (stepIndex: number) => void,
 *   changeSettings: (settings: object) => void,
 *   changeSize: (DOMRect) => void,
 *   isLoading: boolean,
 *   error: string
 * }}
 */

function useSortCanvas(id, input, canvasRef) {
	const [worker, setWorker] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	const offscreenRef = useRef(null);

	/* -------------------------------------------------------------------------- */
	/*                                   Effects                                  */
	/* -------------------------------------------------------------------------- */

	/* -------------------------- Initialize Web Worker ------------------------- */
	useEffect(() => {
		// creating Web Worker Instance
		const myWorker = new Worker(
			new URL("../workers/sortCanvasWorker.js", import.meta.url),
			{ type: "module" }
		);

		// handling responses from Worker
		myWorker.onmessage = function (event) {
			const { type, message } = event.data;

			// after first drawing disabling loading state
			if (type === "ready") {
				setIsLoading(false);
				setError("");
			}
			if (type === "error") setError(message);
		};

		// Initialize Algorithm
		myWorker.postMessage({ type: "mount", payload: { id } });
		myWorker.postMessage({ type: "init", payload: { input } });

		// saving worker in state
		setWorker(myWorker);

		return () => {
			myWorker.terminate();
		};
	}, [id, input, canvasRef]);

	/* ----------------------- Initialize Offscreen Canvas ---------------------- */
	useEffect(() => {
		if (!offscreenRef.current && worker) {
			const canvas = canvasRef.current;
			const offscreen = canvas.transferControlToOffscreen();

			worker.postMessage({ type: "init-canvas", canvas: offscreen }, [
				offscreen,
			]);

			// Prevents ...
			offscreenRef.current = offscreen;
		}
	}, [offscreenRef, canvasRef, worker]);

	/* -------------------------------------------------------------------------- */
	/*                                 Callbacks                                  */
	/* -------------------------------------------------------------------------- */

	/**
	 * drawCanvas
	 * trigger creation of algorithm display state based on given step index
	 */
	const drawCanvas = useCallback(
		stepIndex => {
			if (!worker) return;
			worker.postMessage({ type: "draw-canvas", payload: { stepIndex } });
		},
		[worker]
	);

	/**
	 * changeSettings
	 */
	const changeSettings = useCallback(
		settings => {
			if (!worker) return;
			worker.postMessage({ type: "settings", payload: settings });
		},
		[worker]
	);

	/**
	 * changeSize
	 * trigger Canvas resize to given width and height
	 */
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
