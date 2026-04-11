import { useCallback, useEffect, useRef } from "react";
import { sortStepTypes } from "../algorithms/sort/SortAlgorithm";
import { SharedBufferAPI } from "../utils/sharedBufferAPI";
import useWorker from "./useWorker";

function useSortCanvas(canvasRef, id) {
    const { worker, onMessageType } = useWorker("sortCanvasWorker.ts");
    const offscreenRef = useRef(null);

    useEffect(() => {
        if (!worker) return;
        const sharedBuffer = SharedBufferAPI.getBuffer("step");
        worker.postMessage({ type: "mount", payload: { id, sharedBuffer } });
        worker.postMessage({
            type: "load-step-colors",
            payload: { stepColors: getStepColors() },
        });
    }, [worker, id]);

    // Initialize offscreen canvas
    useEffect(() => {
        if (!offscreenRef.current && worker && canvasRef.current) {
            const canvas = canvasRef.current;
            if (canvas.dataset?.offscreen === "true") return;
            const offscreen = canvas.transferControlToOffscreen();
            canvas.dataset.offscreen = "true";

            worker.postMessage({ type: "init-canvas", canvas: offscreen }, [
                offscreen,
            ]);

            offscreenRef.current = offscreen;
        }
    }, [offscreenRef, canvasRef, worker]);

    // Callbacks

    const changeSettings = useCallback(
        (settings) => {
            if (!worker) return;
            const devicePixelRatio = getDevicePixelRatio();
            worker.postMessage({
                type: "settings",
                payload: { settings, devicePixelRatio },
            });
        },
        [worker]
    );

    const changeSize = useCallback(
        (parentRect) => {
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
        (colors) => {
            if (!worker) return;
            worker.postMessage({
                type: "load-step-colors",
                payload: { stepColors: colors },
            });
        },
        [worker]
    );

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
        worker,
        renderAlgorithm,
        changeSettings,
        changeSize,
        changeColors,
        onStatusType: onMessageType,
    };
}

// Utils

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
