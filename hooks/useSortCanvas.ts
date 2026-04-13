import { useCallback, useEffect, useRef, type RefObject } from "react";
import { sortStepTypes } from "../algorithms/sort/SortAlgorithm";
import { SharedBufferAPI } from "../utils/sharedBufferAPI";
import useWorker from "./useWorker";

type SortCanvasSettings = {
    blockProportion?: number;
    upperBlockMargin?: number;
    textDisplayThreshold?: number;
};

type SortCanvasRect = Pick<DOMRectReadOnly, "width" | "height">;

type SortCanvasRenderOptions = {
    stepTypes?: typeof sortStepTypes;
};

type StepColors = Record<string, string>;

type SortCanvasApi = {
    worker: Worker | null;
    renderAlgorithm: (
        input: number[],
        options: SortCanvasRenderOptions,
        rect: SortCanvasRect
    ) => void;
    changeSettings: (settings: SortCanvasSettings) => void;
    changeSize: (parentRect: SortCanvasRect) => void;
    changeColors: (colors: StepColors) => void;
    onStatusType: (type: string, cb?: (payload: unknown) => void) => void;
};

function useSortCanvas(
    canvasRef: RefObject<HTMLCanvasElement | null>,
    id: string
): SortCanvasApi {
    const { worker, onMessageType } = useWorker("sortCanvasWorker.ts");
    const offscreenRef = useRef<OffscreenCanvas | null>(null);

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
        (settings: SortCanvasSettings) => {
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
        (parentRect: SortCanvasRect) => {
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
        (colors: StepColors) => {
            if (!worker) return;
            worker.postMessage({
                type: "load-step-colors",
                payload: { stepColors: colors },
            });
        },
        [worker]
    );

    const renderAlgorithm = useCallback(
        (
            input: number[],
            options: SortCanvasRenderOptions,
            rect: SortCanvasRect
        ): void => {
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

function getDevicePixelRatio(): number {
    const dpr = window.devicePixelRatio;
    return dpr || 1;
}

function getCssVar(name: string): string {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
}

function getStepColors(): StepColors {
    const stepColors: StepColors = {};
    for (const type of sortStepTypes) {
        stepColors[type] = getCssVar(`--color-step-${type}`);
    }
    return stepColors;
}

export default useSortCanvas;
