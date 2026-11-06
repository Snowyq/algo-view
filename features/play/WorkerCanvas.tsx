import {
    JSX,
    useEffect,
    useRef,
    useState,
    type ComponentType,
    type RefObject,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
    CATEGORY_DATA,
    type CategoryId,
    type WorkerName,
} from "../../algorithms/categoryData";
import type {
    AlgorithmMetrics,
    AlgorithmRegistryItem,
} from "../../algorithms/types";
import useAlgorithmCanvas, {
    getStepColors,
} from "../../hooks/useAlgorithmCanvas";
import useOnResize from "../../hooks/useOnResize";
import useReducedMotion from "../../hooks/useReducedMotion";
import type { AppDispatch, RootState } from "../../store";
import {
    receiveBreakpointSteps,
    refreshBreakpoints,
    registerBreakpointWorker,
} from "./breakpoints";
import PixelLoader from "./pixel/canvas/PixelLoader";
import { pixelWipe } from "./pixel/fx/pixelWipe";
import { PALETTE_EVENT } from "./pixel/fx/rainbow";
import {
    decrementCanvasWorkerLoading,
    incrementCanvasWorkerLoading,
    passAlgorithmInfo,
    setCanvasWorkerReady,
} from "./playSlice";
import type { StepInfo } from "./stepLegend";

const Container = styled.div`
    position: relative;
    display: flex;
    flex: 1;
    width: 100%;
    height: 100%;
    min-height: 0;
    padding-top: 1.2rem;
`;

const Sizer = styled.div`
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;

    /* Sized to the worker's last drawing (see "resized"), never stretched,
       so a layout change clips the old picture instead of zooming it. */
    canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: block;
    }
`;

const LoaderOverlay = styled.div`
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
`;

export type VisualizerProps = {
    registry: AlgorithmRegistryItem;
    onMetricsUpdate?: (metrics: AlgorithmMetrics | null) => void;
    onStepMetricsUpdate?: (metrics: AlgorithmMetrics | null) => void;
    onStepInfoUpdate?: (info: StepInfo | null) => void;
};

type WorkerCanvasProps = VisualizerProps & {
    workerName: WorkerName;
    /** Anything structured-cloneable the worker's algorithm takes. */
    input: unknown;
    /** Extra algorithm options (e.g. which sort steps to record). */
    options?: Record<string, unknown>;
    loaderLabel: string;
};

type RenderDonePayload = { stepsLength?: number; metrics?: AlgorithmMetrics };
type StepMetricsPayload = {
    metrics?: AlgorithmMetrics;
    stepType?: string;
    instructionId?: string[];
    caption?: string;
};

/*
 * Bridge between a panel and its canvas worker: sizes the canvas, sends the
 * input on every change, reports run length and per-step counters, and
 * shows the loader while the worker computes.
 */
function WorkerCanvas({
    registry,
    workerName,
    input,
    options,
    loaderLabel,
    onMetricsUpdate,
    onStepMetricsUpdate,
    onStepInfoUpdate,
}: WorkerCanvasProps): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const reduced = useReducedMotion();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const sizerRef = useRef<HTMLDivElement | null>(null);
    const pendingLoadsRef = useRef<number>(0);
    const wasLoadingRef = useRef<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { worker, changeSize, renderAlgorithm, onStatusType, changeColors } =
        useAlgorithmCanvas(canvasRef, registry.id, workerName);

    useEffect(() => {
        const onPalette = (): void => changeColors(getStepColors());
        window.addEventListener(PALETTE_EVENT, onPalette);
        return () => window.removeEventListener(PALETTE_EVENT, onPalette);
    }, [changeColors]);

    const onResize = (ref: RefObject<HTMLDivElement | null>): void => {
        if (!ref.current) return;
        changeSize(ref.current.getBoundingClientRect());
    };
    useOnResize(onResize, sizerRef);

    useEffect((): void => {
        dispatch(setCanvasWorkerReady(Boolean(worker)));
    }, [dispatch, worker]);

    useEffect(() => {
        if (!worker) return;
        return registerBreakpointWorker(registry.id, worker);
    }, [worker, registry.id]);

    useEffect((): void => {
        if (!worker || !sizerRef.current || input == null) return;
        const rect = sizerRef.current.getBoundingClientRect();
        pendingLoadsRef.current += 1;
        dispatch(incrementCanvasWorkerLoading());
        onStepMetricsUpdate?.(null);
        renderAlgorithm(input, options ?? {}, rect);
    }, [
        input,
        options,
        worker,
        renderAlgorithm,
        dispatch,
        onStepMetricsUpdate,
    ]);

    useEffect((): void => {
        const wasLoading = wasLoadingRef.current;
        wasLoadingRef.current = isLoading;
        if (!wasLoading || isLoading || reduced || !sizerRef.current) return;
        pixelWipe(sizerRef.current, {
            mode: "reveal",
            color: "--surface",
            block: 12,
            duration: 280,
            frames: 5,
        });
    }, [isLoading, reduced]);

    useEffect((): void => {
        onStatusType("mounted", () => dispatch(setCanvasWorkerReady(true)));
        onStatusType("canvas-initialized", () =>
            dispatch(setCanvasWorkerReady(true))
        );
        onStatusType("resized", (payload) => {
            const { width, height } = (payload ?? {}) as {
                width?: number;
                height?: number;
            };
            const canvas = canvasRef.current;
            if (!canvas || !width || !height) return;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
        });
        onStatusType("render-start", () => setIsLoading(true));
        onStatusType("render-done", (payload) => {
            const { stepsLength, metrics } = (payload ??
                {}) as RenderDonePayload;
            if (typeof stepsLength === "number") {
                dispatch(
                    passAlgorithmInfo({ id: registry.id, stepsLength, metrics })
                );
            }
            onMetricsUpdate?.(metrics ?? null);
            setIsLoading(false);
            refreshBreakpoints(registry.id);
            if (pendingLoadsRef.current > 0) {
                pendingLoadsRef.current -= 1;
                dispatch(decrementCanvasWorkerLoading());
            }
        });
        onStatusType("step-metrics", (payload) => {
            if (!payload) return;
            const { metrics, stepType, instructionId, caption } =
                payload as StepMetricsPayload;
            onStepMetricsUpdate?.(metrics ?? null);
            onStepInfoUpdate?.(
                stepType
                    ? {
                          type: stepType,
                          instructionId: instructionId ?? [],
                          caption,
                      }
                    : null
            );
        });
        onStatusType("line-steps", (payload) => {
            const steps = (payload as { steps?: number[] } | undefined)?.steps;
            if (steps) receiveBreakpointSteps(registry.id, steps);
        });
    }, [
        onStatusType,
        registry,
        dispatch,
        onMetricsUpdate,
        onStepMetricsUpdate,
        onStepInfoUpdate,
    ]);

    useEffect(
        () => () => {
            const pending = pendingLoadsRef.current;
            pendingLoadsRef.current = 0;
            for (let i = 0; i < pending; i += 1) {
                dispatch(decrementCanvasWorkerLoading());
            }
        },
        [dispatch]
    );

    return (
        <Container>
            <Sizer ref={sizerRef}>
                {isLoading && (
                    <LoaderOverlay>
                        <PixelLoader label={loaderLabel} />
                    </LoaderOverlay>
                )}
                <canvas ref={canvasRef} />
            </Sizer>
        </Container>
    );
}

type OptionsSelector = (state: RootState) => Record<string, unknown>;

/** A category's panel visualizer: its input from the store, drawn by its worker. */
export function workerVisualizer(
    category: CategoryId,
    loaderLabel: string,
    selectOptions?: OptionsSelector
): ComponentType<VisualizerProps> {
    const selectInput = (state: RootState): unknown =>
        state.play.inputs[category].value;
    const selectNoOptions = (): undefined => undefined;

    function CategoryVisualizer(props: VisualizerProps): JSX.Element {
        const input = useSelector(selectInput);
        const options = useSelector(selectOptions ?? selectNoOptions);
        return (
            <WorkerCanvas
                {...props}
                workerName={CATEGORY_DATA[category].worker}
                input={input}
                options={options}
                loaderLabel={loaderLabel}
            />
        );
    }
    return CategoryVisualizer;
}
