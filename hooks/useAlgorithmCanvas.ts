import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { WorkerName } from "../algorithms/categoryData";
import { sortStepTypes } from "../algorithms/sort/SortAlgorithm";
import { SharedBufferAPI } from "../utils/sharedBufferAPI";
import useWorker from "./useWorker";

type CanvasRect = Pick<DOMRectReadOnly, "width" | "height">;

type CanvasRenderOptions = {
    stepTypes?: typeof sortStepTypes;
    [key: string]: unknown;
};

type StepColors = Record<string, string>;

type AlgorithmCanvasApi = {
    worker: Worker | null;
    renderAlgorithm: (
        input: unknown,
        options: CanvasRenderOptions,
        rect: CanvasRect
    ) => void;
    changeSize: (parentRect: CanvasRect) => void;
    changeColors: (colors: StepColors) => void;
    onStatusType: (type: string, cb?: (payload: unknown) => void) => void;
};

/*
 * Bridge to a canvas worker. Every category's worker speaks the same
 * protocol (workers/runtime/canvasWorker.ts); only the file differs.
 */
function useAlgorithmCanvas(
    canvasRef: RefObject<HTMLCanvasElement | null>,
    id: string,
    workerName: WorkerName
): AlgorithmCanvasApi {
    const { worker, onMessageType } = useWorker(workerName);
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

    const changeSize = useCallback(
        (parentRect: CanvasRect) => {
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
            input: unknown,
            options: CanvasRenderOptions,
            rect: CanvasRect
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

export function getStepColors(): StepColors {
    const stepColors: StepColors = {};
    for (const type of sortStepTypes) {
        stepColors[type] = getCssVar(`--color-step-${type}`);
    }
    stepColors.default = getCssVar("--color-step-default");
    stepColors.label = getCssVar("--color-step-label");
    // Path finding: step colors plus the grid's own materials.
    for (const type of ["frontier", "visit", "current", "path"]) {
        stepColors[type] = getCssVar(`--color-step-${type}`);
    }
    for (const kind of ["empty", "wall", "mud", "mud-dot", "start", "end"]) {
        stepColors[`path-${kind}`] = getCssVar(`--color-path-${kind}`);
    }
    // Searching: the target line.
    stepColors["find-target"] = getCssVar("--color-find-target");
    return stepColors;
}

export default useAlgorithmCanvas;
