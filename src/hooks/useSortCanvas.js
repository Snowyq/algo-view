import { useCallback, useEffect, useRef, useState } from "react";
import { sortStepTypes } from "../algorithms/sort/SortAlgorithm";

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

function useSortCanvas(canvasRef, id) {
	const [worker, setWorker] = useState(null);
	const [status, setStatus] = useState("unmounted");
	// "mounted", "resized", "canvas-initialized", "colors-loaded", "settings-updated",  "draw-done", "render-done"
	const [error, setError] = useState("");

	const offscreenRef = useRef(null);

	const callbacksRef = useRef({});

	const setOnStatusType = useCallback((type, cb) => {
		callbacksRef.current[type] = typeof cb === "function" ? cb : undefined;
	}, []);
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
			const { type, message, payload } = event.data;

			function executeCallback(type) {
				const fn = callbacksRef.current[type];
				if (typeof fn === "function") {
					fn?.(payload);
				}
			}

			// after first drawing disabling loading state
			setStatus(type);

			executeCallback(type);

			if (type === "error") {
				setError(message);
			}
		};

		// Initialize Algorithm
		myWorker.postMessage({ type: "mount", payload: { id } });
		myWorker.postMessage({
			type: "load-step-colors",
			payload: { stepColors: getStepColors() },
		});

		// saving worker in state
		setWorker(myWorker);

		return () => {
			myWorker.terminate();
		};
	}, [id]);

	/* ----------------------- Initialize Offscreen Canvas ---------------------- */
	useEffect(() => {
		if (!offscreenRef.current && worker && canvasRef.current) {
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

	// const initCanvas = useCallback(
	// 	canvasRef => {
	// 		if (!offscreenRef.current && worker && canvasRef.current) {
	// 			const canvas = canvasRef.current;
	// 			const offscreen = canvas.transferControlToOffscreen();

	// 			worker.postMessage({ type: "init-canvas", canvas: offscreen }, [
	// 				offscreen,
	// 			]);

	// 			offscreenRef.current = offscreen;
	// 		}
	// 	},
	// 	[offscreenRef, worker]
	// );

	/**
	 * drawCanvas
	 * trigger creation of algorithm display state based on given step index
	 */
	const drawCanvas = useCallback(
		stepIndex => {
			if (!worker) return;
			const devicePixelRatio = getDevicePixelRatio();
			worker.postMessage({
				type: "draw-canvas",
				payload: { stepIndex, devicePixelRatio },
			});
		},
		[worker]
	);

	/**
	 * changeSettings
	 */
	const changeSettings = useCallback(
		settings => {
			if (!worker) return;
			const devicePixelRatio = getDevicePixelRatio();
			worker.postMessage({
				type: "settings",
				payload: { settings, devicePixelRatio },
			});
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
			const devicePixelRatio = getDevicePixelRatio();
			const { width, height } = parentRect;
			worker.postMessage({
				type: "resize",
				payload: { width, height, devicePixelRatio },
			});
		},
		[worker]
	);

	const changeColors = useCallback(
		colors => {
			if (!worker) return;
			worker.postMessage({
				type: "load-step-colors",
				payload: { stepColors: colors },
			});
		},
		[worker]
	);

	// const changeStepTypes = useCallback(
	// 	types => {
	// 		if (!worker) return;
	// 		worker.postMessage({
	// 			type: "update-step-types",
	// 			payload: { enabledStepTypes: types },
	// 		});
	// 	},
	// 	[worker]
	// );

	const renderAlgorithm = useCallback(
		(input, options, rect) => {
			if (!worker) return;
			const devicePixelRatio = getDevicePixelRatio();
			worker.postMessage({
				type: "render-algorithm",
				payload: { input, options, devicePixelRatio, rect },
			});
		},
		[worker]
	);

	return {
		renderAlgorithm,
		drawCanvas,
		changeSettings,
		changeSize,
		changeColors,
		status,
		error,
		onStatusType: setOnStatusType,
	};
}

/* -------------------------------------------------------------------------- */
/*                                    Utils                                   */
/* -------------------------------------------------------------------------- */

function getDevicePixelRatio() {
	const dpr = window.devicePixelRatio;
	return dpr || 1;
}

function getCssVar(name) {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();
}

function getStepColors() {
	const stepColors = {};
	for (const key in sortStepTypes) {
		const type = sortStepTypes[key];
		stepColors[type] = getCssVar(`--color-step-${type}`);
	}
	return stepColors;
}

export default useSortCanvas;
