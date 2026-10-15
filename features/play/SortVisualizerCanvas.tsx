import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

import styled from "styled-components";

import { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { SortStepType } from "../../algorithms/sort/SortAlgorithm";
import type {
    AlgorithmMetrics,
    AlgorithmRegistryItem,
} from "../../algorithms/types";
import useOnResize from "../../hooks/useOnResize";
import useSortCanvas, { getStepColors } from "../../hooks/useSortCanvas";
import { PALETTE_EVENT } from "./pixel/fx/rainbow";
import type { AppDispatch, RootState } from "../../store";
import useReducedMotion from "../../hooks/useReducedMotion";
import PixelLoader from "./pixel/canvas/PixelLoader";
import { pixelWipe } from "./pixel/fx/pixelWipe";
import {
    decrementSortWorkerLoading,
    getDefaultStepTypes,
    getInput,
    incrementSortWorkerLoading,
    passAlgorithmInfo,
    setSortWorkerReady,
} from "./playSlice";
import type { StepInfo } from "./stepLegend";

const AlgorithmContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex: 1;
    min-height: 0;
    padding-top: 1.6rem;
`;

const Sizer = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    flex: 1;
    min-height: 0;
`;

const LoaderOverlay = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    pointer-events: none;
`;

const Placeholder = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--fg-3);
    font-size: 1.4rem;
    padding: 2.4rem;
    z-index: 1;
`;

type SortVisualizerCanvasProps = {
    registry: AlgorithmRegistryItem;
    onMetricsUpdate?: (metrics: AlgorithmMetrics | null) => void;
    onStepMetricsUpdate?: (metrics: AlgorithmMetrics | null) => void;
    onStepInfoUpdate?: (info: StepInfo | null) => void;
};

type AlgorithmOptions = {
    stepTypes?: SortStepType[];
};

type RenderDonePayload = {
    stepsLength?: number;
    metrics?: AlgorithmMetrics;
};

type StepMetricsPayload = {
    metrics?: AlgorithmMetrics;
    stepType?: string;
    instructionId?: string[];
};

function SortVisualizerCanvas({
    registry,
    onMetricsUpdate,
    onStepMetricsUpdate,
    onStepInfoUpdate,
}: SortVisualizerCanvasProps): JSX.Element {
    // Contexts

    const dispatch = useDispatch<AppDispatch>();
    const stepTypes = useSelector<RootState, SortStepType[]>(
        getDefaultStepTypes
    );
    const input = useSelector<RootState, number[]>(getInput);
    const hasInput: boolean = Array.isArray(input) && input.length > 0;

    // Refs

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const sizerRef = useRef<HTMLDivElement | null>(null);

    // States

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const pendingLoadsRef = useRef<number>(0);
    const reduced = useReducedMotion();
    const wasLoadingRef = useRef<boolean>(true);

    // A finished render dissolves in from blocks instead of popping in.
    useEffect((): void => {
        const wasLoading = wasLoadingRef.current;
        wasLoadingRef.current = isLoading;
        if (!wasLoading || isLoading || reduced || !sizerRef.current) return;
        pixelWipe(sizerRef.current, {
            mode: "reveal",
            color: "--surface",
            block: 12,
            duration: 320,
            frames: 6,
        });
    }, [isLoading, reduced]);
    // Canvas API

    const algoOptions = useMemo<AlgorithmOptions>(() => {
        return { stepTypes };
    }, [stepTypes]);

    const canvasApi = useSortCanvas(canvasRef, registry.id);
    const { worker, changeSize, renderAlgorithm, onStatusType, changeColors } =
        canvasApi;

    // The palette can change at runtime (easter egg): re-read and redraw.
    useEffect(() => {
        const onPalette = (): void => changeColors(getStepColors());
        window.addEventListener(PALETTE_EVENT, onPalette);
        return () => window.removeEventListener(PALETTE_EVENT, onPalette);
    }, [changeColors]);

    const onResize = (ref: RefObject<HTMLDivElement | null>): void => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        changeSize(rect);
    };

    useOnResize(onResize, sizerRef);

    useEffect((): void => {
        dispatch(setSortWorkerReady(Boolean(worker)));
    }, [dispatch, worker]);

    useEffect((): void => {
        if (!hasInput) return;
        if (!worker) return;
        if (!sizerRef.current) return;
        const rect = sizerRef.current.getBoundingClientRect();
        pendingLoadsRef.current += 1;
        dispatch(incrementSortWorkerLoading());
        if (typeof onStepMetricsUpdate === "function") {
            onStepMetricsUpdate(null);
        }
        renderAlgorithm(input, algoOptions, rect);
    }, [
        algoOptions,
        renderAlgorithm,
        input,
        hasInput,
        worker,
        dispatch,
        onStepMetricsUpdate,
    ]);

    useEffect((): void => {
        onStatusType("mounted", () => {
            dispatch(setSortWorkerReady(true));
        });
        onStatusType("canvas-initialized", () => {
            dispatch(setSortWorkerReady(true));
        });
        onStatusType("render-start", () => {
            setIsLoading(true);
        });
        onStatusType("render-done", (payload) => {
            const { stepsLength, metrics } = (payload ||
                {}) as RenderDonePayload;
            if (typeof stepsLength === "number") {
                dispatch(
                    passAlgorithmInfo({
                        id: registry.id,
                        stepsLength,
                        metrics,
                    })
                );
            }
            if (typeof onMetricsUpdate === "function") {
                onMetricsUpdate(metrics || null);
            }
            setIsLoading(false);
            if (pendingLoadsRef.current > 0) {
                pendingLoadsRef.current -= 1;
                dispatch(decrementSortWorkerLoading());
            }
        });
        onStatusType("step-metrics", (payload) => {
            if (!payload) return;
            const { metrics, stepType, instructionId } =
                payload as StepMetricsPayload;
            if (typeof onStepMetricsUpdate === "function") {
                onStepMetricsUpdate(metrics || null);
            }
            if (typeof onStepInfoUpdate === "function") {
                onStepInfoUpdate(
                    stepType
                        ? { type: stepType, instructionId: instructionId ?? [] }
                        : null
                );
            }
        });
    }, [
        onStatusType,
        registry,
        dispatch,
        onMetricsUpdate,
        onStepMetricsUpdate,
        onStepInfoUpdate,
    ]);

    useEffect((): void | (() => void) => {
        return () => {
            if (pendingLoadsRef.current > 0) {
                const pending = pendingLoadsRef.current;
                pendingLoadsRef.current = 0;
                for (let i = 0; i < pending; i += 1) {
                    dispatch(decrementSortWorkerLoading());
                }
            }
        };
    }, [dispatch]);

    return (
        <AlgorithmContainer>
            <Sizer ref={sizerRef}>
                {hasInput && isLoading && (
                    <LoaderOverlay>
                        <PixelLoader />
                    </LoaderOverlay>
                )}
                <canvas
                    ref={canvasRef}
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        position: "absolute",
                    }}
                />
                {!hasInput && (
                    <Placeholder>
                        Pick an input in the Inspector and press Generate.
                    </Placeholder>
                )}
            </Sizer>
        </AlgorithmContainer>
    );
}

export default SortVisualizerCanvas;
